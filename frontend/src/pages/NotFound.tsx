import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-bg opacity-20"></div>
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 text-center px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-display font-bold gradient-text mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GradientButton asChild size="lg">
            <Link to="/">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </GradientButton>
          <GradientButton asChild variant="outline" size="lg">
            <Link to="/tutors">
              <Search className="w-5 h-5" />
              Browse Tutors
            </Link>
          </GradientButton>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Need help? <a href="#" className="text-brand hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
