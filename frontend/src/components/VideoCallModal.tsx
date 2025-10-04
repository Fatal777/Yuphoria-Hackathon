/**
 * VideoCallModal Component
 * Full-featured video call with WebRTC, AI chat, voice playback, and autonomous suggestions
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Send,
  Volume2,
  VolumeX,
  BookOpen,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useWebRTC } from "@/hooks/useWebRTC";

interface VideoCallModalProps {
  companionId: string;
  companionName: string;
  userId: string;
}

interface Suggestion {
  type: "course" | "material" | "exercise";
  title: string;
  description: string;
  icon: typeof BookOpen;
}

export const VideoCallModal = ({
  companionId,
  companionName,
  userId,
}: VideoCallModalProps) => {
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    roomId,
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    isMicEnabled,
    isCameraEnabled,
    messages,
    error,
    localVideoRef,
    remoteVideoRef,
    createRoom,
    joinRoom,
    startLocalMedia,
    sendMessage,
    toggleMic,
    toggleCamera,
    endCall,
  } = useWebRTC({
    userId,
    companionId,
  });

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Start local media
        await startLocalMedia();

        // Create room
        const newRoomId = await createRoom();

        // Join room
        await joinRoom(newRoomId);
      } catch (err) {
        console.error("Failed to initialize call:", err);
      }
    };

    initializeCall();

    return () => {
      endCall();
    };
  }, []);

  // Attach video streams to elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, localVideoRef]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, remoteVideoRef]);

  // Call duration timer
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Play audio when AI responds with audio_url
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === "ai" && lastMessage.audio_url) {
      playAudio(lastMessage.audio_url);
    }
  }, [messages]);

  // Generate autonomous suggestions based on conversation
  useEffect(() => {
    if (messages.length > 3 && messages.length % 5 === 0) {
      generateSuggestions();
    }
  }, [messages.length]);

  const playAudio = async (url: string) => {
    if (!audioRef.current) return;

    try {
      setIsPlayingAudio(true);
      audioRef.current.src = url;
      await audioRef.current.play();
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
  };

  const generateSuggestions = () => {
    // Analyze recent messages to generate contextual suggestions
    const recentMessages = messages.slice(-5);
    const topics = extractTopics(recentMessages);

    const newSuggestions: Suggestion[] = [
      {
        type: "course",
        title: `Advanced ${topics[0] || "Topics"}`,
        description: "Deep dive into advanced concepts",
        icon: BookOpen,
      },
      {
        type: "material",
        title: "Practice Exercises",
        description: "Hands-on problems to reinforce learning",
        icon: FileText,
      },
      {
        type: "exercise",
        title: "Quick Quiz",
        description: "Test your understanding",
        icon: Sparkles,
      },
    ];

    setSuggestions(newSuggestions);
  };

  const extractTopics = (msgs: typeof messages): string[] => {
    // Simple topic extraction (can be enhanced with NLP)
    const keywords = ["math", "science", "programming", "language", "history"];
    const found: string[] = [];

    msgs.forEach((msg) => {
      keywords.forEach((keyword) => {
        if (msg.message.toLowerCase().includes(keyword) && !found.includes(keyword)) {
          found.push(keyword);
        }
      });
    });

    return found.length > 0 ? found : ["general"];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput("");
  };

  const handleEndCall = async () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      await endCall();
      navigate("/history");
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} />

      {/* Header */}
      <div className="h-16 border-b border-slate-700/50 flex items-center justify-between px-6 glass-card">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">{companionName}</div>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md text-xs font-medium",
              isConnected
                ? "bg-green-500/20 text-green-400"
                : isConnecting
                ? "bg-yellow-500/20 text-yellow-400 pulse-indicator"
                : "bg-red-500/20 text-red-400"
            )}
          >
            <div className="w-2 h-2 rounded-full bg-current"></div>
            {isConnected
              ? "Connected"
              : isConnecting
              ? "Connecting..."
              : "Disconnected"}
          </div>
          {isPlayingAudio && (
            <div className="flex items-center gap-2 text-brand text-xs">
              <Volume2 className="w-4 h-4 animate-pulse" />
              Playing audio...
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md font-mono text-sm">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* AI Video Feed (D-ID or placeholder) */}
          <div className="w-full h-full">
            {messages[messages.length - 1]?.video_url ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                src={messages[messages.length - 1].video_url}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand/20 via-purple/20 to-pink/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-brand to-purple flex items-center justify-center">
                    {isConnecting ? (
                      <Loader2 className="w-16 h-16 text-white animate-spin" />
                    ) : (
                      <VideoIcon className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <p className="text-xl text-muted-foreground">
                    {isConnecting ? "Initializing AI..." : "AI Tutor"}
                  </p>
                </div>
              </div>
            )}
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
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
            />
            {!isCameraEnabled && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 border-l border-slate-700/50 flex flex-col bg-slate-900">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="font-display font-semibold">Chat & Suggestions</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
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
                  <p className="text-sm">{message.message}</p>
                  {message.audio_url && (
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <Volume2 className="w-3 h-3" />
                      Audio available
                    </div>
                  )}
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* AI Suggestions */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-2"
                >
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    AI Suggestions
                  </div>
                  {suggestions.map((suggestion, idx) => {
                    const Icon = suggestion.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-3 hover:border-brand/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-brand/20 group-hover:bg-brand/30 transition-colors">
                            <Icon className="w-4 h-4 text-brand" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{suggestion.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

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
                disabled={!isConnected}
              />
              <GradientButton
                onClick={handleSendMessage}
                size="icon"
                className="h-11 w-11 shrink-0"
                disabled={!isConnected || !messageInput.trim()}
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
          onClick={toggleMic}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110",
            isMicEnabled
              ? "bg-slate-700 hover:bg-slate-600"
              : "bg-red-500 hover:bg-red-600"
          )}
        >
          {isMicEnabled ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={toggleCamera}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110",
            isCameraEnabled
              ? "bg-slate-700 hover:bg-slate-600"
              : "bg-red-500 hover:bg-red-600"
          )}
        >
          {isCameraEnabled ? (
            <VideoIcon className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !audioRef.current.muted;
            }
          }}
          className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all hover:scale-110"
        >
          {isPlayingAudio ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <VolumeX className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};
