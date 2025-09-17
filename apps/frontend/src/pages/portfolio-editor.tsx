import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectUpload } from "@/components/project-upload";
import {
  ArrowLeft,
  Eye,
  Rocket,
  Plus,
  Edit,
  Trash2,
  Save,
  Settings
} from "lucide-react";
import {
  AITextAssistant,
  TemplateGenerator,
  ColorPaletteTool,
  FontManager,
  LayoutBuilder,
  AnimationEditor,
  TranslationAssistant,
  MediaOptimizer,
  ResponsivePreview,
  PerformanceOptimizer,
  AccessibilityChecker,
  ExportManager,
  VersionHistory,
} from "@/components/editor";
import type { Portfolio, Project } from "@shared/schema";

export default function PortfolioEditor() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isNewPortfolio] = useState(id === "new");
  const portfolioId = !isNewPortfolio && id ? id : undefined;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isPublished: false,
    templateId: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<Portfolio>({
    queryKey: [`/api/portfolios/${id}`],
    enabled: isAuthenticated && !isNewPortfolio && !!id,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: [`/api/portfolios/${id}/projects`],
    enabled: isAuthenticated && !isNewPortfolio && !!id,
  });

  // Update form data when portfolio loads
  useEffect(() => {
    if (portfolio && !isNewPortfolio) {
      setFormData({
        name: portfolio.name || "",
        description: portfolio.description || "",
        slug: portfolio.slug || "",
        isPublished: portfolio.isPublished || false,
        templateId: portfolio.templateId || "",
      });
    }
  }, [portfolio, isNewPortfolio]);

  const savePortfolioMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isNewPortfolio) {
        return await apiRequest("POST", "/api/portfolios", data);
      } else {
        return await apiRequest("PATCH", `/api/portfolios/${id}`, data);
      }
    },
    onSuccess: async (response) => {
      toast({
        title: "Success",
        description: `Portfolio ${isNewPortfolio ? "created" : "updated"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      if (isNewPortfolio) {
        const newPortfolio = await response.json();
        setLocation(`/portfolio/edit/${newPortfolio.id}`);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: `Failed to ${isNewPortfolio ? "create" : "update"} portfolio`,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${id}/projects`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const handleVersionReverted = () => {
    if (!portfolioId) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}/projects`] });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate slug from name
    if (field === "name" && typeof value === "string") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Portfolio name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.slug.trim()) {
      toast({
        title: "Validation Error", 
        description: "Portfolio slug is required",
        variant: "destructive",
      });
      return;
    }

    savePortfolioMutation.mutate(formData);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isNewPortfolio && portfolioLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-16 w-full mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">
                {isNewPortfolio ? "Create Portfolio" : "Edit Portfolio"}
              </h1>
              {!isNewPortfolio && (
                <Badge variant={formData.isPublished ? "default" : "secondary"}>
                  {formData.isPublished ? "Live" : "Draft"}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {!isNewPortfolio && formData.isPublished && (
                <Link href={`/p/${formData.slug}`}>
                  <Button variant="outline" data-testid="button-preview">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </Link>
              )}
              <Button 
                onClick={handleSave} 
                disabled={savePortfolioMutation.isPending}
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {savePortfolioMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Portfolio Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="My Awesome Portfolio"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your portfolio..."
                    rows={3}
                    data-testid="input-description"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      portfoliocraft.com/p/
                    </span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      placeholder="my-portfolio"
                      className="rounded-l-none"
                      data-testid="input-slug"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  {!isNewPortfolio && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-project">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Project</DialogTitle>
                        </DialogHeader>
                        <ProjectUpload 
                          portfolioId={id!} 
                          onSuccess={() => {
                            queryClient.invalidateQueries({ 
                              queryKey: [`/api/portfolios/${id}/projects`] 
                            });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isNewPortfolio ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Save your portfolio first to add projects</p>
                  </div>
                ) : projectsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="w-16 h-16" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No projects yet. Add your first project to showcase your work.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div 
                        key={project.id} 
                        className="flex items-center space-x-4 p-4 border border-border rounded-lg"
                      >
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          {project.imageUrl ? (
                            <img 
                              src={project.imageUrl} 
                              alt={project.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">IMG</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold" data-testid={`text-project-title-${project.id}`}>
                            {project.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" data-testid={`button-edit-project-${project.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteProject(project.id)}
                            disabled={deleteProjectMutation.isPending}
                            data-testid={`button-delete-project-${project.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Publish Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="published">Published</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your portfolio publicly visible
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleInputChange("isPublished", checked)}
                    data-testid="switch-published"
                  />
                </div>
                
                {formData.isPublished && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Public URL:</p>
                    <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                      portfoliocraft.com/p/{formData.slug || "your-slug"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Template selection coming soon</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={isNewPortfolio}
                data-testid="button-quick-publish"
              >
                <Rocket className="w-4 h-4 mr-2" />
                {formData.isPublished ? "Update Live Site" : "Publish Portfolio"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={isNewPortfolio || !formData.isPublished}
                data-testid="button-quick-view"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Portfolio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

        <div className="mt-12 space-y-10">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Assistance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-10 lg:grid-cols-2">
                <AITextAssistant
                  className="min-h-[28rem]"
                  onGenerate={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: text,
                    }))
                  }
                />
                <div className="space-y-10">
                  <TemplateGenerator />
                  <TranslationAssistant />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design Studio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-10">
              <div className="grid gap-10 lg:grid-cols-2">
                <ColorPaletteTool />
                <FontManager />
              </div>
              <div className="grid gap-10 lg:grid-cols-2">
                <LayoutBuilder />
                <AnimationEditor />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization & Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-10">
              <div className="grid gap-10 lg:grid-cols-2">
                <MediaOptimizer />
                <ResponsivePreview slug={formData.slug} isPublished={Boolean(formData.isPublished && portfolioId)} />
              </div>
              <div className="grid gap-10 lg:grid-cols-2">
                <PerformanceOptimizer portfolioId={portfolioId} />
                <AccessibilityChecker portfolioId={portfolioId} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-10 lg:grid-cols-[2fr,1fr]">
              <VersionHistory
                portfolioId={portfolioId}
                onReverted={() => {
                  handleVersionReverted();
                }}
              />
              <ExportManager
                portfolioId={portfolioId}
                portfolioName={formData.name}
                slug={formData.slug}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
