import { useState, useRef, useEffect } from 'react';
import { LiveNote } from '@/types/notes';

// Define a message interface for consistency
interface TranscriptionMessage {
  id: number;
  text: string;
  timestamp: string;
}

interface AudioTranscriptionHook {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  activeMessage: TranscriptionMessage | null; // Current message being transcribed
  completedMessages: TranscriptionMessage[]; // History of completed messages
  error: string | null;
  // Adding properties expected by LiveNoteCapturePage
  transcribedText: string; // Current transcript text
  isPaused: boolean; // Whether speech is paused
  messageId: number; // Current message ID
  shouldCreateNewMessage: boolean; // Whether to create a new message
}

export const useAudioTranscription = (patientId: string): AudioTranscriptionHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [activeMessage, setActiveMessage] = useState<TranscriptionMessage | null>(null);
  const [completedMessages, setCompletedMessages] = useState<TranscriptionMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldCreateNewMessage, setShouldCreateNewMessage] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | undefined>(undefined);
  const websocketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Create a stable ID for the entire session
  const sessionIdRef = useRef<number>(Date.now());
  // Track previous message length for better transcript management
  const previousMessageLengthRef = useRef<number>(0);
  // Keep track of the complete conversation so far
  const accumulatedConversationRef = useRef<string>('');
  // Keep track of the current utterance being transcribed
  const currentUtteranceRef = useRef<string>('');
  // Track if we've detected a new utterance
  const isNewUtteranceRef = useRef<boolean>(false);
  
  const convertToPCM16 = (inputData: Float32Array): ArrayBuffer => {
    const pcmData = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcmData.buffer;
  };

  // Function to finalize the current message and add it to history
  const finalizeCurrentMessage = () => {
    if (activeMessage && activeMessage.text.trim() !== '') {
      // Add current message to completed messages
      console.log("Finalizing message:", activeMessage.text);
      setCompletedMessages(prev => [...prev, { ...activeMessage }]);
      
      // Don't reset active message - keep it for the entire session
      // setActiveMessage(null);
    }
  };

  // Function to detect silence - just for UI feedback
  const detectSilence = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    // Only detect silence for UI feedback, but don't finalize the message
    silenceTimerRef.current = setTimeout(() => {
      if (activeMessage && activeMessage.text === lastTranscriptRef.current && activeMessage.text.trim() !== '') {
        console.log("Silence detected, but keeping the same message");
        
        // If we have a current utterance, add it to the accumulated conversation
        if (currentUtteranceRef.current.trim()) {
          // If we already have text, add a space before the new utterance
          if (accumulatedConversationRef.current && !accumulatedConversationRef.current.endsWith(' ')) {
            accumulatedConversationRef.current += ' ';
          }
          
          // Add current utterance to the accumulated conversation
          accumulatedConversationRef.current += currentUtteranceRef.current;
          currentUtteranceRef.current = '';
          isNewUtteranceRef.current = true;
        }
        
        setIsPaused(true);
      }
    }, 2000); // Consider speech paused after 2 seconds of no changes
  };
  
  const startRecording = async (): Promise<void> => {
    try {
      setError(null);
      // Generate a new session ID 
      sessionIdRef.current = Date.now();
      
      // Reset transcript tracking
      previousMessageLengthRef.current = 0;
      accumulatedConversationRef.current = '';
      currentUtteranceRef.current = '';
      isNewUtteranceRef.current = false;
      
      // Create a single active message for the entire session
      setActiveMessage({
        id: sessionIdRef.current,
        text: '',
        timestamp: new Date().toLocaleString()
      });
      
      setCompletedMessages([]);
      lastTranscriptRef.current = '';
      
      // Initialize audio context with 16kHz sample rate
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });

      // Get user media - this will prompt for permission if not already granted
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Set up WebSocket connection - using localhost:3000 for testing
      websocketRef.current = new WebSocket('ws://localhost:3000');
      websocketRef.current.binaryType = 'arraybuffer';

      websocketRef.current.onopen = () => {
        console.log('WebSocket connection opened.');
        setIsRecording(true);

        if (!audioContextRef.current) {
          console.error('AudioContext is not initialized.');
          return;
        }

        // Create ScriptProcessorNode for audio processing
        processorNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        processorNodeRef.current.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const pcmData = convertToPCM16(inputData);
          if (websocketRef.current?.readyState === WebSocket.OPEN) {
            websocketRef.current.send(pcmData);
          }
        };

        source.connect(processorNodeRef.current);
        processorNodeRef.current.connect(audioContextRef.current.destination);
      };

      websocketRef.current.onmessage = (event) => {
        try {
          console.log('WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
          
          if (data.partialTranscript && data.partialTranscript.trim() !== '') { 
            const newTranscript = data.partialTranscript.trim();
            
            // Detect if this is a new utterance (much shorter than previous)
            // or server restart
            if (newTranscript.length < previousMessageLengthRef.current / 2) {
              console.log('Detected new utterance or restart');
              
              // If we had a previous utterance, add it to the accumulated conversation
              if (currentUtteranceRef.current.trim() !== '') {
                // Add space if needed
                if (accumulatedConversationRef.current && !accumulatedConversationRef.current.endsWith(' ')) {
                  accumulatedConversationRef.current += ' ';
                }
                
                // Add the completed utterance to our conversation
                accumulatedConversationRef.current += currentUtteranceRef.current;
              }
              
              // Start a new utterance
              currentUtteranceRef.current = newTranscript;
              isNewUtteranceRef.current = true;
            } else {
              // This is an update to the current utterance
              currentUtteranceRef.current = newTranscript;
            }
            
            // Update length tracking
            previousMessageLengthRef.current = newTranscript.length;
            
            // Build the full conversation text
            let fullConversation = accumulatedConversationRef.current;
            
            // Add current utterance if we have one
            if (currentUtteranceRef.current) {
              if (fullConversation && !fullConversation.endsWith(' ')) {
                fullConversation += ' ';
              }
              fullConversation += currentUtteranceRef.current;
            }
            
            // Always update the single active message for the session
            setActiveMessage(prev => {
              if (!prev) {
                // If somehow the active message is null, create a new one
                return {
                  id: sessionIdRef.current,
                  text: fullConversation,
                  timestamp: new Date().toLocaleString()
                };
              }
              // Otherwise update the existing message
              return {
                ...prev,
                text: fullConversation
              };
            });
            
            setIsPaused(false);
            setShouldCreateNewMessage(false);
            
            // Store for silence detection
            lastTranscriptRef.current = fullConversation;
            
            // Reset silence detection timer
            detectSilence();
          }
        
          if (data.error) {
            setError(data.error);
            stopRecording();
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred. Make sure your WebSocket server is running on localhost:3000 and handling transcription requests correctly.');
        stopRecording();
      };

      websocketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        !error && stopRecording();
      };
    } catch (err) {
      console.error('Error accessing microphone:', err);
      
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError(`Failed to access microphone: ${err.message}`);
        }
      } else {
        setError('Failed to access microphone');
      }
      
      setIsRecording(false);
      
      // Propagate the error so it can be caught by the component
      throw err;
    }
  };

  const stopRecording = (): void => {
    // Save the final utterance if needed
    if (currentUtteranceRef.current.trim()) {
      if (accumulatedConversationRef.current && !accumulatedConversationRef.current.endsWith(' ')) {
        accumulatedConversationRef.current += ' ';
      }
      accumulatedConversationRef.current += currentUtteranceRef.current;
      currentUtteranceRef.current = '';
    }
    
    // Finalize any active message before stopping
    if (activeMessage && activeMessage.text.trim() !== '') {
      finalizeCurrentMessage();
    }
    
    // Clear any pending silence detection
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = undefined;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.close();
    }

    setIsRecording(false);
  };

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    activeMessage,
    completedMessages,
    error,
    // Added properties to match what LiveNoteCapturePage expects
    transcribedText: activeMessage?.text || '',
    isPaused,
    messageId: sessionIdRef.current,
    shouldCreateNewMessage
  };
}; 