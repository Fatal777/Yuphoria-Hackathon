import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Video, Play, Brain, Globe, Code, Calculator, Palette, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";

// Mock data for tutors
const tutors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    expertise: "Mathematics & Physics",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    available: true,
    tags: ["Calculus", "Linear Algebra", "Mechanics"],
    description: "Passionate about making complex mathematical concepts accessible and engaging.",
    accent: "brand"
  },
  {
    id: 2,
    name: "Prof. James Wilson",
    expertise: "Computer Science",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    available: true,
    tags: ["Python", "Algorithms", "Data Structures"],
    description: "20+ years of experience in software development and computer science education.",
    accent: "purple"
  },
  {
    id: 3,
    name: "Dr. Maria Garcia",
    expertise: "Languages & Literature",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    available: false,
    tags: ["Spanish", "French", "Writing"],
    description: "Multilingual educator specializing in language acquisition and creative writing.",
    accent: "pink"
  },
  {
    id: 4,
    name: "Prof. David Kim",
    expertise: "Biology & Chemistry",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    available: true,
    tags: ["Biology", "Organic Chemistry", "Biochemistry"],
    description: "Making science fascinating through visual demonstrations and real-world examples.",
    accent: "cyan-400"
  },
  {
    id: 5,
    name: "Dr. Emily Brown",
    expertise: "Art & Design",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    available: true,
    tags: ["Painting", "Digital Art", "Design Theory"],
    description: "Award-winning artist with a passion for teaching creative expression.",
    accent: "pink"
  },
  {
    id: 6,
    name: "Prof. Alex Turner",
    expertise: "Music Theory",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    available: true,
    tags: ["Piano", "Composition", "Music Theory"],
    description: "Professional musician helping students develop their musical talents.",
    accent: "purple"
  },
  {
    id: 7,
    name: "Dr. Lisa Anderson",
    expertise: "History & Philosophy",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    available: false,
    tags: ["World History", "Ethics", "Critical Thinking"],
    description: "Bringing historical events and philosophical concepts to life through engaging discussions.",
    accent: "brand"
  },
  {
    id: 8,
    name: "Prof. Michael Lee",
    expertise: "Economics & Business",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    available: true,
    tags: ["Economics", "Finance", "Marketing"],
    description: "Former consultant with expertise in business strategy and economic theory.",
    accent: "cyan-400"
  },
];

const subjectIcons: { [key: string]: any } = {
  "Mathematics & Physics": Calculator,
  "Computer Science": Code,
  "Languages & Literature": Globe,
  "Biology & Chemistry": Brain,
  "Art & Design": Palette,
  "Music Theory": Music,
  "History & Philosophy": Brain,
  "Economics & Business": Calculator,
};

export const Tutors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubject === "all" || tutor.expertise.includes(selectedSubject);

    return matchesSearch && matchesSubject;
  });

  const subjects = ["all", ...new Set(tutors.map((t) => t.expertise))];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold">
            Choose Your <span className="gradient-text">AI Tutor</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select from our diverse range of expert AI tutors specialized in different subjects
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by subject or tutor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg glass-card border-slate-700/50 focus:border-brand"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSubject === subject
                    ? "bg-brand text-brand-foreground shadow-glow-brand"
                    : "glass-card hover:border-brand/50"
                }`}
              >
                {subject === "all" ? "All Subjects" : subject}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tutors Grid */}
        {filteredTutors.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No tutors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutors.map((tutor, index) => {
              const SubjectIcon = subjectIcons[tutor.expertise] || Brain;
              
              return (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6 space-y-4 hover:scale-[1.02] transition-all group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-brand/30 group-hover:border-brand/60 transition-colors">
                      <img
                        src={tutor.avatar}
                        alt={tutor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Availability Badge */}
                    <div
                      className={`absolute bottom-2 right-1/2 translate-x-[50%] w-4 h-4 rounded-full border-2 border-background ${
                        tutor.available ? "bg-green-400" : "bg-gray-400"
                      }`}
                    ></div>
                  </div>

                  {/* Info */}
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-display font-semibold">{tutor.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <SubjectIcon className="w-4 h-4" />
                      <span className="text-sm">{tutor.expertise}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {tutor.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-brand/20 text-brand text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center line-clamp-3">
                    {tutor.description}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <GradientButton asChild className="w-full">
                      <Link to={`/session/${tutor.id}`}>
                        <Video className="w-4 h-4" />
                        Start Session
                      </Link>
                    </GradientButton>
                    <GradientButton variant="ghost" className="w-full" size="sm">
                      <Play className="w-4 h-4" />
                      Preview Voice
                    </GradientButton>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
