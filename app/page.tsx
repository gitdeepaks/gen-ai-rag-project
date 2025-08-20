'use client';

import type React from 'react';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, MessageSquare, BarChart3 } from 'lucide-react';
import { VectorVisualization } from '@/components/vector-visualization';
import { DocumentManager } from '@/components/document-manager';
import { RAGAnalytics } from '@/components/rag-analytics';
import { vectorStore } from '@/lib/vector-store';
import { processRAGQuery, type RAGResponse } from '@/lib/rag-pipeline';

interface Document {
  id: string;
  name: string;
  type: 'text' | 'file' | 'website';
  content: string;
  size?: number;
  indexed: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  ragResponse?: RAGResponse;
}

export default function RAGApplication() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [totalQueries, setTotalQueries] = useState(0);
  const [lastQueryTime, setLastQueryTime] = useState<number>();
  const [lastConfidence, setLastConfidence] = useState<number>();

  const addTextDocument = async () => {
    if (!textInput.trim()) return;

    const newDoc: Document = {
      id: Date.now().toString(),
      name: `Text Document ${documents.length + 1}`,
      type: 'text',
      content: textInput,
      indexed: true,
    };

    await vectorStore.addDocument(newDoc.id, newDoc.content, {
      name: newDoc.name,
      type: newDoc.type,
      timestamp: new Date(),
    });

    setDocuments((prev) => [...prev, newDoc]);
    setTextInput('');
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();

        const newDoc: Document = {
          id: Date.now().toString() + Math.random(),
          name: result.filename,
          type: 'file',
          content: result.content,
          size: result.size,
          indexed: true,
        };

        await vectorStore.addDocument(newDoc.id, newDoc.content, {
          name: newDoc.name,
          type: newDoc.type,
          size: newDoc.size,
          timestamp: new Date(),
        });

        setDocuments((prev) => [...prev, newDoc]);
      }
    } catch (error) {
      console.error('[RAG] File upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addWebsiteDocument = async () => {
    if (!websiteUrl.trim()) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape website');
      }

      const result = await response.json();

      const newDoc: Document = {
        id: Date.now().toString(),
        name: result.title || websiteUrl,
        type: 'website',
        content: result.content,
        indexed: true,
      };

      await vectorStore.addDocument(newDoc.id, newDoc.content, {
        name: newDoc.name,
        type: newDoc.type,
        timestamp: new Date(),
      });

      setDocuments((prev) => [...prev, newDoc]);
      setWebsiteUrl('');
    } catch (error) {
      console.error('[RAG] Website scraping error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeDocument = (id: string) => {
    vectorStore.removeDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const updateDocument = (id: string, name: string, content: string) => {
    // Update in vector store
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      vectorStore.addDocument(id, content, {
        name,
        type: doc.type,
        size: doc.size,
        timestamp: new Date(),
      });
    }

    // Update in local state
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, name, content } : doc))
    );
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = chatInput;
    setChatInput('');
    setIsChatProcessing(true);

    try {
      const ragResponse = await processRAGQuery(query, 5);

      // Update analytics
      setTotalQueries((prev) => prev + 1);
      setLastQueryTime(ragResponse.processingTime);
      setLastConfidence(ragResponse.context.confidence);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ragResponse.answer,
        timestamp: new Date(),
        ragResponse,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I encountered an error while processing your query. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            RAG Application
          </h1>
          <p className="text-muted-foreground text-lg">
            Retrieval Augmented Generation for intelligent document querying
          </p>
        </div>

        {/* Analytics Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              RAG Pipeline Analytics
            </CardTitle>
            <CardDescription>
              Real-time performance metrics and system status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RAGAnalytics
              lastQueryTime={lastQueryTime}
              lastConfidence={lastConfidence}
              totalQueries={totalQueries}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vector Storage Analytics</CardTitle>
            <CardDescription>
              Knowledge base statistics and indexing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VectorVisualization />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Ingestion */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Data Ingestion
                </CardTitle>
                <CardDescription>
                  Add documents to your knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text">Text Input</TabsTrigger>
                    <TabsTrigger value="file">File Upload</TabsTrigger>
                    <TabsTrigger value="website">Website</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-input">Enter Text Content</Label>
                      <Textarea
                        id="text-input"
                        placeholder="Paste your text content here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        rows={6}
                      />
                    </div>
                    <Button onClick={addTextDocument} className="w-full">
                      Add Text Document
                    </Button>
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Upload Files</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".txt,.pdf,.csv,.md"
                        onChange={handleFileUpload}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Supported formats: TXT, PDF, CSV, MD
                    </p>
                  </TabsContent>

                  <TabsContent value="website" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website-url">Website URL</Label>
                      <Input
                        id="website-url"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={addWebsiteDocument}
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Add Website Content'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <DocumentManager
              documents={documents}
              onRemoveDocument={removeDocument}
              onUpdateDocument={updateDocument}
            />
          </div>

          {/* Chat Interface */}
          <div className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  RAG Chat Interface
                </CardTitle>
                <CardDescription>
                  Query your knowledge base with enhanced retrieval
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <p className="text-muted-foreground">
                          Start a conversation by asking questions about your
                          documents.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          The RAG pipeline will retrieve relevant context and
                          generate informed responses.
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === 'user'
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            {message.ragResponse && (
                              <div className="mt-2 pt-2 border-t border-border/20">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {message.ragResponse.processingTime}ms
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {message.ragResponse.context.confidence}%
                                    confidence
                                  </Badge>
                                </div>
                                {message.ragResponse.sources.length > 0 && (
                                  <div>
                                    <p className="text-xs opacity-70 mb-1">
                                      Sources:
                                    </p>
                                    {message.ragResponse.sources.map(
                                      (source, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs mr-1 mb-1"
                                        >
                                          {source.document.metadata.name} (
                                          {Math.round(source.similarity * 100)}
                                          %)
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isChatProcessing && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                          <p className="text-sm">
                            Processing your query through the RAG pipeline...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about your documents..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && !isChatProcessing && handleChat()
                    }
                    disabled={documents.length === 0 || isChatProcessing}
                  />
                  <Button
                    onClick={handleChat}
                    disabled={
                      documents.length === 0 ||
                      !chatInput.trim() ||
                      isChatProcessing
                    }
                  >
                    {isChatProcessing ? 'Processing...' : 'Send'}
                  </Button>
                </div>
                {documents.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Add documents first to start chatting
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
