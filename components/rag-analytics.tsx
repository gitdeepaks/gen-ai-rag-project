"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Brain, Zap, Target, CheckCircle, AlertCircle } from "lucide-react"
import { getRAGStats } from "@/lib/rag-pipeline"
import { useEffect, useState } from "react"

interface RAGStats {
  documentCount: number
  totalTokens: number
  averageTokensPerDoc: number
  vectorDimensions: number
  pipelineVersion: string
  features: string[]
}

interface AnalyticsProps {
  lastQueryTime?: number
  lastConfidence?: number
  totalQueries?: number
}

export function RAGAnalytics({ lastQueryTime, lastConfidence, totalQueries = 0 }: AnalyticsProps) {
  const [stats, setStats] = useState<RAGStats>({
    documentCount: 0,
    totalTokens: 0,
    averageTokensPerDoc: 0,
    vectorDimensions: 100,
    pipelineVersion: "1.0.0",
    features: [],
  })

  useEffect(() => {
    const updateStats = () => {
      setStats(getRAGStats())
    }

    updateStats()
    const interval = setInterval(updateStats, 2000)
    return () => clearInterval(interval)
  }, [])

  const getPerformanceStatus = () => {
    if (stats.documentCount === 0) return { status: "inactive", color: "secondary" }
    if (stats.documentCount < 5) return { status: "limited", color: "destructive" }
    if (stats.documentCount < 20) return { status: "good", color: "default" }
    return { status: "excellent", color: "default" }
  }

  const performanceStatus = getPerformanceStatus()

  return (
    <div className="space-y-4">
      {/* Pipeline Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats.documentCount > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium capitalize">{performanceStatus.status}</span>
            </div>
            <Badge variant={performanceStatus.color as any} className="mt-2 text-xs">
              v{stats.pipelineVersion}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastQueryTime ? `${lastQueryTime}ms` : "N/A"}</div>
            <p className="text-xs text-muted-foreground">Last query time</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {totalQueries} total queries
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastConfidence ? `${lastConfidence}%` : "N/A"}</div>
            <p className="text-xs text-muted-foreground">Last query confidence</p>
            <div className="mt-2">
              <Progress value={lastConfidence || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">RAG Pipeline Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {stats.features.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs justify-center">
                {feature}
              </Badge>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Vector Dimensions</p>
              <p className="font-medium">{stats.vectorDimensions}D</p>
            </div>
            <div>
              <p className="text-muted-foreground">Knowledge Base</p>
              <p className="font-medium">{stats.documentCount} documents</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Tokens</p>
              <p className="font-medium">{stats.totalTokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Tokens/Doc</p>
              <p className="font-medium">{stats.averageTokensPerDoc}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
