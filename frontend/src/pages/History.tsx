import { motion } from "framer-motion";
import { Clock, MessageSquare, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";

interface Session {
  id: string;
  tutorName: string;
  tutorAvatar: string;
  subject: string;
  date: Date;
  duration: number;
  messageCount: number;
  transcript: string;
}

const sessions: Session[] = [
  {
    id: "1",
    tutorName: "Dr. Sarah Chen",
    tutorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    subject: "Calculus",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 45,
    messageCount: 23,
    transcript: "Discussed derivatives and chain rule applications with practical examples...",
  },
  {
    id: "2",
    tutorName: "Prof. James Wilson",
    tutorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    subject: "Python Programming",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 60,
    messageCount: 31,
    transcript: "Covered object-oriented programming concepts and implemented a simple class...",
  },
  {
    id: "3",
    tutorName: "Dr. Sarah Chen",
    tutorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    subject: "Physics",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    duration: 50,
    messageCount: 27,
    transcript: "Explored Newton's laws and worked through mechanics problems...",
  }
];

export const History = () => {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold">
            My <span className="gradient-text">Sessions</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Review your past sessions and track your progress
          </p>
        </motion.div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-6">
              No sessions yet. Start your first session!
            </p>
            <GradientButton asChild>
              <Link to="/tutors">Find Tutors</Link>
            </GradientButton>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:border-brand/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Tutor Avatar */}
                  <img
                    src={session.tutorAvatar}
                    alt={session.tutorName}
                    className="w-14 h-14 rounded-2xl border-2 border-brand/20"
                  />

                  {/* Session Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-display font-semibold">
                          {session.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground">{session.tutorName}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(session.date)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {session.duration} min
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        {session.messageCount} messages
                      </div>
                    </div>

                    {/* Transcript Preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.transcript}
                    </p>

                    {/* Action */}
                    <GradientButton variant="outline" size="sm">
                      <FileText className="w-4 h-4" />
                      View Transcript
                    </GradientButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid sm:grid-cols-3 gap-4"
          >
            <div className="glass-card p-6 text-center space-y-2">
              <div className="text-3xl font-display font-bold gradient-text">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="glass-card p-6 text-center space-y-2">
              <div className="text-3xl font-display font-bold gradient-text">
                {sessions.reduce((acc, s) => acc + s.duration, 0)} min
              </div>
              <div className="text-sm text-muted-foreground">Learning Time</div>
            </div>
            <div className="glass-card p-6 text-center space-y-2">
              <div className="text-3xl font-display font-bold gradient-text">
                {sessions.reduce((acc, s) => acc + s.messageCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
