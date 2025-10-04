import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import Index from "./pages/Index";
import { Landing } from "./pages/Landing";
import { Tutors } from "./pages/Tutors";
import { VideoCall } from "./pages/VideoCall";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Video Call - Full Screen (No Nav/Footer) */}
          <Route path="/session/:tutorId" element={<VideoCall />} />
          
          {/* Pages with Navigation and Footer */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/tutors" element={<Tutors />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
