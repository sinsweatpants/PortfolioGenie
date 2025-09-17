import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TemplateGeneratorProps {
  className?: string;
}

export function TemplateGenerator({ className }: TemplateGeneratorProps) {
  const { toast } = useToast();
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState("");
  const [tone, setTone] = useState("");
  const [sections, setSections] = useState("");
  const [outline, setOutline] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!industry.trim()) {
      toast({
        title: "Industry required",
        description: "Let the assistant know which field the portfolio targets.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/templates", {
        industry,
        goals: goals || undefined,
        tone: tone || undefined,
        mustHaveSections: sections
          ? sections
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
          : undefined,
      });
      const data = await response.json();
      setOutline(data.outline);
    } catch (error) {
      console.error(error);
      toast({
        title: "Couldn't build template",
        description: "Please try again with a simpler brief.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Template Blueprint</h3>
        <p className="text-sm text-muted-foreground">
          Describe your needs and Gemini will propose a custom section flow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Input
            id="industry"
            placeholder="Product designer, photographer, developer..."
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tone">Preferred tone</Label>
          <Input
            id="tone"
            placeholder="e.g. minimal, vibrant, storytelling"
            value={tone}
            onChange={(event) => setTone(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Portfolio goals</Label>
        <Textarea
          id="goals"
          placeholder="Share what success looks like: attract freelance work, land interviews, sell digital products..."
          value={goals}
          onChange={(event) => setGoals(event.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sections">Must-have sections</Label>
        <Input
          id="sections"
          placeholder="Comma separated: About, Case Studies, Testimonials"
          value={sections}
          onChange={(event) => setSections(event.target.value)}
        />
      </div>

      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? "Generating outline..." : "Generate template"}
      </Button>

      {outline && (
        <div className="space-y-2">
          <Label>Suggested layout</Label>
          <Textarea value={outline} readOnly rows={8} className="bg-muted" />
        </div>
      )}
    </div>
  );
}
