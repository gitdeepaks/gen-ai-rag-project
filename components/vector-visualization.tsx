"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Zap, Database, TrendingUp } from "lucide-react"
import { vectorStore } from "@/lib/vector-store"
import { useEffect, useState } from "react"

interface VectorStats {
  documentCount: number
  totalTokens: number
  averageTokensPerDoc: number
  vectorDimensions: number
}

export function VectorVisualization() {
  const [stats, setStats] = useState<VectorStats>({
    documentCount: 0,
    totalTokens: 0,
    averageTokensPerDoc: 0,
    vectorDimensions: 100,
  })

  useEffect(() => {
    const updateStats = () => {
      setStats(vectorStore.getStats())
    }

    updateStats()
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vector Store</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.documentCount}</div>
          <p className="text-xs text-muted-foreground">Documents indexed</p>
          <div className="mt-2">
            <Progress value={(stats.documentCount / 100) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Token Count</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total tokens processed</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Avg: {stats.averageTokensPerDoc} tokens/doc
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vector Dimensions</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.vectorDimensions}D</div>
          <p className="text-xs text-muted-foreground">Embedding space</p>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              TF-IDF Based
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Search Ready</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.documentCount > 0 ? "Ready" : "Empty"}</div>
          <p className="text-xs text-muted-foreground">
            {stats.documentCount > 0 ? "Semantic search available" : "Add documents to enable search"}
          </p>
          <div className="mt-2">
            <Badge variant={stats.documentCount > 0 ? "default" : "secondary"} className="text-xs">
              {stats.documentCount > 0 ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
