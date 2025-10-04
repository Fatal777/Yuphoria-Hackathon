/**
 * useWebRTC Hook
 * Manages WebRTC peer connections, Socket.IO signaling, and media streams
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

interface UseWebRTCOptions {
  roomId?: string;
  userId: string;
  companionId?: string;
}

interface Message {
  message: string;
  sender: 'user' | 'ai';
  timestamp: number;
  audio_url?: string;
  video_url?: string;
}

export const useWebRTC = ({ roomId: initialRoomId, userId, companionId }: UseWebRTCOptions) => {
  const [roomId, setRoomId] = useState<string | null>(initialRoomId || null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    socket.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.current.on('connect', () => {
      console.log('Socket.IO connected');
    });

    socket.current.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socket.current.on('error', (err: any) => {
      console.error('Socket.IO error:', err);
      setError('Connection error');
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  // Get ICE servers configuration
  const getIceServers = async (): Promise<RTCIceServer[]> => {
    try {
      const response = await fetch(`${API_URL}/api/video/webrtc/config`);
      const data = await response.json();
      return data.iceServers;
    } catch (err) {
      console.error('Failed to get ICE servers:', err);
      // Fallback to public STUN server
      return [{ urls: 'stun:stun.l.google.com:19302' }];
    }
  };

  // Create room
  const createRoom = useCallback(async (): Promise<string> => {
    if (!companionId) {
      throw new Error('Companion ID is required');
    }

    try {
      const response = await fetch(`${API_URL}/api/video/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          companion_id: companionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const data = await response.json();
      setRoomId(data.room_id);
      return data.room_id;
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room');
      throw err;
    }
  }, [userId, companionId]);

  // Start local media
  const startLocalMedia = useCallback(async (constraints?: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        constraints || {
          video: { width: 1280, height: 720 },
          audio: true,
        }
      );

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera/microphone');
      throw err;
    }
  }, []);

  // Initialize peer connection
  const initializePeerConnection = useCallback(async () => {
    const iceServers = await getIceServers();

    peerConnection.current = new RTCPeerConnection({
      iceServers,
    });

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.current!.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      console.log('Received remote track');
      const [stream] = event.streams;
      setRemoteStream(stream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && socket.current && roomId) {
        socket.current.emit('candidate', {
          room_id: roomId,
          candidate: event.candidate.toJSON(),
          from: userId,
        });
      }
    };

    // Connection state changes
    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current?.connectionState;
      console.log('Connection state:', state);

      if (state === 'connected') {
        setIsConnected(true);
        setIsConnecting(false);
      } else if (state === 'disconnected' || state === 'failed') {
        setIsConnected(false);
      }
    };

    return peerConnection.current;
  }, [localStream, roomId, userId]);

  // Join room
  const joinRoom = useCallback(async (targetRoomId: string) => {
    if (!socket.current) {
      throw new Error('Socket not initialized');
    }

    setIsConnecting(true);
    setRoomId(targetRoomId);

    // Initialize peer connection
    await initializePeerConnection();

    // Join room via Socket.IO
    socket.current.emit('join', {
      room_id: targetRoomId,
      user_id: userId,
      role: 'user',
    });

    // Listen for peer joined
    socket.current.on('peer-joined', async (data: any) => {
      console.log('Peer joined:', data);

      // Create and send offer
      if (peerConnection.current) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.current!.emit('offer', {
          room_id: targetRoomId,
          sdp: offer,
          from: userId,
        });
      }
    });

    // Handle incoming offer
    socket.current.on('offer', async (data: any) => {
      console.log('Received offer');

      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.current!.emit('answer', {
          room_id: targetRoomId,
          sdp: answer,
          from: userId,
        });
      }
    });

    // Handle incoming answer
    socket.current.on('answer', async (data: any) => {
      console.log('Received answer');

      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );
      }
    });

    // Handle ICE candidates
    socket.current.on('candidate', async (data: any) => {
      console.log('Received ICE candidate');

      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    });

    // Handle chat messages
    socket.current.on('message', (data: Message) => {
      console.log('Received message:', data);
      setMessages((prev) => [...prev, data]);
    });

  }, [userId, initializePeerConnection]);

  // Send message
  const sendMessage = useCallback((text: string) => {
    if (!socket.current || !roomId) return;

    const message: Message = {
      message: text,
      sender: 'user',
      timestamp: Date.now() / 1000,
    };

    socket.current.emit('message', {
      room_id: roomId,
      message: text,
      sender: 'user',
    });

    setMessages((prev) => [...prev, message]);
  }, [roomId]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // End call
  const endCall = useCallback(async () => {
    // Stop local tracks
    localStream?.getTracks().forEach((track) => track.stop());

    // Close peer connection
    peerConnection.current?.close();

    // Leave room
    if (socket.current && roomId) {
      socket.current.emit('leave', {
        room_id: roomId,
        user_id: userId,
      });

      // Delete room
      try {
        await fetch(`${API_URL}/api/video/rooms/${roomId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Error deleting room:', err);
      }
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
    setRoomId(null);
  }, [localStream, roomId, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    // State
    roomId,
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    isMicEnabled,
    isCameraEnabled,
    messages,
    error,

    // Refs for video elements
    localVideoRef,
    remoteVideoRef,

    // Methods
    createRoom,
    joinRoom,
    startLocalMedia,
    sendMessage,
    toggleMic,
    toggleCamera,
    endCall,
  };
};
