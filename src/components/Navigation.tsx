import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
import { GradientButton } from "./ui/gradient-button";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Find Tutors", href: "/tutors" },
    { name: "My Sessions", href: "/history" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass-card border border-border/40 bg-background/80 backdrop-blur-2xl px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-brand to-accent">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              <span className="gradient-text">Elevate</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-secondary/50 rounded-2xl transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <GradientButton asChild size="sm">
              <Link to="/tutors">Get Started</Link>
            </GradientButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-surface-secondary/50 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 overflow-hidden",
            mobileMenuOpen ? "max-h-96 opacity-100 mt-4 pt-4 border-t border-border/30" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-secondary/50 rounded-2xl transition-all"
              >
                {link.name}
              </Link>
            ))}
            <GradientButton asChild size="sm" className="w-full mt-2">
              <Link to="/tutors" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </GradientButton>
          </div>
        </div>
      </div>
    </nav>
  );
};
