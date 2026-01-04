import { useState, useRef, useCallback } from 'react';

interface UseVoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceInput = ({ onTranscript, onError }: UseVoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError?.('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        onError?.('Microphone access denied. Please enable microphone permissions.');
      } else if (event.error === 'no-speech') {
        onError?.('No speech detected. Please try again.');
      } else {
        onError?.('Voice recognition failed. Please try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    startListening,
    stopListening,
    toggleListening,
  };
};
