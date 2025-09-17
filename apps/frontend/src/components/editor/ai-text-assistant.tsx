import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AITextAssistantProps {
  className?: string;
  onGenerate?: (text: string) => void;
}

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" },
  { value: "confident", label: "Confident" },
];

const lengthOptions = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export function AITextAssistant({ className, onGenerate }: AITextAssistantProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [existingContent, setExistingContent] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [improvementNotes, setImprovementNotes] = useState("");
  const [loadingAction, setLoadingAction] = useState<"generate" | "improve" | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Describe what you want the assistant to create.",
        variant: "destructive",
      });
      return;
    }

    setLoadingAction("generate");
    try {
      const response = await apiRequest("POST", "/api/ai/generate-text", {
        prompt,
        tone,
        length,
        existingText: existingContent?.trim() ? existingContent : undefined,
      });
      const data = await response.json();
      setGeneratedText(data.text);
      if (onGenerate) {
        onGenerate(data.text);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation failed",
        description: "We couldn't generate copy right now. Try again shortly.",
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImprove = async () => {
    if (!existingContent.trim()) {
      toast({
        title: "Content required",
        description: "Paste the content you want feedback on.",
        variant: "destructive",
      });
      return;
    }

    setLoadingAction("improve");
    try {
      const response = await apiRequest("POST", "/api/ai/content-improvements", {
        content: existingContent,
      });
      const data = await response.json();
      setImprovementNotes(data.suggestions);
    } catch (error) {
      console.error(error);
      toast({
        title: "Improvement failed",
        description: "The assistant couldn't review your text. Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">AI Writing Studio</h3>
            <p className="text-sm text-muted-foreground">Generate intros, bios, or project descriptions with Gemini.</p>
          </div>
          <Badge variant="secondary">models/gemini-2.5-pro</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="prompt">What should we write?</Label>
            <Input
              id="prompt"
              placeholder="e.g. Write a welcoming hero message for a product designer"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="existing-text">Optional context</Label>
          <Textarea
            id="existing-text"
            placeholder="Paste existing copy or bullet points to guide the assistant"
            value={existingContent}
            onChange={(event) => setExistingContent(event.target.value)}
            rows={4}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleGenerate} disabled={loadingAction === "generate"}>
            {loadingAction === "generate" ? "Generating..." : "Create Copy"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleImprove}
            disabled={loadingAction === "improve"}
          >
            {loadingAction === "improve" ? "Reviewing..." : "Suggest Improvements"}
          </Button>
        </div>
      </div>

      {generatedText && (
        <div className="space-y-2">
          <Label>AI draft</Label>
          <Textarea value={generatedText} readOnly rows={6} className="bg-muted" />
        </div>
      )}

      {improvementNotes && (
        <div className="space-y-2">
          <Label>Improvement ideas</Label>
          <Textarea value={improvementNotes} readOnly rows={6} className="bg-muted" />
        </div>
      )}
    </div>
  );
}
