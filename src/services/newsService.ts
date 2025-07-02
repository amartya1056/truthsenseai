import axios from 'axios';

// API Keys
const MEDIASTACK_API_KEY = 'd21fb6eafc06217c4f782923907ebba8';
const SERPAPI_KEY = '772d117d9a971777fadf11a9a571237bfe70af99b5d2a08f99b736b77761340a';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
  image?: string;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  position: number;
  date?: string;
}

export interface NewsContext {
  articles: NewsArticle[];
  searchResults: SearchResult[];
  credibleSources: string[];
  formattedContext: string;
}

// Extract keywords from user query for better search
const extractKeywords = (query: string): string[] => {
  const stopWords = ['is', 'are', 'was', 'were', 'what', 'when', 'where', 'who', 'why', 'how', 'can', 'could', 'would', 'should', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'true', 'false', 'real', 'fake', 'check', 'verify', 'claim'];
  
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  return words.slice(0, 5);
};

// Create search query from user input
const createSearchQuery = (query: string): string => {
  const keywords = extractKeywords(query);
  return keywords.join(' ');
};

// Fetch live news from MediaStack API
export const fetchNewsArticles = async (query: string): Promise<NewsArticle[]> => {
  try {
    const searchQuery = createSearchQuery(query);
    console.log('Fetching MediaStack news for query:', searchQuery);
    
    const response = await axios.get('/api/mediastack/v1/news', {
      params: {
        access_key: MEDIASTACK_API_KEY,
        keywords: searchQuery,
        limit: 10,
        sort: 'published_desc',
        languages: 'en',
        countries: 'us,gb,ca,au'
      },
      timeout: 10000
    });

    console.log('MediaStack API response:', response.data);

    if (response.data && response.data.data) {
      const articles: NewsArticle[] = response.data.data
        .filter((article: any) => article.title && article.url && article.source)
        .map((article: any) => ({
          title: article.title,
          description: article.description || article.title,
          url: article.url,
          source: article.source,
          publishedAt: article.published_at,
          category: article.category,
          image: article.image
        }));

      console.log('Processed MediaStack articles:', articles.length);
      return articles;
    }

    return [];
  } catch (error) {
    console.error('MediaStack API error:', error);
    
    // If MediaStack fails, return empty array - don't use mock data
    return [];
  }
};

// Fetch search results using SerpAPI with proper Google search
export const fetchSearchResults = async (query: string): Promise<SearchResult[]> => {
  try {
    const searchQuery = createSearchQuery(query);
    console.log('Fetching SerpAPI results for:', searchQuery);
    
    const response = await axios.get('/api/serpapi/search', {
      params: {
        engine: 'google',
        q: searchQuery,
        api_key: SERPAPI_KEY,
        num: 10,
        gl: 'us',
        hl: 'en'
      },
      timeout: 10000
    });

    console.log('SerpAPI response:', response.data);

    if (response.data && response.data.organic_results) {
      const results: SearchResult[] = response.data.organic_results
        .filter((result: any) => result.title && result.link && result.snippet)
        .map((result: any, index: number) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          source: extractDomain(result.link),
          position: index + 1,
          date: result.date || new Date().toISOString()
        }));

      console.log('Processed SerpAPI results:', results.length);
      return results;
    }

    return [];
  } catch (error) {
    console.error('SerpAPI error:', error);
    
    // If SerpAPI fails, return empty array - don't use mock data
    return [];
  }
};

// Extract domain from URL for source identification
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown';
  }
};

// Enhanced source credibility scoring based on actual domains
const getSourceCredibilityScore = (source: string): number => {
  const sourceKey = source.toLowerCase();
  
  // Tier 1: Highest credibility fact-checkers and news agencies (Score: 5)
  const tier1Sources = [
    'reuters.com', 'apnews.com', 'bbc.com', 'factcheck.org', 
    'snopes.com', 'politifact.com', 'who.int', 'cdc.gov'
  ];
  
  // Tier 2: Major newspapers and established media (Score: 4)
  const tier2Sources = [
    'nytimes.com', 'washingtonpost.com', 'wsj.com', 'theguardian.com',
    'npr.org', 'pbs.org'
  ];
  
  // Tier 3: Cable news and major outlets (Score: 3)
  const tier3Sources = [
    'cnn.com', 'abcnews.go.com', 'cbsnews.com', 'nbcnews.com',
    'bloomberg.com'
  ];
  
  // Tier 4: Other news sources (Score: 2)
  const tier4Sources = [
    'newsweek.com', 'forbes.com', 'huffpost.com', 'axios.com'
  ];
  
  if (tier1Sources.some(s => sourceKey.includes(s))) return 5;
  if (tier2Sources.some(s => sourceKey.includes(s))) return 4;
  if (tier3Sources.some(s => sourceKey.includes(s))) return 3;
  if (tier4Sources.some(s => sourceKey.includes(s))) return 2;
  return 1;
};

