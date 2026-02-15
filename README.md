# ToS-LLM

AI-powered Terms of Service & Privacy Policy risk analyzer. Exposing hidden legal traps in seconds.

## 📄 Overview

TermsInShort is a web application that uses advanced language models to analyze Terms of Service and Privacy Policies and highlight potentially risky clauses.

Instead of reading thousands of lines of legal jargon, users can:
- Paste raw legal text
- Upload a PDF
- Provide a website URL

And receive a structured legal risk analysis with scoring and expert-style insights.

## 🚀 Features

- 🔎 **AI-based legal clause analysis** - Advanced NLP for detecting risky patterns
- 📊 **Risk scoring system (0–100)** - Quantified risk assessment
- ⚠️ **Detection of high-risk legal patterns** - Identifies problematic clauses
- 📄 **PDF document upload support** - Direct document analysis
- 🌐 **URL-based policy scanning** - Website policy analysis
- 🗑️ **Multi-language policy support** - Supports multiple languages
- 💾 **Document comparison** - Compare multiple policies
- 📊 **Detailed reports** - Comprehensive analysis export

## 🎨 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Vercel Serverless Functions
- OpenRouter AI

### AI Model
- Llama 3 70B / GPT-4 (via OpenRouter)

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16
- npm or yarn

### Installation

```bash
git clone https://github.com/VEDANTPARAB404/tos_llm.git
cd tos_llm
```

### Environment Setup

Create `.env` file:
```
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Running Locally

```bash
npm install
npm run dev
```

Note: For local development with the API route, use `vercel dev` or deploy to Vercel.

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add `OPENROUTER_API_KEY` to Environment Variables in Vercel dashboard
4. Deploy!

The `/api/analyze` endpoint will be automatically available as a serverless function.

## ⚠️ Disclaimer

This application provides AI-generated analysis for informational purposes only and does not constitute legal advice.

## 📱 Author

Vedant Parab - Made with ❤️ by Ved.

## 📍 Future Improvements

- Deterministic clause classification engine
- Weighted risk scoring algorithm
- Browser extension version
- Multi-language policy support
- Document comparison
- Advanced filtering options
