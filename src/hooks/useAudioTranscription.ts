import { useState, useRef, useEffect } from 'react';
import { LiveNote } from '@/types/notes';

// Define a message interface for consistency
interface TranscriptionMessage {
  id: number;
  text: string;
  timestamp: string;
  speakerId: number; // Added speaker identifier
}

// Define a structure for a speaker's message
interface SpeakerMessage {
  id: number;
  speakerId: number;
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
  speakerMessages: SpeakerMessage[]; // Messages separated by speaker
  currentSpeakerId: number; // ID of the current speaker
}

export const useAudioTranscription = (patientId: string): AudioTranscriptionHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [activeMessage, setActiveMessage] = useState<TranscriptionMessage | null>(null);
  const [completedMessages, setCompletedMessages] = useState<TranscriptionMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldCreateNewMessage, setShouldCreateNewMessage] = useState(false);
  const [speakerMessages, setSpeakerMessages] = useState<SpeakerMessage[]>([]);
  const [currentSpeakerId, setCurrentSpeakerId] = useState(1); // Start with speaker 1
  
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
  // Track the current speaker
  const currentSpeakerIdRef = useRef<number>(1);
  // Store utterances by speaker
  const speakerUtterancesRef = useRef<Map<number, string>>(new Map());
  
  const convertToPCM16 = (inputData: Float32Array): ArrayBuffer => {
    const pcmData = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcmData.buffer;
  };

  // Function to create a new speaker message
  const createSpeakerMessage = (speakerId: number, text: string): SpeakerMessage => {
    return {
      id: Date.now() + speakerId,
      speakerId,
      text,
      timestamp: new Date().toLocaleString()
    };
  };

  // Function to detect speaker change
  const detectSpeakerChange = (newTranscript: string, isPartial: boolean): boolean => {
    // Case 1: API provided speaker labels (currently empty in logs but prepared for future)
    // Case 2: Significant transcript length reduction (already implemented)
    // Case 3: End of complete utterance (not partial anymore)
    // Case 4: Detect repeated segments
    // Case 5: Detect natural speech breaks (periods, question marks, etc.)
    // Case 6: Detect significant content changes
    const isRepeatedSegment = newTranscript.length > 50 && 
      accumulatedConversationRef.current.includes(newTranscript);
    
    const hasNaturalBreak = /[.!?]\s*$/.test(currentUtteranceRef.current);
    
    // Detect significant content changes that might indicate a different speaker
    const hasSignificantChange = newTranscript.length > 20 && 
      !isPartial && 
      currentUtteranceRef.current.length > 20 &&
      !newTranscript.includes(currentUtteranceRef.current) &&
      !currentUtteranceRef.current.includes(newTranscript);
    
    return (
      newTranscript.length < previousMessageLengthRef.current / 2 || 
      (!isPartial && currentUtteranceRef.current.trim() !== '') ||
      isRepeatedSegment ||
      (hasNaturalBreak && !isPartial) ||
      hasSignificantChange
    );
  };

  // Function to clean and normalize transcript text
  const cleanTranscript = (text: string): string => {
    return text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\s*([.,!?])\s*/g, '$1 ')  // Normalize punctuation spacing
      .trim();
  };

  // Function to finalize the current message and add it to history
  const finalizeCurrentMessage = () => {
    if (activeMessage && activeMessage.text.trim() !== '') {
      // Clean and normalize the text before finalizing
      const cleanedText = cleanTranscript(activeMessage.text);
      
      // Add current message to completed messages
      console.log("Finalizing message:", cleanedText);
      setCompletedMessages(prev => [...prev, { 
        ...activeMessage,
        text: cleanedText
      }]);
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
          
          // Save this utterance to the current speaker's collection
          const currentText = speakerUtterancesRef.current.get(currentSpeakerIdRef.current) || '';
          speakerUtterancesRef.current.set(
            currentSpeakerIdRef.current, 
            currentText ? `${currentText} ${currentUtteranceRef.current}` : currentUtteranceRef.current
          );
          
          // Update the speaker messages for display
          updateSpeakerMessages();
          
          currentUtteranceRef.current = '';
          isNewUtteranceRef.current = true;
        }
        
        setIsPaused(true);
      }
    }, 2000); // Consider speech paused after 2 seconds of no changes
  };
  
  // Function to update the speaker messages for display
  const updateSpeakerMessages = () => {
    const messages: SpeakerMessage[] = [];
    
    // Convert the speaker utterances map to an array of speaker messages
    speakerUtterancesRef.current.forEach((text, speakerId) => {
      if (text.trim()) {
        messages.push(createSpeakerMessage(speakerId, text.trim()));
      }
    });
    
    // Sort by speakerId to maintain conversation order
    messages.sort((a, b) => a.id - b.id);
    
    setSpeakerMessages(messages);
  };
  
  // Function to handle speaker transition
  const handleSpeakerTransition = (newTranscript: string, isPartial: boolean): void => {
    console.log('Detected new speaker or utterance');
    
    // Save current utterance to current speaker before switching
    if (currentUtteranceRef.current.trim() !== '') {
      // Create a new message box for the current utterance
      const cleanedText = cleanTranscript(currentUtteranceRef.current);
      if (cleanedText.trim()) {
        const newMessage = createSpeakerMessage(currentSpeakerIdRef.current, cleanedText);
        setSpeakerMessages(prev => [...prev, newMessage]);
      }
      
      // Add to accumulated conversation
      if (accumulatedConversationRef.current && !accumulatedConversationRef.current.endsWith(' ')) {
        accumulatedConversationRef.current += ' ';
      }
      accumulatedConversationRef.current += currentUtteranceRef.current;
    }
    
    // Switch to the next speaker if it's a significant change
    if (newTranscript.length < previousMessageLengthRef.current / 2) {
      // Toggle between speaker 1 and 2
      currentSpeakerIdRef.current = currentSpeakerIdRef.current === 1 ? 2 : 1;
      setCurrentSpeakerId(currentSpeakerIdRef.current);
      
      // Create a new message box for the new speaker
      const cleanedNewText = cleanTranscript(newTranscript);
      if (cleanedNewText.trim()) {
        const newMessage = createSpeakerMessage(currentSpeakerIdRef.current, cleanedNewText);
        setSpeakerMessages(prev => [...prev, newMessage]);
      }
    }
    
    // Start a new utterance
    currentUtteranceRef.current = newTranscript;
    isNewUtteranceRef.current = true;
  };

  // Function to create a new message for the current speaker
  const createNewSpeakerMessage = (text: string): void => {
    const cleanedText = cleanTranscript(text);
    if (cleanedText.trim()) {
      // Create a new message box for each utterance
      const newMessage = createSpeakerMessage(currentSpeakerIdRef.current, cleanedText);
      setSpeakerMessages(prev => [...prev, newMessage]);
      
      // Also update the speaker's accumulated text
      const currentText = speakerUtterancesRef.current.get(currentSpeakerIdRef.current) || '';
      speakerUtterancesRef.current.set(
        currentSpeakerIdRef.current,
        currentText ? `${currentText} ${cleanedText}`.trim() : cleanedText.trim()
      );
    }
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
      
      // Reset speaker tracking
      currentSpeakerIdRef.current = 1;
      setCurrentSpeakerId(1);
      speakerUtterancesRef.current = new Map();
      setSpeakerMessages([]);
      
      // Create a single active message for the entire session
      setActiveMessage({
        id: sessionIdRef.current,
        text: '',
        timestamp: new Date().toLocaleString(),
        speakerId: 1
      });
      
      setCompletedMessages([]);
      lastTranscriptRef.current = '';
      
      // Initialize audio context with 16kHz sample rate
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });

      // Get user media - this will prompt for permission if not already granted
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Set up WebSocket connection
      websocketRef.current = new WebSocket('ws://127.0.0.1:8000/api/transcribe/stream');
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
          
          // Handle Amazon Transcribe format
          if (data.Transcript && data.Transcript.Results) {
            // Process Amazon Transcribe response with speaker diarization
            const result = data.Transcript.Results[0];
            if (!result) return;
            
            const isPartial = result.IsPartial === true;
            let transcriptText = '';
            let currentSpeaker = null;
            const speakerSegments = [];
            
            // Check if we have alternatives with items (the detailed word-by-word transcript)
            if (result.Alternatives && result.Alternatives[0] && result.Alternatives[0].Items) {
              const items = result.Alternatives[0].Items;
              let currentSegment = { speaker: null, text: '' };
              
              // Process each word/item in the transcript
              for (const item of items) {
                // Handle speaker change markers
                if (item.Type === 'speaker-change') {
                  if (currentSegment.speaker !== null && currentSegment.text.trim()) {
                    speakerSegments.push({...currentSegment});
                  }
                  currentSegment = { speaker: null, text: '' };
                  continue;
                }
                
                // Track current speaker
                if (item.Speaker !== undefined) {
                  // Convert from string to number and add 1 to match our UI (1-based instead of 0-based)
                  const speakerId = parseInt(item.Speaker) + 1;
                  
                  // If speaker changes, start a new segment
                  if (currentSegment.speaker !== null && currentSegment.speaker !== speakerId && currentSegment.text.trim()) {
                    speakerSegments.push({...currentSegment});
                    currentSegment = { speaker: speakerId, text: '' };
                  } else if (currentSegment.speaker === null) {
                    currentSegment.speaker = speakerId;
                  }
                  
                  currentSpeaker = speakerId;
                }
                
                // Add word content to the current segment and full transcript
                if (item.Content) {
                  // For words (pronunciation), add a space before (except at the beginning)
                  if (item.Type === 'pronunciation') {
                    if (currentSegment.text && !currentSegment.text.endsWith(' ')) {
                      currentSegment.text += ' ';
                    }
                    transcriptText += (transcriptText && !transcriptText.endsWith(' ')) ? ' ' + item.Content : item.Content;
                    currentSegment.text += item.Content;
                  } 
                  // For punctuation, don't add spaces
                  else if (item.Type === 'punctuation') {
                    transcriptText += item.Content;
                    currentSegment.text += item.Content;
                  }
                }
              }
              
              // Add the final segment if it has content
              if (currentSegment.speaker !== null && currentSegment.text.trim()) {
                speakerSegments.push({...currentSegment});
              }
            } 
            // If we don't have detailed items, fall back to the simple transcript
            else if (result.Alternatives && result.Alternatives[0] && result.Alternatives[0].Transcript) {
              transcriptText = cleanTranscript(result.Alternatives[0].Transcript);
            }
            
            // If we have identified speaker segments, update our speaker utterances
            if (speakerSegments.length > 0) {
              // Reset the speaker utterances if this is a new complete transcript
              if (!isPartial) {
                speakerUtterancesRef.current = new Map();
              }
              
              // Add each segment to the appropriate speaker's collection
              for (const segment of speakerSegments) {
                if (segment.speaker === null) continue;
                
                const speakerId = segment.speaker;
                const existingText = speakerUtterancesRef.current.get(speakerId) || '';
                const cleanedSegmentText = cleanTranscript(segment.text);
                
                // Only add if it's not a repeated segment
                if (!existingText.includes(cleanedSegmentText)) {
                  // Update the speaker's text
                  speakerUtterancesRef.current.set(
                    speakerId,
                    existingText ? `${existingText} ${cleanedSegmentText}`.trim() : cleanedSegmentText.trim()
                  );
                  
                  // Track the current speaker for UI feedback
                  currentSpeakerIdRef.current = speakerId;
                  setCurrentSpeakerId(speakerId);
                }
              }
              
              // Update speaker messages UI
              updateSpeakerMessages();
            }
            
            // If we have transcript text, update the active message
            if (transcriptText.trim()) {
              // Clean the transcript text
              const cleanedTranscript = cleanTranscript(transcriptText);
              
              // Update the accumulated conversation
              if (!isPartial) {
                if (accumulatedConversationRef.current && !accumulatedConversationRef.current.endsWith(' ')) {
                  accumulatedConversationRef.current += ' ';
                }
                accumulatedConversationRef.current += cleanedTranscript;
                currentUtteranceRef.current = '';
              } else {
                currentUtteranceRef.current = cleanedTranscript;
              }
              
              // Always update the active message with the full conversation
              let fullConversation = accumulatedConversationRef.current;
              if (currentUtteranceRef.current) {
                if (fullConversation && !fullConversation.endsWith(' ')) {
                  fullConversation += ' ';
                }
                fullConversation += currentUtteranceRef.current;
              }
              
              setActiveMessage(prev => {
                if (!prev) {
                  return {
                    id: sessionIdRef.current,
                    text: fullConversation,
                    timestamp: new Date().toLocaleString(),
                    speakerId: currentSpeakerIdRef.current
                  };
                }
                return {
                  ...prev,
                  text: fullConversation,
                  speakerId: currentSpeakerIdRef.current
                };
              });
              
              setIsPaused(false);
              lastTranscriptRef.current = fullConversation;
              detectSilence();
            }
          }
          // Handle our original simple format as a fallback
          else if (data.partialTranscript && data.partialTranscript.trim() !== '') { 
            const newTranscript = data.partialTranscript.trim();
            const isPartial = data.isPartial !== false; // Default to true if not explicitly false
            
            // Check for speaker change
            if (detectSpeakerChange(newTranscript, isPartial)) {
              handleSpeakerTransition(newTranscript, isPartial);
            } else {
              // This is an update to the current utterance
              currentUtteranceRef.current = newTranscript;
              
              // If this is a final transcript (not partial), create a new message
              if (!isPartial) {
                createNewSpeakerMessage(newTranscript);
              }
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
                return {
                  id: sessionIdRef.current,
                  text: fullConversation,
                  timestamp: new Date().toLocaleString(),
                  speakerId: currentSpeakerIdRef.current
                };
              }
              return {
                ...prev,
                text: fullConversation,
                speakerId: currentSpeakerIdRef.current
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
        setError('Connection error occurred. Make sure your WebSocket server is running correctly.');
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
      
      // Also save to the current speaker's collection
      const currentText = speakerUtterancesRef.current.get(currentSpeakerIdRef.current) || '';
      speakerUtterancesRef.current.set(
        currentSpeakerIdRef.current, 
        currentText ? `${currentText} ${currentUtteranceRef.current}` : currentUtteranceRef.current
      );
      
      // Update speaker messages one final time
      updateSpeakerMessages();
      
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
    // Added properties expected by LiveNoteCapturePage
    transcribedText: activeMessage?.text || '',
    isPaused,
    messageId: sessionIdRef.current,
    shouldCreateNewMessage,
    // New properties for speaker separation
    speakerMessages,
    currentSpeakerId
  };
}; 