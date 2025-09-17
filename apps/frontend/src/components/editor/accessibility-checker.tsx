import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AccessibilityCheckerProps {
  className?: string;
  portfolioId?: string;
}

interface AccessibilityReport {
  score: number;
  missingAltTags: number;
  lowContrastPairs: number;
  headingIssues: number;
  notes: string[];
}

export function AccessibilityChecker({ className, portfolioId }: AccessibilityCheckerProps) {
  const { toast } = useToast();
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyze = async () => {
    if (!portfolioId) {
      toast({
        title: "Save portfolio first",
        description: "Create or load a portfolio to audit accessibility.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/analysis/accessibility", { portfolioId });
      const data = await response.json();
      setReport(data.report);
      setAiAdvice(data.aiAdvice ?? null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Audit failed",
        description: "Unable to complete the accessibility review.",
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
          <h3 className="text-lg font-semibold">Accessibility Guard</h3>
          <p className="text-sm text-muted-foreground">
            Catch contrast issues, missing alt text, and heading gaps.
          </p>
        </div>
        <Button type="button" onClick={analyze} disabled={isLoading || !portfolioId}>
          {isLoading ? "Checking..." : "Run accessibility check"}
        </Button>
      </div>

      {report && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide">Compliance score</p>
                <p className="text-2xl font-semibold text-foreground">{report.score}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Missing alt text</p>
                <Badge variant={report.missingAltTags ? "destructive" : "secondary"}>
                  {report.missingAltTags} issues
                </Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Contrast warnings</p>
                <Badge variant={report.lowContrastPairs ? "destructive" : "secondary"}>
                  {report.lowContrastPairs} pairs
                </Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Heading hierarchy</p>
                <Badge variant={report.headingIssues ? "destructive" : "secondary"}>
                  {report.headingIssues} alerts
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Actionable fixes</Label>
              {report.notes.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {report.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No major accessibility risks detected.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {aiAdvice && (
        <div className="space-y-2">
          <Label>Gemini recommendations</Label>
          <Textarea value={aiAdvice} readOnly rows={6} className="bg-muted" />
        </div>
      )}
    </div>
  );
}
