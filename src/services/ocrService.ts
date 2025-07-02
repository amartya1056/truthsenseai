// OCR and text extraction service for documents and images
// In production, this would use services like Tesseract.js, Google Vision API, or similar

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(file);
    } else if (file.type.startsWith('image/')) {
      return await extractTextFromImage(file);
    } else if (file.type.startsWith('text/')) {
      return await extractTextFromTextFile(file);
    }
    
    return '';
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
};

// Extract text from PDF files
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // In production, you would use a library like pdf-parse or PDF.js
    // For now, we'll return a placeholder
    const fileName = file.name;
    return `[PDF Content from ${fileName}] - Text extraction would be implemented here using pdf-parse or similar library. This PDF contains ${Math.floor(file.size / 1000)}KB of content that would be analyzed for misinformation.`;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
};

// Extract text from images using OCR
const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    // In production, you would use Tesseract.js or Google Vision API
    // For now, we'll return a placeholder
    const fileName = file.name;
    return `[Image OCR from ${fileName}] - OCR text extraction would be implemented here using Tesseract.js or Google Vision API. This image would be analyzed for any text content and potential misinformation.`;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return '';
  }
};

// Extract text from plain text files
const extractTextFromTextFile = async (file: File): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Error reading text file:', error);
    return '';
  }
};

// Analyze extracted text for key information
export const analyzeExtractedText = (text: string): {
  keyPhrases: string[];
  claims: string[];
  entities: string[];
} => {
  // Simple text analysis - in production, you'd use NLP libraries
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Extract potential claims (sentences with certain keywords)
  const claimKeywords = ['claim', 'assert', 'state', 'declare', 'prove', 'show', 'demonstrate'];
  const claims = sentences.filter(sentence => 
    claimKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword)
    )
  ).slice(0, 5);

  // Extract key phrases (simple approach)
  const words = text.toLowerCase().split(/\W+/);
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];
  const keyWords = words
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .reduce((acc: {[key: string]: number}, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
  
  const keyPhrases = Object.entries(keyWords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  // Simple entity extraction (would use NER in production)
  const entities = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g)?.slice(0, 5) || [];

  return {
    keyPhrases,
    claims,
    entities
  };
};