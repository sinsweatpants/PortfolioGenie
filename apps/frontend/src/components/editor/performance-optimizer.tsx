import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PerformanceOptimizerProps {
  className?: string;
  portfolioId?: string;
}

interface PerformanceReport {
  score: number;
  projectCount: number;
  averageDescriptionLength: number;
  hasLargeImages: boolean;
  customScriptBlocks: number;
  recommendations: string[];
}

export function PerformanceOptimizer({ className, portfolioId }: PerformanceOptimizerProps) {
  const { toast } = useToast();
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyze = async () => {
    if (!portfolioId) {
      toast({
        title: "Save portfolio first",
        description: "Create or load a portfolio to run the analyzer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/analysis/performance", { portfolioId });
      const data = await response.json();
      setReport(data.report);
      setAiAdvice(data.aiAdvice ?? null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis failed",
        description: "Unable to analyze performance right now.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Insights</h3>
          <p className="text-sm text-muted-foreground">Measure load health and apply AI-recommended fixes.</p>
        </div>
        <Button type="button" onClick={analyze} disabled={isLoading || !portfolioId}>
          {isLoading ? "Analyzing..." : "Run analysis"}
        </Button>
      </div>

      {report && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide">Health score</p>
                <p className="text-2xl font-semibold text-foreground">{report.score}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Projects</p>
                <p className="text-xl font-semibold text-foreground">{report.projectCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Avg. copy length</p>
                <p className="text-xl font-semibold text-foreground">{report.averageDescriptionLength} words</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Large imagery</p>
                <Badge variant={report.hasLargeImages ? "destructive" : "secondary"}>
                  {report.hasLargeImages ? "Needs optimization" : "Optimized"}
                </Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Custom scripts</p>
                <p className="text-xl font-semibold text-foreground">{report.customScriptBlocks}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick recommendations</Label>
              {report.recommendations.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {report.recommendations.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Everything looks fast!</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {aiAdvice && (
        <div className="space-y-2">
          <Label>Gemini suggestions</Label>
          <Textarea value={aiAdvice} readOnly rows={6} className="bg-muted" />
        </div>
      )}
    </div>
  );
}
