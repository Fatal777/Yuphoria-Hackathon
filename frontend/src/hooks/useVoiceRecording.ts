/**
 * useVoiceRecording Hook
 * Handles voice recording and real-time speech-to-text transcription
 */
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecordingOptions {
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  continuous?: boolean;
  language?: string;
}

export const useVoiceRecording = ({
  onTranscript,
  onFinalTranscript,
  continuous = true,
  language = 'en-US',
}: UseVoiceRecordingOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check if browser supports Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcriptPart + ' ';
          } else {
            interimText += transcriptPart;
          }
        }

        if (interimText) {
          setInterimTranscript(interimText);
          onTranscript?.(interimText);
        }

        if (finalText) {
          setTranscript((prev) => prev + finalText);
          setInterimTranscript('');
          onFinalTranscript?.(finalText.trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('No speech detected');
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecording && continuous) {
          // Restart if still recording and continuous mode
          try {
            recognitionRef.current?.start();
          } catch (err) {
            console.error('Error restarting recognition:', err);
          }
        } else {
          setIsRecording(false);
        }
      };
    } else {
      console.warn('Web Speech API not supported in this browser');
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [continuous, language, onTranscript, onFinalTranscript]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      console.error('Speech recognition not available');
      return;
    }

    try {
      setTranscript('');
      setInterimTranscript('');
      setIsRecording(true);
      recognitionRef.current.start();
      console.log('Voice recording started');
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsRecording(false);
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
        console.log('Voice recording stopped');
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isRecording,
    transcript,
    interimTranscript,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscript,
  };
};
