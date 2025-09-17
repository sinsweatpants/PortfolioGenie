import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ColorPaletteToolProps {
  className?: string;
}

interface PaletteColor {
  label: string;
  value: string;
  contrast?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex: string): string {
  if (!hex) {
    return "#000000";
  }
  let formatted = hex.startsWith("#") ? hex.slice(1) : hex;
  if (formatted.length === 3) {
    formatted = formatted
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (formatted.length !== 6) {
    return "#000000";
  }
  return `#${formatted.toLowerCase()}`;
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex).slice(1);
  const parsed = parseInt(normalized, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const transform = (channel: number) => {
    const proportion = channel / 255;
    return proportion <= 0.03928
      ? proportion / 12.92
      : Math.pow((proportion + 0.055) / 1.055, 2.4);
  };

  return transform(r) * 0.2126 + transform(g) * 0.7152 + transform(b) * 0.0722;
}

function contrastRatio(colorA: string, colorB: string) {
  const luminanceA = relativeLuminance(hexToRgb(colorA));
  const luminanceB = relativeLuminance(hexToRgb(colorB));
  const brightest = Math.max(luminanceA, luminanceB) + 0.05;
  const darkest = Math.min(luminanceA, luminanceB) + 0.05;
  return Number((brightest / darkest).toFixed(2));
}

function adjustColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (value: number) => clamp(Math.round(value + 255 * amount), 0, 255);
  return `#${[adjust(r), adjust(g), adjust(b)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function generatePalette(primary: string, secondary: string, accent: string, background: string): PaletteColor[] {
  return [
    { label: "Primary", value: primary, contrast: contrastRatio(primary, background) },
    { label: "Primary Light", value: adjustColor(primary, 0.15) },
    { label: "Primary Dark", value: adjustColor(primary, -0.15) },
    { label: "Secondary", value: secondary, contrast: contrastRatio(secondary, background) },
    { label: "Accent", value: accent, contrast: contrastRatio(accent, background) },
  ];
}

export function ColorPaletteTool({ className }: ColorPaletteToolProps) {
  const [primary, setPrimary] = useState("#6366f1");
  const [secondary, setSecondary] = useState("#0ea5e9");
  const [accent, setAccent] = useState("#f97316");
  const [background, setBackground] = useState("#0f172a");

  const palette = useMemo(() => generatePalette(primary, secondary, accent, background), [
    primary,
    secondary,
    accent,
    background,
  ]);

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Advanced Palette Studio</h3>
        <p className="text-sm text-muted-foreground">
          Fine-tune your palette, preview WCAG contrast, and export color tokens.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Primary color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primary}
              onChange={(event) => setPrimary(event.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-border"
              aria-label="Select primary color"
            />
            <span className="font-mono text-sm">{primary.toUpperCase()}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Secondary color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-border"
              aria-label="Select secondary color"
            />
            <span className="font-mono text-sm">{secondary.toUpperCase()}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Accent color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accent}
              onChange={(event) => setAccent(event.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-border"
              aria-label="Select accent color"
            />
            <span className="font-mono text-sm">{accent.toUpperCase()}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Background</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-border"
              aria-label="Select background color"
            />
            <span className="font-mono text-sm">{background.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {palette.map((color) => (
          <Card key={color.label} className="overflow-hidden">
            <div
              className="h-20"
              style={{ backgroundColor: color.value }}
              aria-hidden="true"
            />
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{color.label}</p>
                <span className="font-mono text-xs text-muted-foreground">{color.value.toUpperCase()}</span>
              </div>
              {typeof color.contrast === "number" && (
                <p className="text-xs text-muted-foreground">
                  Contrast vs background: <span className="font-semibold">{color.contrast}:1</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPrimary("#22c55e");
            setSecondary("#10b981");
            setAccent("#facc15");
            setBackground("#0f172a");
          }}
        >
          Use modern gradient set
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPrimary("#1d4ed8");
            setSecondary("#7c3aed");
            setAccent("#ec4899");
            setBackground("#f8fafc");
          }}
        >
          Pastel showcase
        </Button>
      </div>
    </div>
  );
}
