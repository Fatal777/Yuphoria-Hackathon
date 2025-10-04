import { motion } from "framer-motion";
import { Video, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";

// Only 2 tutors for now
const tutors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    expertise: "Mathematics & Science",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    available: true,
    tags: ["Calculus", "Physics", "Chemistry"],
    description: "Expert in making complex STEM concepts accessible and engaging through visual demonstrations."
  },
  {
    id: 2,
    name: "Prof. James Wilson",
    expertise: "Computer Science",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    available: true,
    tags: ["Python", "Algorithms", "Web Dev"],
    description: "20+ years of experience in software development and computer science education."
  }
];

export const Tutors = () => {
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

        {/* Tutors Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {tutors.map((tutor, index) => (
            <motion.div
              key={tutor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 space-y-6 hover:border-brand/50 transition-all group"
            >
              {/* Avatar */}
              <div className="relative w-32 h-32 mx-auto">
                <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-brand/30 group-hover:border-brand/60 transition-all">
                  <img
                    src={tutor.avatar}
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
                <h3 className="text-2xl font-display font-semibold">{tutor.name}</h3>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">{tutor.expertise}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2">
                {tutor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
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
