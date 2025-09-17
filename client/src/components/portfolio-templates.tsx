import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import type { Template } from "@shared/schema";

interface PortfolioTemplatesProps {
  onSelectTemplate?: (templateId: string) => void;
  selectedCategory?: string;
}

export function PortfolioTemplates({ 
  onSelectTemplate, 
  selectedCategory 
}: PortfolioTemplatesProps) {
  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: selectedCategory 
      ? ["/api/templates", { category: selectedCategory }]
      : ["/api/templates"],
  });

  const categories = [
    "All Templates",
    "Photography", 
    "Design",
    "Development",
    "Business",
    "Art & Creative"
  ];

  const handleUseTemplate = (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
    } else {
      // Default behavior - redirect to create portfolio
      window.location.href = "/api/login";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Category Filters Skeleton */}
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((_, index) => (
            <Skeleton key={index} className="h-10 w-24" />
          ))}
        </div>

        {/* Templates Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="w-full h-48" />
              <CardContent className="p-6">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Template Categories */}
      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <Button
            key={category}
            variant={
              (category === "All Templates" && !selectedCategory) ||
              category === selectedCategory
                ? "default"
                : "outline"
            }
            className="rounded-full"
            data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              {selectedCategory 
                ? `No templates available in the ${selectedCategory} category`
                : "No templates available at the moment"
              }
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <Card 
              key={template.id} 
              className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
            >
              <div className="overflow-hidden">
                {template.previewUrl ? (
                  <img 
                    src={template.previewUrl}
                    alt={`${template.name} template preview`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">Template Preview</span>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold" data-testid={`template-name-${template.id}`}>
                    {template.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-accent fill-current" />
                    <span className="text-sm">
                      {template.rating ? (template.rating / 10).toFixed(1) : "4.8"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({template.usageCount || 0} uses)
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleUseTemplate(template.id)}
                    data-testid={`use-template-${template.id}`}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
