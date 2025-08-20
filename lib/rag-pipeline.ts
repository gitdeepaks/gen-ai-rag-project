// Complete RAG (Retrieval Augmented Generation) pipeline
import { vectorStore, type SearchResult } from './vector-store';

export interface RAGContext {
  query: string;
  retrievedDocuments: SearchResult[];
  contextWindow: string;
  confidence: number;
}

export interface RAGResponse {
  answer: string;
  context: RAGContext;
  sources: SearchResult[];
  processingTime: number;
}

// Enhanced context building with relevance scoring
function buildContext(
  searchResults: SearchResult[],
  query: string,
  maxTokens = 2000
): string {
  if (searchResults.length === 0) return '';

  let context = '';
  let tokenCount = 0;

  // Sort by similarity and build context
  const sortedResults = searchResults.sort(
    (a, b) => b.similarity - a.similarity
  );

  for (const result of sortedResults) {
    const docContent = result.document.content;
    const docTokens = docContent.split(/\s+/).length;

    // Add document if it fits within token limit
    if (tokenCount + docTokens <= maxTokens) {
      context += `\n--- From "${result.document.metadata.name}" (${Math.round(
        result.similarity * 100
      )}% relevant) ---\n`;
      context += docContent;
      context += '\n';
      tokenCount += docTokens;
    } else {
      // Add partial content if possible
      const remainingTokens = maxTokens - tokenCount;
      if (remainingTokens > 50) {
        const partialContent = docContent
          .split(/\s+/)
          .slice(0, remainingTokens)
          .join(' ');
        context += `\n--- From "${result.document.metadata.name}" (${Math.round(
          result.similarity * 100
        )}% relevant) ---\n`;
        context += partialContent + '...';
        context += '\n';
      }
      break;
    }
  }

  return context.trim();
}

async function generateAnswer(
  query: string,
  context: string,
  sources: SearchResult[]
): Promise<string> {
  if (!context || sources.length === 0) {
    return `I don't have enough information in the current document collection to answer "${query}". Please add more relevant documents or try rephrasing your question.`;
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate answer');
    }

    const data = await response.json();
    return (
      data.answer || 'I was unable to generate a response. Please try again.'
    );
  } catch (error) {
    console.error('[RAG] OpenAI chat failed:', error);

    // Fallback to simple context-based response
    const avgSimilarity =
      sources.reduce((sum, source) => sum + source.similarity, 0) /
      sources.length;
    const confidence = Math.round(avgSimilarity * 100);
    const sourceNames = sources.map((s) => s.document.metadata.name).join(', ');

    let answer = `Based on the information from ${sources.length} document(s) (${sourceNames}), here's what I found regarding "${query}":\n\n`;

    // Extract key information from context
    const sentences = context
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);
    const relevantSentences = sentences
      .filter((sentence) => {
        const queryWords = query.toLowerCase().split(/\s+/);
        const sentenceWords = sentence.toLowerCase().split(/\s+/);
        return queryWords.some((word) =>
          sentenceWords.some((sw) => sw.includes(word) || word.includes(sw))
        );
      })
      .slice(0, 5);

    if (relevantSentences.length > 0) {
      answer += relevantSentences.join('. ') + '.';
    } else {
      answer += sentences.slice(0, 3).join('. ') + '.';
    }

    answer += `\n\nThis response is based on ${sources.length} source document(s) with an average relevance score of ${confidence}%.`;

    return answer;
  }
}

export async function processRAGQuery(
  query: string,
  topK = 5
): Promise<RAGResponse> {
  const startTime = Date.now();

  try {
    // Step 1: Retrieve relevant documents using OpenAI embeddings
    const searchResults = await vectorStore.search(query, topK);

    // Step 2: Build context from retrieved documents
    const contextWindow = buildContext(searchResults, query);

    // Step 3: Calculate confidence score
    const confidence =
      searchResults.length > 0
        ? Math.round(
            (searchResults.reduce((sum, r) => sum + r.similarity, 0) /
              searchResults.length) *
              100
          )
        : 0;

    // Step 4: Generate answer using OpenAI
    const answer = await generateAnswer(query, contextWindow, searchResults);

    // Step 5: Build context object
    const context: RAGContext = {
      query,
      retrievedDocuments: searchResults,
      contextWindow,
      confidence,
    };

    const processingTime = Date.now() - startTime;

    return {
      answer,
      context,
      sources: searchResults,
      processingTime,
    };
  } catch (error) {
    console.error('RAG Pipeline Error:', error);

    return {
      answer:
        'I encountered an error while processing your query. Please try again or rephrase your question.',
      context: {
        query,
        retrievedDocuments: [],
        contextWindow: '',
        confidence: 0,
      },
      sources: [],
      processingTime: Date.now() - startTime,
    };
  }
}

// Advanced query preprocessing
export function preprocessQuery(query: string): string {
  // Remove common stop words and normalize
  const stopWords = new Set([
    'the',
    'a',
    'an',
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
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .join(' ')
    .trim();
}

// Query expansion for better retrieval
export function expandQuery(query: string): string[] {
  const baseQuery = preprocessQuery(query);
  const expansions = [baseQuery];

  // Add synonyms and related terms (simplified approach)
  const synonymMap: Record<string, string[]> = {
    data: ['information', 'content', 'facts'],
    analysis: ['examination', 'study', 'research'],
    system: ['platform', 'application', 'software'],
    process: ['method', 'procedure', 'workflow'],
    result: ['outcome', 'finding', 'conclusion'],
    document: ['file', 'text', 'content'],
    search: ['find', 'locate', 'retrieve'],
    information: ['data', 'content', 'details'],
  };

  const words = baseQuery.split(/\s+/);
  words.forEach((word) => {
    if (synonymMap[word]) {
      synonymMap[word].forEach((synonym) => {
        const expandedQuery = baseQuery.replace(word, synonym);
        if (!expansions.includes(expandedQuery)) {
          expansions.push(expandedQuery);
        }
      });
    }
  });

  return expansions;
}

// RAG pipeline statistics
export function getRAGStats() {
  const vectorStats = vectorStore.getStats();

  return {
    ...vectorStats,
    pipelineVersion: '1.0.0',
    features: [
      'TF-IDF Vectorization',
      'Cosine Similarity Search',
      'Context Window Building',
      'Confidence Scoring',
      'Query Preprocessing',
      'Source Attribution',
    ],
  };
}
