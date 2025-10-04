import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Brain, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Companion {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  voice_id: string;
  tags: string[];
}

export const Tutors = () => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        console.log('Fetching companions from:', `${API_URL}/api/companions`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_URL}/api/companions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch tutors`);
        }
        
        const data = await response.json();
        console.log('Received companions:', data.length);
        
        setCompanions(data.slice(0, 2)); // Show only 2 tutors
      } catch (err: any) {
        console.error('Error fetching companions:', err);
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check if backend is running.');
        } else {
          setError(`Failed to load tutors: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanions();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold">
            Meet Your <span className="gradient-text">Tutors</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert AI tutors specialized in different subjects
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-brand" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card p-8 max-w-2xl mx-auto text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">Oops!</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Tutors Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {companions.map((tutor, index) => (
            <motion.div
              key={tutor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 space-y-6 hover:border-brand/50 transition-all group"
            >
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-brand/30 group-hover:border-brand/60 transition-all">
                  <img
                    src={tutor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.name}`}
                    alt={tutor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Availability Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
                    <span className="text-xs font-medium text-brand">Available</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="text-center space-y-3">
                <h3 className="text-xl font-display font-semibold">{tutor.name}</h3>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Brain className="w-4 h-4" />
                  <span className="text-xs">{tutor.tags[0] || 'AI Tutor'}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2">
                {tutor.tags.slice(0, 3).filter(Boolean).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground text-center leading-relaxed line-clamp-3">
                {tutor.description}
              </p>

              {/* Action */}
              <GradientButton asChild className="w-full">
                <Link to={`/session/${tutor.id}`}>
                  <Video className="w-4 h-4" />
                  Start Session
                </Link>
              </GradientButton>
            </motion.div>
          ))}
          </div>
        )}

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center glass-card p-8 max-w-2xl mx-auto"
        >
          <Brain className="w-12 h-12 mx-auto text-brand mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">More Tutors Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            We're expanding our team of expert tutors. Stay tuned for specialists in languages, arts, business, and more.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
