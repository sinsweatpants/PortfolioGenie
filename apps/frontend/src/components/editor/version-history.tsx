import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PortfolioVersion } from "@shared/schema";
import { useState } from "react";

interface VersionHistoryProps {
  className?: string;
  portfolioId?: string;
  onReverted?: () => void;
}

export function VersionHistory({ className, portfolioId, onReverted }: VersionHistoryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const { data: versions, isFetching } = useQuery<PortfolioVersion[]>({
    queryKey: ["/api/portfolios", portfolioId, "versions"],
    enabled: Boolean(portfolioId),
  });

  const createVersion = useMutation({
    mutationFn: async () => {
      if (!portfolioId) {
        throw new Error("Missing portfolio id");
      }
      const response = await apiRequest("POST", `/api/portfolios/${portfolioId}/versions`, {
        title: title || undefined,
        summary: summary || undefined,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Snapshot saved" });
      setTitle("");
      setSummary("");
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", portfolioId, "versions"] });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Could not save snapshot",
        description: "Ensure the portfolio is saved and try again.",
        variant: "destructive",
      });
    },
  });

  const revertVersion = useMutation({
    mutationFn: async (versionId: string) => {
      if (!portfolioId) {
        throw new Error("Missing portfolio id");
      }
      const response = await apiRequest("POST", `/api/portfolios/${portfolioId}/versions/${versionId}/revert`);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Version restored" });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", portfolioId, "versions"] });
      if (onReverted) {
        onReverted();
      }
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Revert failed",
        description: "We couldn't roll back to that version.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Version History</h3>
        <p className="text-sm text-muted-foreground">Create checkpoints and roll back safely.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="snapshot-title">Title</Label>
              <Input
                id="snapshot-title"
                placeholder="e.g. Pitch-ready variant"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snapshot-summary">Notes</Label>
              <Textarea
                id="snapshot-summary"
                placeholder="Summarize what changed in this version"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                rows={3}
              />
            </div>
          </div>
          <Button type="button" onClick={() => createVersion.mutate()} disabled={!portfolioId || createVersion.isPending}>
            {createVersion.isPending ? "Saving..." : "Save snapshot"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">History</h4>
        {!portfolioId ? (
          <p className="text-sm text-muted-foreground">Save the portfolio to start tracking versions.</p>
        ) : isFetching ? (
          <p className="text-sm text-muted-foreground">Loading versions...</p>
        ) : versions && versions.length > 0 ? (
          <div className="space-y-3">
            {versions.map((version) => (
              <Card key={version.id}>
                <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{version.title || "Untitled snapshot"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(version.createdAt ?? Date.now()), { addSuffix: true })}
                    </p>
                    {version.summary && (
                      <p className="mt-1 text-sm text-muted-foreground">{version.summary}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => revertVersion.mutate(version.id)}
                    disabled={revertVersion.isPending}
                  >
                    Revert to this version
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No snapshots yet. Save one to start tracking progress.</p>
        )}
      </div>
    </div>
  );
}
