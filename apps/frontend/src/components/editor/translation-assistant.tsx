import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TranslationAssistantProps {
  className?: string;
}

const languages = [
  "Arabic",
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Korean",
  "Chinese",
];

export function TranslationAssistant({ className }: TranslationAssistantProps) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Arabic");
  const [translated, setTranslated] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Provide copy to translate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/translate", {
        text,
        targetLanguage,
      });
      const data = await response.json();
      setTranslated(data.translated);
    } catch (error) {
      console.error(error);
      toast({
        title: "Translation failed",
        description: "Gemini could not translate this snippet right now.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">Multilingual Assistant</h3>
        <p className="text-sm text-muted-foreground">
          Instantly adapt your portfolio copy for new markets.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="translation-source">Source text</Label>
        <Textarea
          id="translation-source"
          rows={5}
          placeholder="Share the paragraph to translate..."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <Label>Target language</Label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={handleTranslate} disabled={isLoading}>
          {isLoading ? "Translating..." : "Translate"}
        </Button>
      </div>

      {translated && (
        <div className="space-y-2">
          <Label>Translation</Label>
          <Textarea value={translated} readOnly rows={5} className="bg-muted" />
        </div>
      )}
    </div>
  );
}
