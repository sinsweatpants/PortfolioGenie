import { useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AnimationEditorProps {
  className?: string;
}

const animationPresets = {
  fade: {
    label: "Fade in",
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  slideUp: {
    label: "Slide up",
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  },
  slideLeft: {
    label: "Slide left",
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
  },
  zoom: {
    label: "Zoom",
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
  rotate: {
    label: "Rotate",
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
  },
} satisfies Record<string, { label: string; initial: Record<string, number>; animate: Record<string, number> }>;

type AnimationKey = keyof typeof animationPresets;

export function AnimationEditor({ className }: AnimationEditorProps) {
  const [animation, setAnimation] = useState<AnimationKey>("fade");
  const [duration, setDuration] = useState(0.8);
  const [delay, setDelay] = useState(0.1);
  const [repeat, setRepeat] = useState(1);
  const [previewKey, setPreviewKey] = useState(0);

  const preset = animationPresets[animation];

  const codeSample = `motion.div({
  initial: ${JSON.stringify(preset.initial)},
  animate: ${JSON.stringify(preset.animate)},
  transition: { duration: ${duration.toFixed(2)}, delay: ${delay.toFixed(2)}, repeat: ${repeat} }
})`;

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Visual Animation Editor</h3>
        <p className="text-sm text-muted-foreground">Preview easing, timing, and export the Framer Motion snippet.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Label>Preset</Label>
          <Select value={animation} onValueChange={(value: AnimationKey) => setAnimation(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(animationPresets).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label>Duration ({duration.toFixed(2)}s)</Label>
          <Slider
            value={[duration]}
            min={0.2}
            max={2}
            step={0.1}
            onValueChange={([value]) => setDuration(value)}
          />
        </div>
        <div className="space-y-3">
          <Label>Delay ({delay.toFixed(2)}s)</Label>
          <Slider value={[delay]} min={0} max={1.5} step={0.05} onValueChange={([value]) => setDelay(value)} />
        </div>
        <div className="space-y-3">
          <Label>Repeat ({repeat === Infinity ? "Infinite" : repeat})</Label>
          <Slider
            value={[repeat === Infinity ? 5 : repeat]}
            min={1}
            max={5}
            step={1}
            onValueChange={([value]) => setRepeat(value >= 5 ? Infinity : value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Live preview</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setPreviewKey((value) => value + 1)}>
          Replay
        </Button>
      </div>

      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-lg border bg-muted/50">
        <motion.div
          key={`${animation}-${previewKey}`}
          initial={preset.initial}
          animate={preset.animate}
          transition={{ duration, delay, repeat: repeat === Infinity ? Infinity : repeat - 1 }}
          className="rounded-lg bg-primary px-6 py-4 text-primary-foreground shadow-lg"
        >
          Animate me
        </motion.div>
      </div>

      <div className="space-y-2">
        <Label>Framer Motion snippet</Label>
        <Textarea value={codeSample} readOnly rows={6} className="font-mono text-xs" />
      </div>
    </div>
  );
}
