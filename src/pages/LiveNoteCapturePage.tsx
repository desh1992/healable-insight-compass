import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, ChevronRight, ChevronLeft, History, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { saveLiveNote } from '@/utils/storage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactDOM from 'react-dom';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Message {
  id: number;
  text: string;
  speaker: 'doctor' | 'patient' | 'system';
  timestamp: string;
}

interface CompletedConversation {
  id: string;
  patientName: string;
  timestamp: string;
  messages: Message[];
}

const AnimationPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted) return null;
  
  return ReactDOM.createPortal(
    children,
    document.body
  );
};

const BreathingAnimation: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [colorInterval, setColorInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Healable theme colors
  const blueInner = "#003B57"; // healable-primary
  const blueOuter = "rgba(0, 59, 87, 0.794)";
  const goldInner = "#F59E0B"; // healable-warning
  const goldOuter = "rgba(245, 158, 11, 0.794)";
  
  // Helper function to interpolate between two colors
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    if (color1.startsWith('rgba') && color2.startsWith('rgba')) {
      // Handle rgba colors
      const c1 = color1.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      const c2 = color2.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);

      if (c1 && c2) {
        const r = Math.round(parseInt(c1[1]) + factor * (parseInt(c2[1]) - parseInt(c1[1])));
        const g = Math.round(parseInt(c1[2]) + factor * (parseInt(c2[2]) - parseInt(c1[2])));
        const b = Math.round(parseInt(c1[3]) + factor * (parseInt(c2[3]) - parseInt(c1[3])));
        const a = parseFloat(c1[4]) + factor * (parseFloat(c2[4]) - parseFloat(c1[4]));

        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
    } else if (color1.startsWith('#') && color2.startsWith('#')) {
      // Handle hex colors
      const c1 = parseInt(color1.substring(1), 16);
      const c2 = parseInt(color2.substring(1), 16);

      const r1 = (c1 >> 16) & 255;
      const g1 = (c1 >> 8) & 255;
      const b1 = c1 & 255;

      const r2 = (c2 >> 16) & 255;
      const g2 = (c2 >> 8) & 255;
      const b2 = c2 & 255;

      const r = Math.round(r1 + factor * (r2 - r1));
      const g = Math.round(g1 + factor * (g2 - g1));
      const b = Math.round(b1 + factor * (b2 - b1));

      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    // Fallback
    return color2;
  };
  
  useEffect(() => {
    const transitionDuration = 3500;
    
    if (isActive) {
      const glowElement = document.getElementById("glowElement");
      if (glowElement) {
        // Make sure it's visible when starting
        glowElement.style.display = "block";
        
        // Set initial colors
        glowElement.style.setProperty('--glow-inner-color', blueInner);
        glowElement.style.setProperty('--glow-outer-color', blueOuter);
        
        // First fade in, then start animation
        glowElement.style.opacity = "0";
        setTimeout(() => {
          glowElement.style.opacity = "1";
          setTimeout(() => {
            glowElement.classList.add("animate");
          }, 300);
        }, 10);
        
        let isBlue = true;

        const newInterval = setInterval(() => {
          isBlue = !isBlue;

          // Target values for the transition
          const targetInner = isBlue ? blueInner : goldInner;
          const targetOuter = isBlue ? blueOuter : goldOuter;

          // Starting values (current colors)
          const startInner = isBlue ? goldInner : blueInner;
          const startOuter = isBlue ? goldOuter : blueOuter;

          // Start time for the animation
          const startTime = performance.now();

          // Cancel any existing animation
          if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
          }

          // Color transition animation function
          function animateColorTransition(currentTime: number) {
            // Calculate progress (0 to 1)
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / transitionDuration, 1);

            // Interpolate colors
            const currentInner = interpolateColor(startInner, targetInner, progress);
            const currentOuter = interpolateColor(startOuter, targetOuter, progress);

            // Update CSS variables
            if (glowElement) {
              glowElement.style.setProperty('--glow-inner-color', currentInner);
              glowElement.style.setProperty('--glow-outer-color', currentOuter);
            }

            // Continue animation if not complete
            if (progress < 1) {
              const newFrame = requestAnimationFrame(animateColorTransition);
              setAnimationFrame(newFrame);
            }
          }

          // Start the animation
          const frame = requestAnimationFrame(animateColorTransition);
          setAnimationFrame(frame);
        }, 7000);
        
        setColorInterval(newInterval);
      }
    } else {
      const glowElement = document.getElementById("glowElement");
      if (glowElement) {
        // Immediately cancel any existing animations
        if (animationFrame !== null) {
          cancelAnimationFrame(animationFrame);
          setAnimationFrame(null);
        }
        
        if (colorInterval) {
          clearInterval(colorInterval);
          setColorInterval(null);
        }
        
        // Immediately hide the element (no transition) to prevent flash
        glowElement.style.display = "none";
        
        // Rest of cleanup can still happen to ensure proper state
        glowElement.classList.remove("animate");
        glowElement.style.opacity = "0";
        glowElement.style.setProperty('--glow-inner-color', blueInner);
        glowElement.style.setProperty('--glow-outer-color', blueOuter);
        glowElement.style.transform = "translateX(-50%) scale(1)";
        
        // Complete cleanup after a short delay
        setTimeout(() => {
          glowElement.style.removeProperty('--glow-inner-color');
          glowElement.style.removeProperty('--glow-outer-color');
        }, 100);
      }
    }
    
    return () => {
      if (colorInterval) {
        clearInterval(colorInterval);
      }
      
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive]);
  
  return (
    <AnimationPortal>
      <div className="glow-container">
        <div className="glow-semi" id="glowElement"></div>
      </div>
    </AnimationPortal>
  );
};

