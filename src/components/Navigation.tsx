import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Video } from "lucide-react";
import { GradientButton } from "./ui/gradient-button";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tutors", href: "/tutors" },
    { name: "History", href: "/history" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-brand to-purple">
            <Video className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-display font-bold">
            <span className="text-foreground">AI</span>
            <span className="gradient-text">Tutor</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <GradientButton asChild size="default">
            <Link to="/tutors">Get Started Free</Link>
          </GradientButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-foreground hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 transition-all duration-300",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <GradientButton asChild size="default" className="w-full mt-2">
            <Link to="/tutors" onClick={() => setMobileMenuOpen(false)}>
              Get Started Free
            </Link>
          </GradientButton>
        </div>
      </div>
    </nav>
  );
};