// Get top credible sources from actual API results only
export const getTopCredibleSources = (articles: NewsArticle[], searchResults: SearchResult[]): string[] => {
  const allSources: { url: string; credibility: number; date?: string }[] = [];
  
  // Add news articles from MediaStack
  articles.forEach(article => {
    if (article.url && article.title) {
      allSources.push({
        url: article.url,
        credibility: getSourceCredibilityScore(article.source),
        date: article.publishedAt
      });
    }
  });
  
  // Add search results from SerpAPI
  searchResults.forEach(result => {
    if (result.link && result.title) {
      allSources.push({
        url: result.link,
        credibility: getSourceCredibilityScore(result.source),
        date: result.date
      });
    }
  });
  
  // Sort by credibility first, then by recency, remove duplicates
  const uniqueSources = allSources
    .sort((a, b) => {
      if (b.credibility !== a.credibility) {
        return b.credibility - a.credibility;
      }
      // If same credibility, sort by date (newer first)
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    })
    .filter((source, index, self) => 
      index === self.findIndex(s => s.url === source.url)
    )
    .slice(0, 5);
  
  return uniqueSources.map(s => s.url);
};

// Create formatted context for Gemini using only real API data
const createFormattedContext = (articles: NewsArticle[], searchResults: SearchResult[]): string => {
  let context = '';
  
  if (articles.length > 0) {
    context += '## LIVE NEWS ARTICLES (MediaStack API):\n\n';
    articles.slice(0, 5).forEach((article, index) => {
      context += `**${index + 1}. ${article.title}**\n`;
      context += `- Source: ${article.source}\n`;
      context += `- Published: ${new Date(article.publishedAt).toLocaleDateString()}\n`;
      context += `- Description: ${article.description}\n`;
      context += `- URL: ${article.url}\n\n`;
    });
  }
  
  if (searchResults.length > 0) {
    context += '## LIVE SEARCH RESULTS (SerpAPI):\n\n';
    searchResults.slice(0, 5).forEach((result, index) => {
      context += `**${index + 1}. ${result.title}**\n`;
      context += `- Source: ${result.source}\n`;
      if (result.date) {
        context += `- Date: ${new Date(result.date).toLocaleDateString()}\n`;
      }
      context += `- Summary: ${result.snippet}\n`;
      context += `- URL: ${result.link}\n\n`;
    });
  }
  
  if (articles.length === 0 && searchResults.length === 0) {
    context = '## NO LIVE DATA AVAILABLE\n\nBoth MediaStack and SerpAPI returned no results for this query. Analysis will be based on general knowledge only.\n\n';
  }
  
  return context;
};

// Fetch comprehensive news context using only real API data
export const fetchNewsContext = async (query: string): Promise<NewsContext> => {
  try {
    console.log('Fetching live news context for:', query);
    
    const [articles, searchResults] = await Promise.all([
      fetchNewsArticles(query),
      fetchSearchResults(query)
    ]);
    
    console.log('Live articles fetched:', articles.length);
    console.log('Live search results fetched:', searchResults.length);
    
    const credibleSources = getTopCredibleSources(articles, searchResults);
    const formattedContext = createFormattedContext(articles, searchResults);
    
    console.log('Top credible sources from live data:', credibleSources);
    
    return {
      articles,
      searchResults,
      credibleSources,
      formattedContext
    };
  } catch (error) {
    console.error('Error fetching live news context:', error);
    return {
      articles: [],
      searchResults: [],
      credibleSources: [],
      formattedContext: '## API ERROR\n\nUnable to retrieve live news data from MediaStack and SerpAPI. Analysis cannot be performed without real-time sources.\n\n'
    };
  }
};