const LiveNoteCapturePage: React.FC = () => {
  // Replace dummy patient ID with actual logic to get current patient ID
  const patientId = "123"; // In a real app, this would come from a route param or context
  
  const {
    isRecording: isTranscribing,
    startRecording,
    stopRecording,
    activeMessage,
    completedMessages,
    error: recordingError,
    isPaused,
    messageId,
    shouldCreateNewMessage,
    transcribedText
  } = useAudioTranscription(patientId);
  
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [completedConversations, setCompletedConversations] = useState<CompletedConversation[]>([]);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store the current message ID to detect changes
  const lastMessageIdRef = useRef<number>(0);
  // Keep track of whether we've added a message for the current ID
  const messageAddedRef = useRef<boolean>(false);
  // Single active message ID for the entire transcription session
  const sessionMessageIdRef = useRef<number>(Date.now());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Process transcribed text when it changes - maintain a SINGLE message box
  useEffect(() => {
    if (isTranscribing && transcribedText && transcribedText.trim() !== '') {
      // When starting a new recording session, reset to a single message
      if (displayedMessages.length === 0) {
        // Create a single message for the entire session
        const newMessage: Message = {
          // Use a stable ID for the entire session
          id: sessionMessageIdRef.current,
          text: transcribedText,
          speaker: 'system',
          timestamp: new Date().toLocaleString()
        };
        
        // Set this as the only message
        setDisplayedMessages([newMessage]);
      } else {
        // Always update the single message with new content
        setDisplayedMessages(prev => {
          // Copy the single message (we'll only have one)
          const updatedMessage = {
            ...prev[0],
            text: transcribedText
          };
          
          // Return an array with just this one updated message
          return [updatedMessage];
        });
      }
    }
  }, [transcribedText, isTranscribing]);

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  const handleStartCapture = async () => {
    setIsPermissionDenied(false);
    setDisplayedMessages([]); // Clear messages when starting
    // Generate a new stable ID for this recording session
    sessionMessageIdRef.current = Date.now();
    
    try {
      // This will trigger the browser permission prompt if not already granted
      await startRecording();
    } catch (error) {
      console.error("Error starting recording:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setIsPermissionDenied(true);
      }
    }
  };

  const handleStopCapture = () => {
    stopRecording();
    // Save the completed conversation
    if (displayedMessages.length > 0) {
      const newConversation: CompletedConversation = {
        id: Date.now().toString(),
        patientName: "Mrs. Johnson", // In real app, this would come from selected patient
        timestamp: new Date().toLocaleString(),
        messages: displayedMessages
      };
      setCompletedConversations(prev => [newConversation, ...prev]);
      
      // Save to storage
      saveLiveNote({
        id: newConversation.id,
        patientId: patientId,
        content: displayedMessages.map(m => m.text).join('\n\n'),
        timestamp: new Date().toISOString(),
        type: 'live_capture',
        speaker: 'system'
      });
    }
  };

  return (
    <AppLayout title="Live Note Capture">
      <div className="h-[calc(100vh-4rem)] flex flex-col relative transparent-bg">
        {/* Breathing Animation */}
        <BreathingAnimation isActive={isTranscribing} />
        
        <style dangerouslySetInnerHTML={{
          __html: `
          .glow-container {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 650px;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
          }
          
          .glow-semi {
            position: absolute;
            bottom: -15rem;
            left: 50%;
            transform: translateX(-50%) scale(1);
            width: 600px;
            height: 600px;
            border-top-left-radius: 300px;
            border-top-right-radius: 300px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            filter: blur(80px);
            opacity: 0;
            transition: opacity 1.5s ease-in-out;
            background: radial-gradient(ellipse at center, var(--glow-inner-color, #003B57) 0%, var(--glow-outer-color, rgba(0, 59, 87, 0.794)) 70%);
          }
          
          .animate {
            animation: breathe 3.5s ease-in-out infinite;
          }
          
          @keyframes breathe {
            0%,
            100% {
              transform: translateX(-50%) scale(1);
              opacity: 0.6;
            }
            50% {
              transform: translateX(-50%) scale(1.3);
              opacity: 1;
            }
          }
          
          .glass-message {
            background-color: rgba(255, 255, 255, 0.7) !important;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .glass-message-doctor {
            background-color: rgba(247, 250, 252, 0.75) !important;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(0, 59, 87, 0.2);
            box-shadow: 0 4px 6px rgba(0, 59, 87, 0.1);
          }
          
          .glass-message-patient {
            background-color: rgba(240, 240, 240, 0.7) !important;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(200, 200, 200, 0.3);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          }
          
          .transparent-bg {
            background-color: transparent !important;
            background: transparent !important;
          }
        `}} />
        
        <div className="flex items-center justify-between p-4 border-b z-10 bg-white/90 backdrop-blur-sm">
          {!isTranscribing ? (
            <Button
              size="lg"
              onClick={handleStartCapture}
              className="bg-healable-primary hover:bg-healable-secondary text-white"
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Capture
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-healable-primary">
                <div className="w-2 h-2 bg-healable-primary rounded-full animate-ping" />
                Recording in progress...
              </div>
              <Button
                size="lg"
                variant="destructive"
                onClick={handleStopCapture}
              >
                <MicOff className="mr-2 h-5 w-5" />
                Stop Capture
              </Button>
            </>
          )}
        </div>

        {recordingError && (
          <Alert variant="destructive" className="mb-4 mx-4 mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{recordingError}</AlertDescription>
          </Alert>
        )}

        {isPermissionDenied && (
          <Alert variant="destructive" className="mb-4 mx-4 mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Microphone Access Denied</AlertTitle>
            <AlertDescription>
              Please allow microphone access to use the live transcription feature.
              You may need to update your browser settings.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-1 gap-4 p-4 overflow-hidden z-10 transparent-bg">
          {/* Live Conversation Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden transparent-bg">
            <ScrollArea className="flex-1 transparent-bg">
              <div className="space-y-4 p-4 transparent-bg">
                {displayedMessages.length === 0 && !isTranscribing && (
                  <div className="text-center text-gray-500 mt-8">
                    Click "Start Capture" to begin recording and transcribing the conversation
                  </div>
                )}
                
                {/* Use layoutId to prevent re-animations when text changes */}
                <AnimatePresence>
                  {displayedMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      layoutId={`message-${message.id}`} 
                      transition={{ 
                        layout: { duration: 0 }, // Disable layout animation
                        opacity: { duration: 0.3 } // Keep fade animation
                      }}
                      className="flex flex-col p-4 rounded-lg bg-white/75 backdrop-blur-sm border border-gray-200 shadow-sm"
                    >
                      <div className="text-sm text-gray-500 mb-1">
                        {message.timestamp}
                      </div>
                      <div>{message.text}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* History section */}
          <div className="h-full">
            <AnimatePresence>
              {isHistoryCollapsed ? (
                <motion.div
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 80, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <div 
                    className="flex flex-col items-center justify-center px-4 py-3 h-12 bg-white/90 backdrop-blur-sm border rounded-md cursor-pointer w-full"
                    onClick={() => setIsHistoryCollapsed(false)}
                  >
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      <ChevronLeft className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col overflow-hidden"
                >
                  <Card className="bg-white/90 backdrop-blur-sm h-full">
                    <CardHeader 
                      className="flex flex-row items-center justify-start p-5 cursor-pointer" 
                      onClick={() => setIsHistoryCollapsed(true)}
                    >
                      <div className="flex items-center">
                        <ChevronRight className="h-5 w-5 mr-3 flex-shrink-0" />
                        <CardTitle className="font-semibold text-lg my-0">Live Notes History</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100vh-16rem)]">
                        <div className="space-y-4">
                          {completedConversations.map((conversation) => (
                            <div
                              key={conversation.id}
                              className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                            >
                              <div className="font-medium">{conversation.patientName}</div>
                              <div className="text-sm text-gray-500">{conversation.timestamp}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {conversation.messages.length} messages
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LiveNoteCapturePage; 