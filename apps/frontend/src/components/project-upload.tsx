import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  projectUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectUploadProps {
  portfolioId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectUpload({ portfolioId, onSuccess, onCancel }: ProjectUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      projectUrl: "",
      tags: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/portfolios/${portfolioId}/projects`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      form.reset();
      setUploadedImage(null);
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}/projects`] });
      if (onSuccess) {
        onSuccess();
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
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest("POST", "/api/upload", formData);
      return await response.json();
    },
    onSuccess: (data) => {
      setUploadedImage(data.url);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
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
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadFileMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: ProjectFormData) => {
    const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    createProjectMutation.mutate({
      ...data,
      imageUrl: uploadedImage,
      tags,
      portfolioId,
    });
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-4">
          <Label>Project Image</Label>
          
          {uploadedImage ? (
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded project image"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={removeUploadedImage}
                    data-testid="button-remove-image"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Upload an image to showcase your project
                  </p>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="image-upload"
                      data-testid="input-file-upload"
                    />
                    <Label 
                      htmlFor="image-upload" 
                      className="cursor-pointer"
                    >
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={isUploading}
                        asChild
                        data-testid="button-upload-image"
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? "Uploading..." : "Choose Image"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project Details */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="My Awesome Project" 
                  data-testid="input-project-title"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your project..."
                  rows={4}
                  data-testid="input-project-description"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com"
                  data-testid="input-project-url"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="web design, branding, mobile app"
                  data-testid="input-project-tags"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel-project"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={createProjectMutation.isPending}
            data-testid="button-save-project"
          >
            {createProjectMutation.isPending ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
