import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResponsivePreviewProps {
  className?: string;
  slug?: string;
  isPublished?: boolean;
}

const devices = [
  { id: "desktop", label: "Desktop", width: 1280, height: 720, scale: 0.45 },
  { id: "tablet", label: "Tablet", width: 834, height: 1112, scale: 0.5 },
  { id: "mobile", label: "Mobile", width: 390, height: 844, scale: 0.7 },
];

type DeviceId = (typeof devices)[number]["id"];

export function ResponsivePreview({ className, slug, isPublished }: ResponsivePreviewProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceId>("desktop");

  const device = useMemo(() => devices.find((item) => item.id === activeDevice) ?? devices[0], [activeDevice]);
  const previewUrl = slug ? `/p/${slug}` : undefined;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Responsive Preview</h3>
          <p className="text-sm text-muted-foreground">
            Test your portfolio across breakpoints. Live previews require a published slug.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {devices.map((candidate) => (
            <Button
              key={candidate.id}
              type="button"
              variant={candidate.id === activeDevice ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDevice(candidate.id)}
            >
              {candidate.label}
            </Button>
          ))}
        </div>
      </div>

      {previewUrl && isPublished ? (
        <div className="flex flex-col gap-3">
          <div
            className="mx-auto rounded-3xl border border-border bg-background/60 p-4 shadow-inner"
            style={{
              width: device.width * device.scale + 32,
              height: device.height * device.scale + 32,
            }}
          >
            <div className="relative overflow-hidden rounded-2xl border bg-black">
              <iframe
                title="Portfolio preview"
                src={previewUrl}
                style={{
                  width: device.width,
                  height: device.height,
                  transform: `scale(${device.scale})`,
                  transformOrigin: "top left",
                  border: "none",
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <Button asChild variant="outline" size="sm">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                Open full preview
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
          {slug ? "Publish the portfolio to enable live preview across devices." : "Save your portfolio to generate a preview link."}
        </div>
      )}
    </div>
  );
}
