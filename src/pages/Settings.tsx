import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Video as VideoIcon,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  Camera,
  Mic,
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Settings = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", name: "Profile", icon: User },
    { id: "video", name: "Video & Audio", icon: VideoIcon },
    { id: "preferences", name: "Preferences", icon: Bell },
    { id: "privacy", name: "Privacy", icon: Shield },
    { id: "help", name: "Help & Support", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your account and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-card p-4 space-y-2 sticky top-24">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeSection === section.id
                      ? "bg-brand text-brand-foreground shadow-glow-brand"
                      : "hover:bg-slate-800/60"
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div className="glass-card p-8 space-y-6">
                  <h2 className="text-2xl font-display font-semibold">Profile Information</h2>

                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand to-purple flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <GradientButton size="sm">Upload Photo</GradientButton>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue="John Doe"
                        className="glass-card border-slate-700/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="john@example.com"
                        disabled
                        className="glass-card border-slate-700/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="glass-card border-slate-700/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <GradientButton>Save Changes</GradientButton>
                  </div>
                </div>
              </div>
            )}

            {/* Video & Audio Section */}
            {activeSection === "video" && (
              <div className="space-y-6">
                <div className="glass-card p-8 space-y-6">
                  <h2 className="text-2xl font-display font-semibold">Video & Audio Settings</h2>

                  <div className="space-y-6">
                    {/* Camera */}
                    <div className="space-y-3">
                      <Label>Camera Device</Label>
                      <Select defaultValue="default">
                        <SelectTrigger className="glass-card border-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Camera</SelectItem>
                          <SelectItem value="camera1">HD Webcam (Camera 1)</SelectItem>
                          <SelectItem value="camera2">Built-in Camera</SelectItem>
                        </SelectContent>
                      </Select>
                      <GradientButton variant="outline" size="sm">
                        <Camera className="w-4 h-4" />
                        Test Camera
                      </GradientButton>
                    </div>

                    {/* Microphone */}
                    <div className="space-y-3">
                      <Label>Microphone</Label>
                      <Select defaultValue="default">
                        <SelectTrigger className="glass-card border-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Microphone</SelectItem>
                          <SelectItem value="mic1">USB Microphone</SelectItem>
                          <SelectItem value="mic2">Built-in Microphone</SelectItem>
                        </SelectContent>
                      </Select>
                      <GradientButton variant="outline" size="sm">
                        <Mic className="w-4 h-4" />
                        Test Microphone
                      </GradientButton>
                    </div>

                    {/* Video Quality */}
                    <div className="space-y-3">
                      <Label>Video Quality</Label>
                      <Select defaultValue="720p">
                        <SelectTrigger className="glass-card border-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="480p">480p (Standard)</SelectItem>
                          <SelectItem value="720p">720p (HD - Recommended)</SelectItem>
                          <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <GradientButton>Save Settings</GradientButton>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === "preferences" && (
              <div className="space-y-6">
                <div className="glass-card p-8 space-y-6">
                  <h2 className="text-2xl font-display font-semibold">Learning Preferences</h2>

                  <div className="space-y-6">
                    {/* Toggles */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enable Captions</Label>
                        <p className="text-sm text-muted-foreground">
                          Show live captions during video sessions
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto-record Sessions</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically save session recordings
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about your learning progress
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    {/* Language */}
                    <div className="space-y-3">
                      <Label>Preferred Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="glass-card border-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subjects */}
                    <div className="space-y-3">
                      <Label>Preferred Subjects</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Math", "Science", "Programming", "Languages", "Art", "Music"].map(
                          (subject) => (
                            <button
                              key={subject}
                              className="px-4 py-2 rounded-full glass-card hover:border-brand/50 text-sm font-medium"
                            >
                              {subject}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <GradientButton>Save Preferences</GradientButton>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <div className="space-y-6">
                <div className="glass-card p-8 space-y-6">
                  <h2 className="text-2xl font-display font-semibold">Privacy & Security</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <GradientButton variant="outline" size="sm">
                        Enable
                      </GradientButton>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Session History</Label>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your learning history
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Data Sharing</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow anonymous usage data to improve the platform
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <GradientButton variant="outline">Change Password</GradientButton>
                  </div>
                </div>
              </div>
            )}

            {/* Help Section */}
            {activeSection === "help" && (
              <div className="space-y-6">
                <div className="glass-card p-8 space-y-6">
                  <h2 className="text-2xl font-display font-semibold">Help & Support</h2>

                  <div className="space-y-4">
                    <a
                      href="#"
                      className="block p-4 glass-card hover:border-brand/50 transition-all"
                    >
                      <h3 className="font-semibold mb-1">Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how to get the most out of AI Video Tutor
                      </p>
                    </a>

                    <a
                      href="#"
                      className="block p-4 glass-card hover:border-brand/50 transition-all"
                    >
                      <h3 className="font-semibold mb-1">FAQs</h3>
                      <p className="text-sm text-muted-foreground">
                        Find answers to common questions
                      </p>
                    </a>

                    <a
                      href="#"
                      className="block p-4 glass-card hover:border-brand/50 transition-all"
                    >
                      <h3 className="font-semibold mb-1">Contact Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Get help from our support team
                      </p>
                    </a>

                    <div className="pt-4">
                      <Label className="mb-2 block">Feedback</Label>
                      <Textarea
                        placeholder="Tell us how we can improve..."
                        rows={4}
                        className="glass-card border-slate-700/50 mb-3"
                      />
                      <GradientButton>Submit Feedback</GradientButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
