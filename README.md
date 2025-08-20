# RAG Application

A modern Retrieval Augmented Generation (RAG) application built with Next.js, React, and OpenAI APIs. This application provides intelligent document querying capabilities with real-time analytics and a beautiful user interface.

## 🚀 Features

### Core RAG Pipeline

- **Intelligent Document Retrieval**: Advanced semantic search using OpenAI embeddings
- **Context-Aware Responses**: Generate answers based on retrieved document context
- **Confidence Scoring**: Real-time confidence metrics for query responses
- **Source Attribution**: Track and display document sources for each response
- **Query Processing**: Automatic query preprocessing and expansion for better results

### Document Management

- **Multiple Input Sources**:
  - Text input for direct content entry
  - File upload support (TXT, PDF, CSV, MD)
  - Website scraping for web content ingestion
- **Document Editor**: In-place editing of document names and content
- **Search & Filter**: Advanced document search and filtering capabilities
- **Document Analytics**: Word count, file size, and indexing status tracking

### Vector Storage & Analytics

- **Vector Embeddings**: OpenAI text-embedding-3-small for semantic understanding
- **TF-IDF Fallback**: Robust fallback system when OpenAI is unavailable
- **Cosine Similarity**: Advanced similarity scoring for document retrieval
- **Real-time Statistics**: Live vector store analytics and performance metrics
- **Visual Analytics**: Interactive dashboard with performance indicators

### User Interface

- **Modern UI**: Built with Radix UI and Tailwind CSS
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Real-time Chat**: Interactive chat interface with RAG-powered responses
- **Analytics Dashboard**: Comprehensive performance and usage analytics
- **Document Visualization**: Visual representation of vector store statistics

### Performance Features

- **Query Performance Tracking**: Real-time query processing time monitoring
- **Confidence Metrics**: Confidence scoring for response quality assessment
- **Processing Status**: Real-time status indicators for all operations
- **Error Handling**: Robust error handling with fallback mechanisms

## 🛠️ Technology Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with modern features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library

### Backend & AI

- **OpenAI API**: GPT-4o-mini for chat completions
- **OpenAI Embeddings**: text-embedding-3-small for vector generation
- **Vector Storage**: Custom in-memory vector store with cosine similarity
- **File Processing**: Multi-format file upload and processing
- **Web Scraping**: HTML content extraction from websites

### Development Tools

- **Bun Runtime**: Fast JavaScript runtime
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization

## 📁 Project Structure

```
rag-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # OpenAI chat completions
│   │   ├── embeddings/    # OpenAI embeddings
│   │   ├── scrape/        # Website scraping
│   │   └── upload/        # File upload processing
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── document-manager.tsx    # Document management interface
│   ├── rag-analytics.tsx      # Analytics dashboard
│   └── vector-visualization.tsx # Vector store visualization
├── lib/                  # Core libraries
│   ├── rag-pipeline.ts   # RAG processing logic
│   ├── vector-store.ts   # Vector storage implementation
│   └── utils.ts          # Utility functions
└── hooks/                # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rag-app
   ```

2. **Install dependencies**

   ```bash
   # Using Bun (recommended)
   bun install

   # Using npm
   npm install

   # Using pnpm
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**

   ```bash
   # Using Bun
   bun dev

   # Using npm
   npm run dev

   # Using pnpm
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Adding Documents

1. **Text Input**: Paste text content directly into the text input tab
2. **File Upload**: Upload supported file formats (TXT, PDF, CSV, MD)
3. **Website Scraping**: Enter a URL to scrape and index web content

### Querying Your Knowledge Base

1. **Start a Conversation**: Use the chat interface to ask questions
2. **View Sources**: Each response shows the source documents used
3. **Check Confidence**: Monitor confidence scores for response quality
4. **Track Performance**: View real-time analytics and processing times

### Managing Documents

1. **Search Documents**: Use the search bar to find specific documents
2. **Edit Content**: Click the edit button to modify document content
3. **View Details**: Open the view dialog to see full document information
4. **Delete Documents**: Remove documents from your knowledge base

## 🔧 Configuration

### OpenAI API Configuration

The application uses OpenAI's API for:

- **Chat Completions**: GPT-4o-mini model for generating responses
- **Embeddings**: text-embedding-3-small model for vector generation

### Vector Store Configuration

- **Embedding Dimensions**: 1536 dimensions (OpenAI) or 100 dimensions (TF-IDF fallback)
- **Similarity Threshold**: 0.1 minimum similarity for document retrieval
- **Top-K Results**: Configurable number of top results (default: 5)

### Performance Settings

- **Context Window**: 2000 tokens maximum for context building
- **Query Processing**: Real-time processing with fallback mechanisms
- **Analytics Update**: 1-2 second intervals for live statistics

## 📊 Analytics & Monitoring

### RAG Pipeline Analytics

- **Pipeline Status**: Real-time pipeline health monitoring
- **Query Performance**: Processing time tracking
- **Confidence Scoring**: Response quality assessment
- **Feature Tracking**: Active RAG pipeline features

### Vector Store Analytics

- **Document Count**: Total indexed documents
- **Token Statistics**: Total and average tokens per document
- **Vector Dimensions**: Current embedding space configuration
- **Search Readiness**: System availability status

## 🔒 Security & Privacy

- **API Key Management**: Secure OpenAI API key handling
- **File Upload Security**: Safe file processing and validation
- **Error Handling**: Graceful error handling without data exposure
- **Input Validation**: Comprehensive input sanitization

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds

### Docker Deployment

```bash
# Build the Docker image
docker build -t rag-app .

# Run the container
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key rag-app
```

## 🙏 Acknowledgments

- OpenAI for providing the AI APIs
- Next.js team for the excellent framework
- Radix UI for accessible component primitives
- Tailwind CSS for the utility-first styling approach

---
