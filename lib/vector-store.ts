// Vector storage utilities for RAG application
export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    name: string;
    type: 'text' | 'file' | 'website';
    size?: number;
    timestamp: Date;
  };
}

export interface SearchResult {
  document: VectorDocument;
  similarity: number;
}

// Simple cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate embedding');
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.warn(
      '[RAG] OpenAI embedding failed, using TF-IDF fallback:',
      error
    );
    return textToVector(text);
  }
}

// Simple text-to-vector conversion (TF-IDF-like approach)
function textToVector(text: string): number[] {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq: Record<string, number> = {};

  // Count word frequencies
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Create a simple 100-dimensional vector based on common words
  const commonWords = [
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'up',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'among',
    'within',
    'without',
    'under',
    'over',
    'across',
    'behind',
    'beyond',
    'beside',
    'data',
    'information',
    'system',
    'process',
    'method',
    'result',
    'analysis',
    'research',
    'study',
    'report',
    'document',
    'content',
    'text',
    'file',
    'website',
    'application',
    'software',
    'technology',
    'computer',
    'digital',
    'online',
    'internet',
    'web',
    'database',
    'algorithm',
    'model',
    'machine',
    'learning',
    'artificial',
    'intelligence',
    'neural',
    'network',
    'deep',
    'training',
    'prediction',
    'classification',
    'feature',
    'pattern',
    'recognition',
    'natural',
    'language',
    'processing',
    'semantic',
    'similarity',
    'vector',
    'embedding',
    'retrieval',
    'generation',
    'query',
    'search',
    'index',
    'knowledge',
    'base',
    'repository',
    'storage',
    'memory',
    'cache',
    'optimization',
    'performance',
    'efficiency',
    'accuracy',
    'precision',
    'recall',
    'evaluation',
    'metric',
    'score',
    'threshold',
    'parameter',
    'configuration',
    'setting',
    'option',
    'choice',
  ];

  const vector = commonWords.map((word) => {
    const freq = wordFreq[word] || 0;
    return freq / words.length; // Normalize by document length
  });

  // Pad or truncate to exactly 100 dimensions
  while (vector.length < 100) vector.push(0);
  return vector.slice(0, 100);
}

export class VectorStore {
  private documents: VectorDocument[] = [];

  async addDocument(
    id: string,
    content: string,
    metadata: VectorDocument['metadata']
  ): Promise<VectorDocument> {
    const embedding = await generateEmbedding(content);
    const vectorDoc: VectorDocument = {
      id,
      content,
      embedding,
      metadata,
    };

    // Remove existing document with same ID
    this.documents = this.documents.filter((doc) => doc.id !== id);
    this.documents.push(vectorDoc);

    return vectorDoc;
  }

  // Remove document from vector store
  removeDocument(id: string): boolean {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter((doc) => doc.id !== id);
    return this.documents.length < initialLength;
  }

  async search(query: string, topK = 5): Promise<SearchResult[]> {
    if (this.documents.length === 0) return [];

    const queryVector = await generateEmbedding(query);

    const results = this.documents.map((doc) => ({
      document: doc,
      similarity: cosineSimilarity(queryVector, doc.embedding),
    }));

    // Sort by similarity (highest first) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter((result) => result.similarity > 0.1); // Filter out very low similarity
  }

  // Get all documents
  getAllDocuments(): VectorDocument[] {
    return [...this.documents];
  }

  // Get document count
  getDocumentCount(): number {
    return this.documents.length;
  }

  // Get storage statistics
  getStats() {
    const totalTokens = this.documents.reduce(
      (sum, doc) => sum + (doc.content.match(/\b\w+\b/g)?.length || 0),
      0
    );

    return {
      documentCount: this.documents.length,
      totalTokens,
      averageTokensPerDoc:
        this.documents.length > 0
          ? Math.round(totalTokens / this.documents.length)
          : 0,
      vectorDimensions:
        this.documents.length > 0 ? this.documents[0].embedding.length : 1536, // OpenAI embedding dimension
    };
  }
}

// Global vector store instance
export const vectorStore = new VectorStore();
