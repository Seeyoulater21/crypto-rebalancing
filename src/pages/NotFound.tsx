
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bitcoin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center animate-fade-in glass-panel p-12 rounded-2xl max-w-md">
        <div className="flex justify-center mb-6">
          <Bitcoin className="h-20 w-20 text-bitcoin" />
        </div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! We couldn't find that page
        </p>
        <Button 
          asChild 
          className="bg-bitcoin hover:bg-bitcoin-dark text-white px-8 py-6 h-auto hover-scale"
        >
          <a href="/">Return to Backtester</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
