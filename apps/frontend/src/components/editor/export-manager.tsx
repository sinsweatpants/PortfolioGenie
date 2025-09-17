import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ExportManagerProps {
  className?: string;
  portfolioId?: string;
  portfolioName?: string;
  slug?: string;
}

const formats = [
  { value: "json", label: "JSON data" },
  { value: "markdown", label: "Markdown" },
  { value: "html", label: "Static HTML" },
] as const;

type ExportFormat = (typeof formats)[number]["value"];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportManager({ className, portfolioId, portfolioName, slug }: ExportManagerProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!portfolioId) {
      toast({
        title: "Save portfolio first",
        description: "Exporting is available once a portfolio is created.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const endpoint = `/api/portfolios/${portfolioId}/export?format=${format}`;
      const response = await apiRequest("GET", endpoint);

      const filenameBase = slug || portfolioName || "portfolio";

      if (format === "json") {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        downloadBlob(blob, `${filenameBase}.json`);
      } else {
        const text = await response.text();
        const blob = new Blob([text], { type: format === "html" ? "text/html" : "text/markdown" });
        downloadBlob(blob, `${filenameBase}.${format === "html" ? "html" : "md"}`);
      }

      toast({
        title: "Export ready",
        description: `Downloaded ${format.toUpperCase()} snapshot.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Export failed",
        description: "We couldn't export this portfolio right now.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Export Toolkit</h3>
        <p className="text-sm text-muted-foreground">
          Deliver handoff-ready assets in JSON, Markdown, or static HTML.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Choose format</Label>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formats.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" onClick={handleExport} disabled={isExporting}>
        {isExporting ? "Preparing export..." : "Download"}
      </Button>
    </div>
  );
}
