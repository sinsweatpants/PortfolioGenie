import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Plus, 
  Eye, 
  Edit, 
  ExternalLink, 
  Trash2,
  Users,
  Briefcase,
  Folder,
  Mail,
  Upload,
  Calendar
} from "lucide-react";
import type { Portfolio, User } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { 
    isAuthenticated: boolean; 
    isLoading: boolean; 
    user?: User; 
  };
  const queryClient = useQueryClient();

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

  const { data: portfolios = [], isLoading: portfoliosLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (portfolioId: string) => {
      await apiRequest("DELETE", `/api/portfolios/${portfolioId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Portfolio deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
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
        description: "Failed to delete portfolio",
        variant: "destructive",
      });
    },
  });

  const handleDeletePortfolio = (portfolioId: string) => {
    if (confirm("Are you sure you want to delete this portfolio?")) {
      deletePortfolioMutation.mutate(portfolioId);
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

  const stats = {
    totalViews: portfolios.reduce((sum, p) => sum + (p.viewCount || 0), 0),
    portfolioCount: portfolios.length,
    projectCount: 0, // Would need to aggregate from projects
    contactCount: 0, // Would need to track contacts
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary-foreground font-semibold">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-username">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || "User"}
                </h1>
                <p className="text-muted-foreground" data-testid="text-email">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/portfolio/new">
                <Button data-testid="button-new-portfolio">
                  <Plus className="w-4 h-4 mr-2" />
                  New Portfolio
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-primary" data-testid="stat-total-views">
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolios</p>
                  <p className="text-2xl font-bold text-primary" data-testid="stat-portfolio-count">
                    {stats.portfolioCount}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-2xl font-bold text-primary" data-testid="stat-project-count">
                    {stats.projectCount}
                  </p>
                </div>
                <Folder className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contacts</p>
                  <p className="text-2xl font-bold text-primary" data-testid="stat-contact-count">
                    {stats.contactCount}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Management */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Your Portfolios</h2>
          
          {portfoliosLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="w-full h-32" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No portfolios yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first portfolio to start showcasing your work
                </p>
                <Link href="/portfolio/new">
                  <Button data-testid="button-create-first-portfolio">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Portfolio
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-muted/30 h-32 flex items-center justify-center">
                    <span className="text-muted-foreground">Portfolio Preview</span>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold" data-testid={`text-portfolio-name-${portfolio.id}`}>
                        {portfolio.name}
                      </h4>
                      <Badge variant={portfolio.isPublished ? "default" : "secondary"}>
                        {portfolio.isPublished ? "Live" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {portfolio.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground" data-testid={`text-views-${portfolio.id}`}>
                        {portfolio.viewCount || 0} views
                      </span>
                      <div className="flex space-x-2">
                        <Link href={`/portfolio/edit/${portfolio.id}`}>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            data-testid={`button-edit-${portfolio.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        {portfolio.isPublished && (
                          <Link href={`/p/${portfolio.slug}`}>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              data-testid={`button-view-${portfolio.id}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeletePortfolio(portfolio.id)}
                          disabled={deletePortfolioMutation.isPending}
                          data-testid={`button-delete-${portfolio.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                <p className="text-muted-foreground">
                  Your portfolio activity will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
