import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Send,
  MoreVertical,
  Maximize2,
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export const VideoCall = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [callDuration, setCallDuration] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm ready to help you learn. What would you like to focus on today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isAITyping, setIsAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate connection establishment
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnectionStatus("connected");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (connectionStatus !== "connected") return;
    
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
    
    // Simulate AI response
    setIsAITyping(true);
    setTimeout(() => {
      setIsAITyping(false);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand your question. Let me explain that in detail...",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 2000);
  };

  const handleEndCall = () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      navigate("/history");
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-slate-700/50 flex items-center justify-between px-6 glass-card">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">Session #{tutorId}</div>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md text-xs font-medium",
              connectionStatus === "connected"
                ? "bg-green-500/20 text-green-400"
                : connectionStatus === "connecting"
                ? "bg-yellow-500/20 text-yellow-400 pulse-indicator"
                : "bg-red-500/20 text-red-400"
            )}
          >
            <div className="w-2 h-2 rounded-full bg-current"></div>
            {connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Connecting..." : "Disconnected"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md font-mono text-sm">
            {formatDuration(callDuration)}
          </div>
          <button className="p-2 hover:bg-slate-800/60 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* AI Video Feed */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-brand/20 via-purple/20 to-pink/20 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-brand to-purple flex items-center justify-center">
                  <VideoIcon className="w-16 h-16 text-white" />
                </div>
                <p className="text-xl text-muted-foreground">AI Tutor Video Feed</p>
              </div>
            </div>
          </div>

          {/* User PiP */}
          <motion.div
            drag
            dragConstraints={{
              top: 0,
              left: 0,
              right: window.innerWidth * 0.65,
              bottom: window.innerHeight - 300,
            }}
            className="absolute bottom-6 right-6 w-48 h-36 rounded-lg overflow-hidden border-2 border-brand shadow-xl cursor-move"
          >
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              {isCameraOn ? (
                <div className="text-center">
                  <VideoIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Your Camera</p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Camera Off</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Maximize Button */}
          <button className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md rounded-lg hover:bg-black/60 transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 border-l border-slate-700/50 flex flex-col bg-slate-900">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="font-display font-semibold">Chat</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.sender === "user"
                      ? "bg-brand text-brand-foreground"
                      : "bg-slate-800 text-foreground"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isAITyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-700/50 space-y-2">
            <div className="flex gap-2">
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 resize-none glass-card border-slate-700/50 focus:border-brand min-h-[44px] max-h-32"
                rows={2}
              />
              <GradientButton
                onClick={handleSendMessage}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                <Send className="w-5 h-5" />
              </GradientButton>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="h-20 border-t border-slate-700/50 flex items-center justify-center gap-4 glass-card">
        <button
          onClick={() => setIsMicOn(!isMicOn)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110",
            isMicOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-500 hover:bg-red-600"
          )}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={() => setIsCameraOn(!isCameraOn)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110",
            isCameraOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-500 hover:bg-red-600"
          )}
        >
          {isCameraOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={() => setIsRecording(!isRecording)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110",
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-600"
          )}
        >
          <div className={cn("w-6 h-6 rounded-full", isRecording ? "bg-white pulse-indicator" : "bg-white")} />
        </button>

        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
