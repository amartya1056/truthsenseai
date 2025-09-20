# TruthSenseAI 🔎

TruthSenseAI is an AI-powered misinformation detection system developed for the **Google GenAI Exchange Hackathon 2025**.  
It helps users verify whether content is **True, False, Misleading, or Unverifiable** by analyzing **multi-modal inputs** including text, YouTube videos, websites, and images.

---

## ✨ Features
- **Multi-Modal Detection**: Supports text, YouTube videos, images, and website URLs.  
- **Evidence-Based Reports**: Generates structured, explainable reports with source references and identified risk factors.  
- **PDF Export**: Users can download the report in a clean PDF format.  
- **User Memory**: Stores past conversations for contextual follow-ups.  
- **Original Source Tracking**: Detects where misinformation originated and explains how to report it.

---

## 🛠️ Tech Stack
**Frontend**
- React 18, TypeScript, Vite  
- Tailwind CSS, React Router DOM, Framer Motion  
- React Hook Form for forms  

**Backend**
- Serverless Architecture  
- Google Gemini API (for claim extraction and reasoning)  
- Serp API, MediaStack API, YouTube Data API v3, OCR & Vision APIs  

**Reports**
- jsPDF, html2canvas for PDF generation  

**Deployment**
- Currently deployed on **Netlify**  
- Future plan: Deploy on **Google Cloud Functions + Firestore**

---

## ⚙️ How It Works
1. User submits content (text, link, image, or video).  
2. Frontend handles input and passes it to backend.  
3. Backend preprocesses data → extracts claims → checks with Gemini + external APIs.  
4. Results classified into **True, False, Misleading, or Unverifiable**.  
5. A detailed **PDF report** is generated with evidence and reporting guidance.  

---

## 📌 Current Limitation
Currently, the **API used for evidence retrieval and news verification is slightly outdated**, as we are relying on free or low-cost versions to keep the project accessible during hackathon development.  
The updated APIs require **paid credits or subscription access**, which limits real-time access to the freshest news sources.  

👉 In the future, we plan to **upgrade to the latest APIs** or build a hybrid system that ensures **up-to-date, trustworthy evidence retrieval**.

---

## 🚀 Future Improvements
- Move memory from local Chrome cache to **Google Firestore** for scalability.  
- Integrate **real-time news feeds** with the latest APIs.  
- Add advanced deepfake detection for image/video verification.  
- Enterprise-level deployment using **Google Cloud infrastructure**.  

---

## 👨‍💻 Contributors
- [Amartya](https://github.com/amartya1056)  
- [Nidhish](https://github.com/Nidhish021204)  
- [Ujjawal](https://github.com/ujju3010)  
- [Akshit](https://github.com/AkkySharma525)  
- [Krish](https://github.com/Batmanmait)  

---

## 📄 License
This project is open source under the [MIT License](LICENSE).  



