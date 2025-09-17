import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Palette, 
  Smartphone, 
  Share, 
  Upload, 
  BarChart3, 
  Shield,
  Rocket,
  Eye,
  Users,
  Globe,
  Star,
  ShieldCheck
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Custom Templates",
      description: "Choose from dozens of professionally designed templates tailored for different creative fields.",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile Optimized",
      description: "Your portfolio looks perfect on every device with responsive design built-in.",
    },
    {
      icon: <Share className="h-6 w-6" />,
      title: "Easy Sharing",
      description: "Share your portfolio with a custom URL and track visitor engagement.",
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Media Upload",
      description: "Upload images, videos, and documents to showcase your best work.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics",
      description: "Track portfolio views and engagement to understand your audience better.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Fast",
      description: "Built with security and performance in mind for reliable portfolio hosting.",
    },
  ];

  const templates = [
    {
      name: "Minimal Pro",
      category: "Photography",
      description: "Clean, minimal design perfect for photographers and visual artists",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      rating: 4.9,
      uses: 234,
    },
    {
      name: "Creative Burst",
      category: "Design",
      description: "Vibrant, creative template for designers and digital artists",
      image: "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      rating: 4.7,
      uses: 189,
    },
    {
      name: "Corporate Elite",
      category: "Business",
      description: "Professional template for business consultants and executives",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      rating: 4.8,
      uses: 156,
    },
  ];

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary">PortfolioCraft</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#templates" className="text-muted-foreground hover:text-foreground transition-colors">Templates</a>
              <Button 
                variant="ghost" 
                onClick={handleSignIn}
                data-testid="button-signin"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleGetStarted}
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-serif mb-6">
              Create Your
              <span className="text-primary"> Professional</span>
              <br />Portfolio
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Build stunning portfolios that showcase your work and attract opportunities. 
              Choose from professional templates designed for every creative field.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg"
                onClick={handleGetStarted}
                data-testid="button-start-building"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Building
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg"
                data-testid="button-view-examples"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Examples
              </Button>
            </div>
            
            {/* Hero Preview */}
            <div className="relative max-w-5xl mx-auto">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800" 
                alt="Portfolio preview on laptop" 
                className="rounded-2xl shadow-2xl w-full h-auto" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-4">
              Everything You Need to Shine
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional tools and templates to create portfolios that get noticed
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Gallery */}
      <section id="templates" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-4">
              Professional Templates
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our curated collection of templates designed for different creative fields
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <Card key={index} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                <div className="overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={`${template.name} template`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-accent fill-current" />
                      <span className="text-sm">{template.rating}</span>
                      <span className="text-xs text-muted-foreground">({template.uses} uses)</span>
                    </div>
                    <Button size="sm" onClick={handleGetStarted}>
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-6">
            Ready to Showcase Your Work?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creatives who trust PortfolioCraft to showcase their best work
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg"
              onClick={handleGetStarted}
              data-testid="button-start-portfolio"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Building Your Portfolio
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center space-x-2" data-testid="trust-users">
              <Users className="w-4 h-4" />
              <span className="text-sm">10,000+ Creatives</span>
            </div>
            <div className="flex items-center space-x-2" data-testid="trust-countries">
              <Globe className="w-4 h-4" />
              <span className="text-sm">50+ Countries</span>
            </div>
            <div className="flex items-center space-x-2" data-testid="trust-rating">
              <Star className="w-4 h-4" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2" data-testid="trust-compliance">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-primary mb-4">PortfolioCraft</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                The easiest way to create professional portfolios that showcase your work and attract opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-foreground transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Examples</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 PortfolioCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
