import { motion } from "framer-motion";
import { Clock, MessageSquare, Video, RefreshCw, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";

interface Session {
  id: string;
  tutorName: string;
  tutorAvatar: string;
  subject: string;
  date: Date;
  duration: number; // in minutes
  messageCount: number;
  transcript: string;
}

// Mock session data
const sessions: Session[] = [
  {
    id: "1",
    tutorName: "Dr. Sarah Chen",
    tutorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    subject: "Calculus",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    duration: 45,
    messageCount: 23,
    transcript: "Discussed derivatives and chain rule applications with practical examples...",
  },
  {
    id: "2",
    tutorName: "Prof. James Wilson",
    tutorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    subject: "Python Programming",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    duration: 60,
    messageCount: 31,
    transcript: "Covered object-oriented programming concepts and implemented a simple class...",
  },
  {
    id: "3",
    tutorName: "Dr. Maria Garcia",
    tutorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    subject: "Spanish Grammar",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    duration: 30,
    messageCount: 18,
    transcript: "Practiced subjunctive mood and common irregular verbs in conversational context...",
  },
  {
    id: "4",
    tutorName: "Prof. David Kim",
    tutorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    subject: "Organic Chemistry",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    duration: 50,
    messageCount: 27,
    transcript: "Explored reaction mechanisms and stereochemistry with molecular models...",
  },
  {
    id: "5",
    tutorName: "Dr. Emily Brown",
    tutorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    subject: "Art History",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    duration: 40,
    messageCount: 15,
    transcript: "Analyzed Renaissance art movements and compared different artistic techniques...",
  },
];

export const History = () => {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-4"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold">
            Your Learning <span className="gradient-text">Journey</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Review your past sessions, track your progress, and continue where you left off
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8 overflow-x-auto pb-2"
        >
          <button className="px-4 py-2 rounded-full bg-brand text-brand-foreground font-medium text-sm whitespace-nowrap shadow-glow-brand">
            All Sessions
          </button>
          <button className="px-4 py-2 rounded-full glass-card font-medium text-sm whitespace-nowrap hover:border-brand/50">
            This Week
          </button>
          <button className="px-4 py-2 rounded-full glass-card font-medium text-sm whitespace-nowrap hover:border-brand/50">
            This Month
          </button>
        </motion.div>

        {/* Sessions Timeline */}
        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-6">
              No sessions yet. Start your first call!
            </p>
            <GradientButton asChild>
              <Link to="/tutors">Browse Tutors</Link>
            </GradientButton>
          </div>
        ) : (
          <div className="relative space-y-8">
            {/* Timeline Line */}
            <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-0.5 bg-brand/30"></div>

            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-brand border-4 border-background z-10"></div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:flex-1"></div>

                {/* Session Card */}
                <div className="flex-1 ml-16 md:ml-0 glass-card p-6 space-y-4 hover:border-brand/50 transition-all">
                  <div className="flex items-start gap-4">
                    {/* Tutor Avatar */}
                    <img
                      src={session.tutorAvatar}
                      alt={session.tutorName}
                      className="w-16 h-16 rounded-full border-2 border-brand/30"
                    />

                    {/* Session Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-display font-semibold">
                            {session.tutorName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{session.subject}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(session.date)}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {session.messageCount} messages
                        </div>
                      </div>

                      {/* Transcript Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.transcript}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <GradientButton variant="outline" size="sm">
                          <FileText className="w-4 h-4" />
                          View Transcript
                        </GradientButton>
                        <GradientButton variant="ghost" size="sm">
                          <RefreshCw className="w-4 h-4" />
                          Restart Session
                        </GradientButton>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid sm:grid-cols-3 gap-6"
        >
          <div className="glass-card p-6 text-center space-y-2">
            <Video className="w-8 h-8 mx-auto text-brand" />
            <div className="text-3xl font-display font-bold gradient-text">{sessions.length}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </div>
          <div className="glass-card p-6 text-center space-y-2">
            <Clock className="w-8 h-8 mx-auto text-purple" />
            <div className="text-3xl font-display font-bold gradient-text">
              {sessions.reduce((acc, s) => acc + s.duration, 0)} min
            </div>
            <div className="text-sm text-muted-foreground">Total Learning Time</div>
          </div>
          <div className="glass-card p-6 text-center space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-pink" />
            <div className="text-3xl font-display font-bold gradient-text">
              {sessions.reduce((acc, s) => acc + s.messageCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Messages Exchanged</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
