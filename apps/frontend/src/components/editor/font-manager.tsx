import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FontManagerProps {
  className?: string;
}

const fonts = [
  { name: "Inter", family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { name: "Playfair Display", family: "'Playfair Display', 'Times New Roman', serif" },
  { name: "Space Grotesk", family: "'Space Grotesk', 'Inter', sans-serif" },
  { name: "Source Sans Pro", family: "'Source Sans Pro', 'Inter', sans-serif" },
  { name: "DM Serif Display", family: "'DM Serif Display', Georgia, serif" },
  { name: "Fira Code", family: "'Fira Code', 'SFMono-Regular', monospace" },
];

export function FontManager({ className }: FontManagerProps) {
  const { toast } = useToast();
  const [previewText, setPreviewText] = useState("Design with confidence.");
  const [selectedFont, setSelectedFont] = useState(fonts[0].name);

  const activeFont = useMemo(() => fonts.find((font) => font.name === selectedFont) ?? fonts[0], [selectedFont]);

  const handleCopy = async (fontFamily: string) => {
    try {
      await navigator.clipboard.writeText(fontFamily);
      toast({
        title: "Font stack copied",
        description: fontFamily,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Copy failed",
        description: "Copy the CSS family manually if the clipboard is unavailable.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Font Previewer</h3>
        <p className="text-sm text-muted-foreground">
          Compare curated font pairs and copy the CSS stack instantly.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preview-text">Preview text</Label>
        <Input
          id="preview-text"
          value={previewText}
          onChange={(event) => setPreviewText(event.target.value)}
          placeholder="The quick brown fox jumps over the lazy dog"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fonts.map((font) => (
          <Card
            key={font.name}
            className={cn(
              "cursor-pointer border transition",
              selectedFont === font.name ? "border-primary shadow" : "hover:border-primary/50",
            )}
            onClick={() => setSelectedFont(font.name)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{font.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground break-all">{font.family}</p>
              <p style={{ fontFamily: font.family }} className="text-xl">
                {previewText}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(font.family)}>
                Copy CSS stack
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active pairing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Heading font combines with the selected body stack for a balanced pairing.
          </p>
          <div className="space-y-1">
            <p style={{ fontFamily: activeFont.family }} className="text-2xl font-semibold">
              {previewText}
            </p>
            <p className="text-xs text-muted-foreground">CSS: {activeFont.family}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
