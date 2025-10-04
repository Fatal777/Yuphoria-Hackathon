import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Video, 
  MessageSquare, 
  Brain, 
  Clock, 
  Shield, 
  Zap,
  Users,
  Award,
  TrendingUp
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import heroBrain from "@/assets/hero-brain.jpg";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Landing = () => {
  const features = [
    {
      icon: Video,
      title: "Live Video Sessions",
      description: "Experience face-to-face learning with real-time video interactions that feel natural and engaging.",
      gradient: "from-brand to-purple"
    },
    {
      icon: MessageSquare,
      title: "Instant Chat Support",
      description: "Get immediate text responses alongside video for complex explanations and code examples.",
      gradient: "from-purple to-pink"
    },
    {
      icon: Brain,
      title: "Personalized Learning",
      description: "AI adapts to your learning style, pace, and knowledge level for optimal understanding.",
      gradient: "from-pink to-brand"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Learn whenever inspiration strikes. Your AI tutor is always ready to help, day or night.",
      gradient: "from-cyan-400 to-brand"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your learning sessions and data are protected with enterprise-grade security measures.",
      gradient: "from-green-400 to-cyan-400"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant responses with advanced AI processing. No waiting, just learning.",
      gradient: "from-yellow-400 to-orange-400"
    }
  ];

  const stats = [
    { icon: Users, value: "5,000+", label: "Active Learners", color: "brand" },
    { icon: Clock, value: "50,000+", label: "Learning Hours", color: "purple" },
    { icon: Award, value: "100+", label: "Expert Tutors", color: "pink" },
    { icon: TrendingUp, value: "4.9/5", label: "Average Rating", color: "cyan-400" }
  ];

  const steps = [
    {
      number: "01",
      icon: Users,
      title: "Create Account",
      description: "Sign up in seconds and set up your personalized learning profile."
    },
    {
      number: "02",
      icon: Brain,
      title: "Choose Your Tutor",
      description: "Browse our gallery of AI tutors specialized in different subjects."
    },
    {
      number: "03",
      icon: Video,
      title: "Start Video Session",
      description: "Connect instantly and begin your personalized learning journey."
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Master Your Subject",
      description: "Track progress, review sessions, and achieve your learning goals."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-bg opacity-30"></div>
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <motion.div 
            className="space-y-8 text-center lg:text-left"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-sm font-medium">Powered by Advanced AI Technology</span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight"
            >
              <span className="text-foreground">AI Video</span>
              <br />
              <span className="gradient-text">Tutor</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0"
            >
              Experience personalized learning through real-time video conversations with intelligent AI tutors. Get instant answers, visual explanations, and adaptive guidance.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <GradientButton asChild size="lg">
                <Link to="/tutors" className="group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </GradientButton>
              <GradientButton asChild variant="glass" size="lg">
                <a href="#demo">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </a>
              </GradientButton>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 pulse-indicator"></div>
                100% Free to Start
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand pulse-indicator"></div>
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple pulse-indicator"></div>
                Available 24/7
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl">
              <img 
                src={heroBrain} 
                alt="AI Brain Visualization" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            </div>
            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-10 -left-4 px-4 py-2 rounded-full glass-card text-sm font-medium"
            >
              Real-time Video
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute top-1/3 -right-4 px-4 py-2 rounded-full glass-card text-sm font-medium"
            >
              AI-Powered
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute bottom-10 left-1/4 px-4 py-2 rounded-full glass-card text-sm font-medium"
            >
              Interactive Chat
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-brand rounded-full"
            ></motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-surface-primary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center space-y-2"
              >
                <stat.icon className={`w-12 h-12 mx-auto text-${stat.color}`} />
                <div className="text-4xl md:text-5xl font-display font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold">
              Everything You Need to{" "}
              <span className="gradient-text">Learn Better</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed to accelerate your learning journey and help you achieve your goals faster.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 space-y-4 group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-display font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface-primary/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Getting started is simple. Follow these four easy steps to begin your learning journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-brand/50 via-purple/50 to-pink/50"></div>

            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center space-y-4"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-4 z-10">
                  <span className="text-2xl font-display font-bold gradient-text">{step.number}</span>
                </div>
                <div className="glass-card p-6 space-y-3">
                  <step.icon className="w-12 h-12 mx-auto text-brand" />
                  <h3 className="text-xl font-display font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-20"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-sm font-medium">Limited Time: Free Beta Access</span>
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold">
              Ready to Transform Your{" "}
              <span className="gradient-text">Learning?</span>
            </h2>

            <p className="text-xl text-muted-foreground">
              Join thousands of learners who are already experiencing the future of education. Start your journey today.
            </p>

            <GradientButton asChild size="lg" className="text-lg">
              <Link to="/tutors">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </GradientButton>

            <p className="text-sm text-muted-foreground">
              No credit card required • Cancel anytime • 100% free to start
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
