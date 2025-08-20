"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Globe, Upload, Trash2, Eye, Edit, Search, Calendar, FileIcon as FileSize, Hash } from "lucide-react"

interface Document {
  id: string
  name: string
  type: "text" | "file" | "website"
  content: string
  size?: number
  indexed: boolean
}

interface DocumentManagerProps {
  documents: Document[]
  onRemoveDocument: (id: string) => void
  onUpdateDocument: (id: string, name: string, content: string) => void
}

export function DocumentManager({ documents, onRemoveDocument, onUpdateDocument }: DocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [editName, setEditName] = useState("")
  const [editContent, setEditContent] = useState("")

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc)
    setEditName(doc.name)
    setEditContent(doc.content)
  }

  const handleSaveEdit = () => {
    if (editingDocument) {
      onUpdateDocument(editingDocument.id, editName, editContent)
      setEditingDocument(null)
      setEditName("")
      setEditContent("")
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "file":
        return <Upload className="h-4 w-4" />
      case "website":
        return <Globe className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).length
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Document Management</span>
          <Badge variant="outline">{documents.length} documents</Badge>
        </CardTitle>
        <CardDescription>Manage and explore your indexed documents</CardDescription>

        {/* Search Bar */}
        <div className="flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchQuery ? "No documents match your search." : "No documents added yet."}
              </p>
            ) : (
              filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                  {/* Document Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getDocumentIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {getWordCount(doc.content)} words
                          </span>
                          {doc.size && (
                            <span className="flex items-center gap-1">
                              <FileSize className="h-3 w-3" />
                              {formatFileSize(doc.size)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {doc.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.indexed ? "default" : "secondary"} className="text-xs">
                        {doc.indexed ? "Indexed" : "Processing"}
                      </Badge>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="bg-muted/30 rounded p-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {doc.content.substring(0, 150)}
                      {doc.content.length > 150 && "..."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getDocumentIcon(doc.type)}
                            {doc.name}
                          </DialogTitle>
                          <DialogDescription>Document details and full content</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-xs text-muted-foreground">Type</Label>
                              <p className="capitalize">{doc.type}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Word Count</Label>
                              <p>{getWordCount(doc.content)}</p>
                            </div>
                            {doc.size && (
                              <div>
                                <Label className="text-xs text-muted-foreground">File Size</Label>
                                <p>{formatFileSize(doc.size)}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs text-muted-foreground">Status</Label>
                              <Badge variant={doc.indexed ? "default" : "secondary"} className="text-xs">
                                {doc.indexed ? "Indexed" : "Processing"}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Content</Label>
                            <ScrollArea className="h-64 mt-2">
                              <div className="bg-muted/30 rounded p-3">
                                <p className="text-sm whitespace-pre-wrap">{doc.content}</p>
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditDocument(doc)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Document</DialogTitle>
                          <DialogDescription>Modify the document name and content</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Document Name</Label>
                            <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="edit-content">Content</Label>
                            <Textarea
                              id="edit-content"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={10}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingDocument(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveEdit}>Save Changes</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveDocument(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
