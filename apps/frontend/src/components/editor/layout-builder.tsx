import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, PlusCircle } from "lucide-react";

interface LayoutBuilderProps {
  className?: string;
}

interface LayoutBlock {
  id: string;
  name: string;
  description: string;
  recommendedContent: string[];
}

const availableBlocks: Omit<LayoutBlock, "id">[] = [
  {
    name: "Hero",
    description: "Bold introduction with call to action",
    recommendedContent: ["Headline", "Supporting text", "Primary CTA", "Background image"],
  },
  {
    name: "About",
    description: "Personal story and quick facts",
    recommendedContent: ["Bio", "Experience highlights", "Fun facts"],
  },
  {
    name: "Case Study",
    description: "Problem, solution, and results",
    recommendedContent: ["Challenge", "Process", "Outcome", "Metrics"],
  },
  {
    name: "Showreel",
    description: "Carousel or grid of featured work",
    recommendedContent: ["Project cards", "Filters", "Tags"],
  },
  {
    name: "Testimonials",
    description: "Client love and social proof",
    recommendedContent: ["Quote", "Author", "Role/company"],
  },
  {
    name: "Contact",
    description: "Ways to reach you and follow your work",
    recommendedContent: ["Contact form", "Availability", "Social links"],
  },
];

function createBlock(block: Omit<LayoutBlock, "id">): LayoutBlock {
  return {
    ...block,
    id: crypto.randomUUID(),
  };
}

export function LayoutBuilder({ className }: LayoutBuilderProps) {
  const [layout, setLayout] = useState<LayoutBlock[]>(() => [
    createBlock(availableBlocks[0]),
    createBlock(availableBlocks[2]),
    createBlock(availableBlocks[5]),
  ]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const remainingBlocks = useMemo(
    () =>
      availableBlocks.filter((candidate) =>
        layout.every((block) => block.name !== candidate.name),
      ),
    [layout],
  );

  const reorder = (sourceId: string, targetId: string) => {
    setLayout((items) => {
      const sourceIndex = items.findIndex((item) => item.id === sourceId);
      const targetIndex = items.findIndex((item) => item.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) {
        return items;
      }
      const updated = [...items];
      const [removed] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, removed);
      return updated;
    });
  };

  const addBlock = (block: Omit<LayoutBlock, "id">) => {
    setLayout((items) => [...items, createBlock(block)]);
  };

  const removeBlock = (id: string) => {
    setLayout((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Drag & Drop Layout</h3>
          <p className="text-sm text-muted-foreground">Compose your page structure and reorder sections visually.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {remainingBlocks.map((block) => (
            <Button key={block.name} variant="outline" size="sm" onClick={() => addBlock(block)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {block.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {layout.map((block) => (
          <Card
            key={block.id}
            className={cn(
              "transition",
              dragOverId === block.id && draggedId !== block.id ? "border-primary shadow" : "border-border",
            )}
            draggable
            onDragStart={() => {
              setDraggedId(block.id);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (draggedId && draggedId !== block.id) {
                setDragOverId(block.id);
              }
            }}
            onDragLeave={() => {
              setDragOverId(null);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (draggedId && draggedId !== block.id) {
                reorder(draggedId, block.id);
              }
              setDragOverId(null);
              setDraggedId(null);
            }}
            onDragEnd={() => {
              setDragOverId(null);
              setDraggedId(null);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </span>
                <CardTitle className="text-base">{block.name}</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeBlock(block.id)} aria-label={`Remove ${block.name}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{block.description}</p>
              <div className="flex flex-wrap gap-2">
                {block.recommendedContent.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
