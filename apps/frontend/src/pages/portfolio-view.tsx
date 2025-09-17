import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, 
  Download, 
  ExternalLink,
  Globe,
  Github,
  Linkedin,
  Twitter
} from "lucide-react";

interface PublicPortfolio {
  id: string;
  name: string;
  description: string;
  slug: string;
  isPublished: boolean;
  viewCount: number;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    projectUrl: string | null;
    tags: string[];
  }>;
}

export default function PortfolioView() {
  const { slug } = useParams<{ slug: string }>();

  const { data: portfolio, isLoading, error } = useQuery<PublicPortfolio>({
    queryKey: [`/api/public/portfolios/${slug}`],
    enabled: !!slug,
  });

  // Set page title
  useEffect(() => {
    if (portfolio) {
      document.title = `${portfolio.name} - PortfolioCraft`;
    }
  }, [portfolio]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section Skeleton */}
        <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Portfolio Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The portfolio you're looking for doesn't exist or is not published.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-primary">
                PortfolioCraft
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {portfolio.viewCount} views
              </Badge>
              <Button size="sm" onClick={() => window.location.href = "/"}>
                Create Your Own
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="relative text-center text-foreground">
          <div className="w-24 h-24 bg-card rounded-full mx-auto mb-4 shadow-lg overflow-hidden">
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {portfolio.name.charAt(0)}
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold font-serif mb-2" data-testid="text-portfolio-name">
            {portfolio.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-4" data-testid="text-portfolio-description">
            {portfolio.description || "Creative Professional"}
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm" data-testid="button-contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
            <Button variant="outline" size="sm" data-testid="button-download-resume">
              <Download className="w-4 h-4 mr-2" />
              Resume
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif mb-4">Featured Work</h2>
            <p className="text-lg text-muted-foreground">
              Showcasing creativity and expertise across various projects
            </p>
          </div>

          {portfolio.projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-muted-foreground">📁</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground">
                This portfolio is still being built. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolio.projects.map((project, index) => (
                <Card 
                  key={project.id} 
                  className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
                >
                  <div className="overflow-hidden">
                    {project.imageUrl ? (
                      <img 
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No Image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg" data-testid={`text-project-title-${index}`}>
                        {project.title}
                      </h3>
                      {project.projectUrl && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open(project.projectUrl!, '_blank')}
                          data-testid={`button-project-link-${index}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-serif mb-6">Let's Work Together</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Interested in collaborating? I'd love to hear about your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" data-testid="button-get-in-touch">
              <Mail className="w-5 h-5 mr-2" />
              Get In Touch
            </Button>
            <Button variant="outline" size="lg" data-testid="button-view-resume">
              <Download className="w-5 h-5 mr-2" />
              Download Resume
            </Button>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6 pt-8 border-t border-border">
            <Button variant="ghost" size="sm" data-testid="link-linkedin">
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="link-github">
              <Github className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="link-twitter">
              <Twitter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-sm text-muted-foreground">
                Built with PortfolioCraft
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/"}
                data-testid="button-create-portfolio"
              >
                Create Your Own
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 PortfolioCraft. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
