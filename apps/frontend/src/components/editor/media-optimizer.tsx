import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { optimizeImageFile } from "@/lib/imageOptimizer";

interface MediaOptimizerProps {
  className?: string;
}

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  optimizedPreview: string;
  optimizedFile: File;
  width: number;
  height: number;
}

export function MediaOptimizer({ className }: MediaOptimizerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleOptimize = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });

    try {
      const optimization = await optimizeImageFile(file);
      setResult({
        originalSize: optimization.originalSize,
        optimizedSize: optimization.optimizedSize,
        optimizedPreview: optimization.optimizedDataUrl,
        optimizedFile: optimization.optimizedFile,
        width: optimization.width,
        height: optimization.height,
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Optimization failed", description: "Please try another file", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const savings = result ? Math.max(0, result.originalSize - result.optimizedSize) : 0;
  const savingsPercent = result && result.originalSize > 0 ? Math.round((savings / result.originalSize) * 100) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Smart Media Optimizer</h3>
        <p className="text-sm text-muted-foreground">
          Convert uploads to modern formats and review the weight savings instantly.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="optimizer-upload">Upload image</Label>
        <Input id="optimizer-upload" type="file" accept="image/*" onChange={handleOptimize} disabled={isLoading} />
      </div>

      {preview && (
        <Card>
          <CardContent className="grid gap-4 p-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Original preview</p>
              <img src={preview} alt="Original preview" className="rounded-lg border" />
            </div>
            {result?.optimizedPreview ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Optimized preview</p>
                <img src={result.optimizedPreview} alt="Optimized preview" className="rounded-lg border" />
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Optimizing image…</p>}

      {result && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide">Original</p>
                <p className="font-semibold text-foreground">{(result.originalSize / 1024).toFixed(1)} KB</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Optimized</p>
                <p className="font-semibold text-foreground">{(result.optimizedSize / 1024).toFixed(1)} KB</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Dimensions</p>
                <p className="font-semibold text-foreground">
                  {result.width} × {result.height}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Savings</p>
                <p className="font-semibold text-foreground">{savingsPercent}%</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <a href={result.optimizedPreview} download={result.optimizedFile.name}>
                  Download optimized
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
