import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { getPatient } from '@/services/patientService';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AddNoteModal from '@/components/AddNoteModal';
import NotesTab from '@/components/NotesTab';
import LiveNoteCapture from '@/components/LiveNoteCapture';
import { FileText, Mic, MicOff, ChevronRight, ChevronLeft, History, Pencil, Trash2, Plus } from 'lucide-react';
import { formatDateTime, formatDate } from '@/utils/dateFormat';
import { Note } from '@/types/notes';
import { saveNote, getNotes, getPatientData, deleteCondition, deleteRiskFactor, deleteMedication, deleteLabResult, deleteCareGap, clearPatientInfoField, clearVitalSign, clearAllVitalSigns } from '@/utils/storage';
import { Slider } from '@/components/ui/slider';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactDOM from 'react-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MedicationModal from '@/components/MedicationModal';
import LabResultModal from '@/components/LabResultModal';
import CareGapModal from '@/components/CareGapModal';
import ConditionModal from '@/components/ConditionModal';
import RiskFactorModal from '@/components/RiskFactorModal';
import PatientInfoModal from '@/components/PatientInfoModal';
import VitalSignsModal from '@/components/VitalSignsModal';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { saveLiveNote } from '@/utils/storage';

// Add type definitions at the top
interface RiskFactor {
  factor: string;
  level: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'worsening';
}

interface PatientVitalSigns {
  bloodPressure?: string;
  heartRate?: string | number;
  respiratoryRate?: string | number;
  temperature?: string | number;
  oxygenSaturation?: string | number;
  lastUpdated?: string;
}

interface PatientSummaryProps {
  patient: {
    name?: string;
    age?: number;
    dob?: string;
    gender?: string;
    contact?: string;
    insurance?: string;
    vitalSigns?: PatientVitalSigns;
    conditions?: string[];
    riskFactors?: RiskFactor[];
  };
}

// AI Query component
const AIQuerySection: React.FC<{
  setAiResponseContent: (content: string) => void;
  setIsAddNoteModalOpen: (isOpen: boolean) => void;
  patientId: string;
  initialQuery?: string;
}> = ({ setAiResponseContent, setIsAddNoteModalOpen, patientId, initialQuery = '' }) => {
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [questionHistory, setQuestionHistory] = useState<{text: string; timestamp: string; answer?: string}[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isLiveNoteActive, setIsLiveNoteActive] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [completedConversations, setCompletedConversations] = useState<any[]>([]);
  const [conversationProcessed, setConversationProcessed] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // For live note capture
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  
  const {
    isRecording: isTranscribing,
    startRecording,
    stopRecording,
    transcribedText,
    error: recordingError,
    isPaused,
    messageId,
    shouldCreateNewMessage
  } = useAudioTranscription(patientId);
  
  // Add a stable message ID reference
  const lastMessageIdRef = useRef<number>(0);
  
  // Add a reference to track if a message has been added for the current ID
  const messageAddedRef = useRef<boolean>(false);
  
  // Handle initialQuery when provided (coming back from history page)
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      // Optionally auto-submit the query
      if (initialQuery.trim()) {
        handleQuerySubmit(initialQuery);
      }
    }
  }, [initialQuery]);
  
  // Load saved question history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`question_history_${patientId}`);
    if (savedHistory) {
      try {
        setQuestionHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse saved question history", e);
      }
    }
  }, [patientId]);
  
  // Save question history to localStorage when it changes
  useEffect(() => {
    if (questionHistory.length > 0) {
      localStorage.setItem(`question_history_${patientId}`, JSON.stringify(questionHistory));
    }
  }, [questionHistory, patientId]);
  
  const commonQueries = [
    "What were this patient's last A1C results?",
    "Any missed medications in the last 60 days?",
    "Are there any missed or overdue screenings?",
    "What comorbidities might impact today's treatment plan?",
    "Show me this patient's hospitalization history",
    "What risk factors have increased since their last visit?"
  ];
  
  // Memoize functions to prevent recreation on re-renders
  const handleQuerySubmit = useCallback((queryText: string) => {
    setQuery(queryText);
    setIsQuerying(true);
    setAIResponse(null);
    
    // Create new question entry (answer will be added after response)
    const newQuestion = {
      text: queryText,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
    };
    
    // Simulate AI response
    setTimeout(() => {
      setIsQuerying(false);
      
      // Generate mock responses based on query keywords
      let response = "";
      
      if (queryText.toLowerCase().includes("a1c")) {
        response = "The patient's most recent A1C was 7.8% on April 1, 2023, which is above the target of <7.0%. This is a slight improvement from the previous value of 8.1% three months ago.";
      } else if (queryText.toLowerCase().includes("medication")) {
        response = "The patient has missed 5 doses of Metformin in the past 60 days, with an overall adherence rate of 72%. Lisinopril adherence is higher at 85%, with only 2 missed doses.";
      } else if (queryText.toLowerCase().includes("screening") || queryText.toLowerCase().includes("overdue")) {
        response = "The patient is overdue for an annual diabetic eye exam (due January 15, 2023) and is approaching the due date for their pneumococcal vaccine (May 30, 2023).";
      } else if (queryText.toLowerCase().includes("comorbid") || queryText.toLowerCase().includes("impact")) {
        response = "The patient's hypertension and hyperlipidemia may complicate diabetes management. Recent elevated blood pressure (145/92) suggests adjusting the antihypertensive regimen may be necessary before making significant changes to diabetes management.";
      } else if (queryText.toLowerCase().includes("risk")) {
        response = "Cardiovascular risk remains high but stable. Diabetes complication risk has worsened since the last visit, primarily due to the elevated A1C and continued hypertension. Social determinants screening indicates possible transportation barriers affecting appointment adherence.";
      } else {
        response = "Based on the patient's records, I've identified the following key insights:\n\n1. Blood pressure remains uncontrolled at 145/92 despite current medication regimen\n2. A1C is elevated at 7.8%, indicating suboptimal glycemic control\n3. Medication adherence for Metformin is below target at 72%\n4. The patient has missed their annual eye exam which was due in January\n5. There has been improvement in cholesterol management, though LDL remains slightly above target";
      }
      
      // Save the response
      setAIResponse(response);
      
      // Update question history with both question and answer
      setQuestionHistory(prev => [{
        ...newQuestion,
        answer: response
      }, ...prev.slice(0, 19)]); // Keep up to 20 entries
      
    }, 1500);
  }, []);
  
  // Navigate to question history page
  const handleHistoryButtonClick = useCallback(() => {
    navigate(`/patient/${patientId}/question-history`);
  }, [navigate, patientId]);
  
  // Memoize filtered suggestions to prevent recalculation on every render
  const filteredSuggestions = useMemo(() => {
    if (!query) return [];
    
    // Combine history and common queries for suggestions
    const allPossibleSuggestions = [
      ...questionHistory.map(h => h.text),
      ...commonQueries
    ];
    
    // Filter to unique suggestions matching the query
    return [...new Set(
      allPossibleSuggestions.filter(q => 
        q.toLowerCase().includes(query.toLowerCase()) && 
        q.toLowerCase() !== query.toLowerCase()
      )
    )].slice(0, 5); // Limit to 5 suggestions
  }, [query, questionHistory]);
  
  const handleCopyToNote = useCallback((content: string) => {
    // Check if the note already exists
    const existingNotes = getNotes(patientId);
    const isDuplicate = existingNotes.some(note => 
      note.content === content.trim() && 
      note.type === 'ai_generated' &&
      // Check if the note was created in the last minute (to prevent rapid duplicates)
      Date.now() - new Date(note.timestamp).getTime() < 60000
    );

    if (isDuplicate) {
      toast.error('This note was already added recently', {
        duration: 3000,
        position: 'bottom-right',
      });
      return;
    }

    const note: Note = {
      id: `note-${Date.now()}`,
      patientId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'ai_generated'
    };
    
    saveNote(note);
    setAiResponseContent(''); // Clear the AI response content after saving
    toast.success('Note saved successfully', {
      duration: 3000,
      position: 'bottom-right',
      className: 'bg-healable-primary text-white',
      description: 'The AI-generated insight has been added to patient notes',
      icon: '✓'
    });
  }, [patientId, setAiResponseContent]);

  // Handler for live note toggle with confirmation
  const toggleLiveNote = useCallback(() => {
    // If recording is in progress, show confirmation dialog
    if (isRecording) {
      setIsConfirmDialogOpen(true);
      return;
    }
    
    // Otherwise toggle directly
    setIsLiveNoteActive(prev => !prev);
    // Reset recording state when toggling
    setIsRecording(false);
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setConversationProcessed(false);
  }, [isRecording]);

  // Handler for confirming switch away from live capture
  const handleConfirmSwitch = useCallback(() => {
    // Stop the recording
    setIsRecording(false);
    
    // Save the current conversation if needed
    if (displayedMessages.length > 0) {
      const newConversation = {
        id: Date.now().toString(),
        patientName: "Current Patient",
        timestamp: new Date().toLocaleString(),
        messages: displayedMessages
      };
      setCompletedConversations(prev => [newConversation, ...prev]);
    }
    
    // Switch to AI Assistant
    setIsLiveNoteActive(false);
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setConversationProcessed(false);
    
    // Close the dialog
    setIsConfirmDialogOpen(false);
  }, [displayedMessages]);

  // Update the transcription useEffect
  useEffect(() => {
    if (isTranscribing && transcribedText && transcribedText.trim() !== '') {
      // If we should create a new message (either first message or after a pause is detected)
      if (shouldCreateNewMessage || messageId !== lastMessageIdRef.current) {
        // Create a new message (either first message or after pause)
        const newMessage = {
          id: messageId, // Use the stable ID from the hook
          text: transcribedText,
          speaker: 'system',
          timestamp: new Date().toLocaleString()
        };
        
        // Add the new message to the list
        setDisplayedMessages(prev => [...prev, newMessage]);
        
        // Update the reference to the current message ID
        lastMessageIdRef.current = messageId;
        // Mark that we've added a message for this ID
        messageAddedRef.current = true;
      } else {
        // Update the existing message with the same ID
        setDisplayedMessages(prev => {
          // Find the message with the matching ID
          const index = prev.findIndex(msg => msg.id === messageId);
          
          if (index >= 0) {
            // Update the existing message
            const updatedMessages = [...prev];
            updatedMessages[index] = {
              ...updatedMessages[index],
              text: transcribedText
            };
            return updatedMessages;
          } else if (!messageAddedRef.current) {
            // If the message wasn't found and we haven't added one yet, add it now
            const newMessage = {
              id: messageId,
              text: transcribedText,
              speaker: 'system',
              timestamp: new Date().toLocaleString()
            };
            messageAddedRef.current = true;
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    }
  }, [transcribedText, isTranscribing, messageId, shouldCreateNewMessage]);

  // Reset messageAddedRef when message ID changes
  useEffect(() => {
    messageAddedRef.current = false;
  }, [messageId]);

  // Handle pause detection
  useEffect(() => {
    if (isPaused && transcribedText && transcribedText.trim() !== '') {
      // When a pause is detected, prepare for a new message block
      console.log("Pause detected, ready for new message block");
    }
  }, [isPaused, transcribedText]);

  const handleStartCapture = useCallback(async () => {
    setIsPermissionDenied(false);
    setDisplayedMessages([]); // Clear messages when starting
    setCurrentMessageIndex(0);
    setConversationProcessed(false);
    lastMessageIdRef.current = 0; // Reset message ID
    messageAddedRef.current = false; // Reset message added flag
    
    try {
      // This will trigger the browser permission prompt if not already granted
      await startRecording();
    } catch (error) {
      console.error("Error starting recording:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setIsPermissionDenied(true);
      }
    }
  }, [startRecording]);

  const handleStopCapture = useCallback(() => {
    stopRecording();
    
    // Save the completed conversation
    if (displayedMessages.length > 0) {
      saveLiveNote({
        id: Date.now().toString(),
        patientId,
        content: displayedMessages.map(m => m.text).join('\n\n'),
        timestamp: new Date().toISOString(),
        type: 'live_capture',
        speaker: 'system'
      });
    }
  }, [stopRecording, displayedMessages, patientId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesEndRef]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages, scrollToBottom]);

  // Memoize the AnimationPortal component
  const AnimationPortal = useMemo(() => {
    return ({ children }) => {
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
  }, []);

  // Memoize the BreathingAnimation component
  const BreathingAnimation = useMemo(() => {
    return ({ isActive }) => {
      return (
        <AnimationPortal>
          <div className="glow-container">
            <div className={`glow-semi ${isActive ? 'animate opacity-100' : 'opacity-0'}`} id="glowElement"></div>
          </div>
        </AnimationPortal>
      );
    };
  }, [AnimationPortal]);

  // Stable css styles to prevent re-renders
  const animationStyles = useMemo(() => `
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
  `, []);

  return (
    <div className="mt-6 space-y-4">
      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Live Capture?</AlertDialogTitle>
            <AlertDialogDescription>
              Recording is currently in progress. If you leave now, the recording will be stopped and saved. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSwitch} className="bg-healable-primary text-white hover:bg-healable-secondary">
              Stop Recording & Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isLiveNoteActive ? (
        // Regular AI Assistant UI
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="flex items-center">
              <Input
                placeholder="Ask a question about this patient..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsSuggestionsVisible(e.target.value.length > 0);
                }}
                onFocus={() => setIsSuggestionsVisible(query.length > 0)}
                onBlur={() => setTimeout(() => setIsSuggestionsVisible(false), 200)}
                className="pr-40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleQuerySubmit(query);
                    setIsSuggestionsVisible(false);
                  }
                }}
              />
              <Button 
                className="absolute right-24 h-[calc(100%-8px)] px-6 bg-healable-primary hover:bg-healable-secondary rounded-md"
                disabled={isQuerying || !query.trim()}
                onClick={() => {
                  handleQuerySubmit(query);
                  setIsSuggestionsVisible(false);
                }}
              >
                {isQuerying ? "Processing..." : "Ask"}
              </Button>
              
              {/* History Button - now navigates to history page */}
              <Button
                variant="ghost"
                onClick={handleHistoryButtonClick}
                className="absolute right-1 h-[calc(100%-8px)] px-3 rounded-md ml-2 bg-healable-light/30 flex items-center gap-1"
                title="Question History"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-xs font-medium">History</span>
              </Button>
            </div>
            
            {/* Suggestions Dropdown */}
            {isSuggestionsVisible && filteredSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                {questionHistory.length > 0 && (
                  <div className="p-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                    Recently Asked
                  </div>
                )}
                
                {filteredSuggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="p-2 hover:bg-gray-50 cursor-pointer text-sm truncate"
                    onClick={() => {
                      setQuery(suggestion);
                      setIsSuggestionsVisible(false);
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Common Query Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {commonQueries.map((q, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm"
                onClick={() => handleQuerySubmit(q)}
                className="text-xs"
              >
                {q}
              </Button>
            ))}
          </div>

          {/* Toggle Live Note Capture Button */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={toggleLiveNote}
              className="bg-healable-primary hover:bg-healable-secondary text-white"
            >
              <Mic className="mr-2 h-5 w-5" />
              Switch to Live Note Capture
            </Button>
          </div>

          {isQuerying && (
            <Card className="animate-pulse">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Processing your query...</CardTitle>
                <CardDescription>Analyzing patient data and clinical information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>
          )}
          
          {aiResponse && (
            <Card className="animate-fade-in">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">AI Clinical Insight</CardTitle>
                  <CardDescription>Generated from patient records</CardDescription>
                </div>
                <Badge variant="outline" className="bg-healable-accent/20">
                  AI Generated
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-line">
                  {aiResponse}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyToNote(aiResponse)}>Copy to Note</Button>
                  <Button variant="outline" size="sm" className="text-healable-danger">
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Live Note Capture UI with performance optimizations
        <div className="relative h-[calc(100vh-16rem)] flex flex-col">
          {/* Breathing Animation */}
          <BreathingAnimation isActive={isTranscribing} />
          
          <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
          
          <div className="flex flex-col space-y-4 h-full">
            {/* Control buttons - now sticky with rounded corners */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm py-4 border-b px-4 rounded-xl">
              <div className="max-w-[1200px] mx-auto w-full">
                <div className="flex justify-between items-center">
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
                    <div className="flex gap-4 items-center">
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
                    </div>
                  )}
                  
                  <Button
                    onClick={toggleLiveNote}
                    variant="outline"
                    disabled={isTranscribing}
                  >
                    Switch to AI Assistant
                  </Button>
                </div>
              </div>
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
  
            <div className="flex flex-1 gap-4 overflow-hidden z-10 transparent-bg">
              {/* Live Conversation Area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden transparent-bg">
                <ScrollArea className="flex-1 transparent-bg pr-4">
                  <div className="space-y-4 p-4 transparent-bg pb-10">
                    {displayedMessages.length === 0 && !isTranscribing && (
                      <div className="text-center text-gray-500 mt-8">
                        Click "Start Capture" to begin recording and transcribing the conversation
                      </div>
                    )}
                    
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Update the PatientSummary component
const PatientSummary: React.FC<PatientSummaryProps & { refreshData: () => void }> = ({ patient, refreshData }) => {
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isRiskFactorModalOpen, setIsRiskFactorModalOpen] = useState(false);
  const [isPatientInfoModalOpen, setIsPatientInfoModalOpen] = useState(false);
  const [isVitalSignsModalOpen, setIsVitalSignsModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<{ condition: string; index: number } | null>(null);
  const [selectedRiskFactor, setSelectedRiskFactor] = useState<{ riskFactor: any; index: number } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'condition' | 'riskFactor' | 'patientInfo' | 'vitalSign' | 'allVitalSigns'>('condition');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteField, setDeleteField] = useState<string | null>(null);
  const { patientId } = useParams<{ patientId: string }>();

  const handleAddCondition = () => {
    setSelectedCondition(null);
    setIsConditionModalOpen(true);
  };

  const handleEditCondition = (condition: string, index: number) => {
    setSelectedCondition({ condition, index });
    setIsConditionModalOpen(true);
  };

  const handleDeleteCondition = (index: number) => {
    setDeleteType('condition');
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const handleAddRiskFactor = () => {
    setSelectedRiskFactor(null);
    setIsRiskFactorModalOpen(true);
  };

  const handleEditRiskFactor = (riskFactor: any, index: number) => {
    setSelectedRiskFactor({ riskFactor, index });
    setIsRiskFactorModalOpen(true);
  };

  const handleDeleteRiskFactor = (index: number) => {
    setDeleteType('riskFactor');
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const handleEditPatientInfo = () => {
    setIsPatientInfoModalOpen(true);
  };

  const handleEditVitalSigns = () => {
    setIsVitalSignsModalOpen(true);
  };

  const handleDeletePatientInfoField = (field: 'contact' | 'insurance') => {
    setDeleteType('patientInfo');
    setDeleteField(field);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteVitalSign = (field: 'bloodPressure' | 'heartRate' | 'respiratoryRate' | 'temperature' | 'oxygenSaturation') => {
    setDeleteType('vitalSign');
    setDeleteField(field);
    setIsDeleteDialogOpen(true);
  };

  const handleClearAllVitalSigns = () => {
    setDeleteType('allVitalSigns');
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!patientId) {
      setIsDeleteDialogOpen(false);
      return;
    }
    
    let success = false;
    
    if (deleteType === 'condition' && deleteIndex !== null) {
      success = deleteCondition(patientId, deleteIndex);
    } else if (deleteType === 'riskFactor' && deleteIndex !== null) {
      success = deleteRiskFactor(patientId, deleteIndex);
    } else if (deleteType === 'patientInfo' && deleteField) {
      success = clearPatientInfoField(patientId, deleteField as 'contact' | 'insurance');
    } else if (deleteType === 'vitalSign' && deleteField) {
      success = clearVitalSign(patientId, deleteField as 'bloodPressure' | 'heartRate' | 'respiratoryRate' | 'temperature' | 'oxygenSaturation');
    } else if (deleteType === 'allVitalSigns') {
      success = clearAllVitalSigns(patientId);
    }
    
    if (success) {
      let message = '';
      if (deleteType === 'condition') {
        message = 'Condition deleted successfully';
      } else if (deleteType === 'riskFactor') {
        message = 'Risk factor deleted successfully';
      } else if (deleteType === 'patientInfo') {
        message = `Patient ${deleteField} cleared successfully`;
      } else if (deleteType === 'vitalSign') {
        message = `Vital sign ${deleteField} cleared successfully`;
      } else if (deleteType === 'allVitalSigns') {
        message = 'All vital signs cleared successfully';
      }
      
      toast.success(message, {
        duration: 3000,
        position: 'bottom-right',
        className: 'bg-healable-primary text-white',
        icon: '✓'
      });
      
      // Refresh patient data properly
      refreshData();
    } else {
      toast.error(`Failed to delete ${deleteType}`, {
        duration: 3000,
        position: 'bottom-right'
      });
    }
    
    setIsDeleteDialogOpen(false);
  };

  const handleModalClose = () => {
    setIsConditionModalOpen(false);
    setIsRiskFactorModalOpen(false);
    setIsPatientInfoModalOpen(false);
    setIsVitalSignsModalOpen(false);
    
    // Refresh patient data properly
    refreshData();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Patient Info Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Patient Information</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditPatientInfo}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">Age</div>
            <div className="font-medium">{patient.age} years</div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">Date of Birth</div>
            <div className="font-medium">{formatDate(patient.dob)}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">Gender</div>
            <div className="font-medium">{patient.gender}</div>
          </div>
          {patient.contact && (
            <div className="flex justify-between group">
              <div className="text-sm text-muted-foreground">Contact</div>
              <div className="flex items-center">
                <div className="font-medium mr-2">{patient.contact}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeletePatientInfoField('contact')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {patient.insurance && (
            <div className="flex justify-between group">
              <div className="text-sm text-muted-foreground">Insurance</div>
              <div className="flex items-center">
                <div className="font-medium mr-2">{patient.insurance}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeletePatientInfoField('insurance')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vital Signs Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Vital Signs</CardTitle>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditVitalSigns}
                className="h-8 w-8 p-0"
                title="Edit Vital Signs"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {patient.vitalSigns && Object.keys(patient.vitalSigns).length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllVitalSigns}
                  className="h-8 w-8 p-0"
                  title="Clear All Vital Signs"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {patient.vitalSigns?.lastUpdated && (
            <CardDescription>Last updated: {formatDate(patient.vitalSigns.lastUpdated)}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {patient.vitalSigns?.bloodPressure && (
            <div className="flex justify-between group">
              <div className="text-sm text-muted-foreground">Blood Pressure</div>
              <div className="flex items-center">
                <div className="font-medium mr-2">{patient.vitalSigns.bloodPressure}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteVitalSign('bloodPressure')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {patient.vitalSigns?.heartRate && (
            <div className="flex justify-between group">
              <div className="text-sm text-muted-foreground">Heart Rate</div>
              <div className="flex items-center">
                <div className="font-medium mr-2">{patient.vitalSigns.heartRate} bpm</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteVitalSign('heartRate')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {patient.vitalSigns?.respiratoryRate && (
            <div className="flex justify-between group">
              <div className="text-sm text-muted-foreground">Respiratory Rate</div>
              <div className="flex items-center">
                <div className="font-medium mr-2">{patient.vitalSigns.respiratoryRate} breaths/min</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteVitalSign('respiratoryRate')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {patient.vitalSigns?.temperature && (
            <div className="flex justify-between group">
              <div className="text-sm text-muted-foreground">Temperature</div>
              <div className="flex items-center">
                <div className="font-medium mr-2">{patient.vitalSigns.temperature} °F</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteVitalSign('temperature')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {patient.vitalSigns?.oxygenSaturation && (
            <div className="flex justify-between group">
              <div className="text-sm text-muted-foreground">O2 Saturation</div>
              <div className="flex items-center">
                <div className="font-medium mr-2">{patient.vitalSigns.oxygenSaturation}%</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteVitalSign('oxygenSaturation')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {(patient.vitalSigns && 
            (Object.keys(patient.vitalSigns).length <= 1 && patient.vitalSigns.lastUpdated)) && (
            <div className="text-muted-foreground">No vital signs recorded</div>
          )}
        </CardContent>
      </Card>

      {/* Conditions and Risk Factors Card */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Primary Conditions</CardTitle>
            <Button size="sm" variant="ghost" onClick={handleAddCondition}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {patient.conditions?.map((condition: string, idx: number) => (
              <div key={idx} className="flex items-center group">
                <Badge variant="outline" className="bg-healable-light">
                  {condition}
                </Badge>
                <div className="hidden group-hover:flex ml-1">
                  <Button size="icon" variant="ghost" className="h-5 w-5 p-0" 
                    onClick={() => handleEditCondition(condition, idx)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-5 w-5 p-0" 
                    onClick={() => handleDeleteCondition(idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )) || <span className="text-muted-foreground">No conditions recorded</span>}
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold mb-2">Key Risk Factors</h4>
              <Button size="sm" variant="ghost" onClick={handleAddRiskFactor}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {(patient.riskFactors || []).map((risk: RiskFactor, idx: number) => {
                const levelColors = {
                  low: "text-green-600 bg-green-50",
                  medium: "text-amber-600 bg-amber-50",
                  high: "text-red-600 bg-red-50"
                };
                const trendIcons = {
                  improving: "↓",
                  stable: "→",
                  worsening: "↑"
                };
                
                return (
                  <div key={idx} className="flex items-center justify-between text-sm group">
                    <span>{risk.factor}</span>
                    <div className="flex items-center">
                      <span className={`px-2 py-0.5 rounded ${levelColors[risk.level]}`}>
                        {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)} {trendIcons[risk.trend]}
                      </span>
                      <div className="hidden group-hover:flex ml-1">
                        <Button size="icon" variant="ghost" className="h-5 w-5 p-0" 
                          onClick={() => handleEditRiskFactor(risk, idx)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-5 w-5 p-0" 
                          onClick={() => handleDeleteRiskFactor(idx)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!patient.riskFactors || patient.riskFactors.length === 0) && (
                <div className="text-muted-foreground">No risk factors recorded</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals for adding and editing conditions and risk factors */}
      {isConditionModalOpen && (
        <ConditionModal
          isOpen={isConditionModalOpen}
          onClose={() => setIsConditionModalOpen(false)}
          patientId={patientId || ''}
          condition={selectedCondition?.condition}
          index={selectedCondition?.index}
        />
      )}

      {isRiskFactorModalOpen && (
        <RiskFactorModal
          isOpen={isRiskFactorModalOpen}
          onClose={() => setIsRiskFactorModalOpen(false)}
          patientId={patientId || ''}
          riskFactor={selectedRiskFactor?.riskFactor}
          index={selectedRiskFactor?.index}
        />
      )}

      {/* Patient Information Modal */}
      {isPatientInfoModalOpen && (
        <PatientInfoModal
          isOpen={isPatientInfoModalOpen}
          onClose={() => {
            setIsPatientInfoModalOpen(false);
            handleModalClose();
          }}
          patientId={patientId || ''}
          patientInfo={patient}
        />
      )}

      {/* Vital Signs Modal */}
      {isVitalSignsModalOpen && (
        <VitalSignsModal
          isOpen={isVitalSignsModalOpen}
          onClose={() => {
            setIsVitalSignsModalOpen(false);
            handleModalClose();
          }}
          patientId={patientId || ''}
          vitalSigns={patient.vitalSigns}
        />
      )}

      {/* Confirmation dialog for deletions */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'condition' && (
                <>This action will permanently delete this condition and cannot be undone.</>
              )}
              {deleteType === 'riskFactor' && (
                <>This action will permanently delete this risk factor and cannot be undone.</>
              )}
              {deleteType === 'patientInfo' && (
                <>This action will clear the patient's {deleteField} information and cannot be undone.</>
              )}
              {deleteType === 'vitalSign' && (
                <>This action will clear the patient's {deleteField} vital sign and cannot be undone.</>
              )}
              {deleteType === 'allVitalSigns' && (
                <>This action will clear all of the patient's vital signs and cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Main Patient Record component
const PatientRecord: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isLiveNoteCaptureOpen, setIsLiveNoteCaptureOpen] = useState(false);
  const [aiResponseContent, setAiResponseContent] = useState('');
  const [initialQuery, setInitialQuery] = useState<string>('');
  const location = useLocation();
  
  // Patient state (separate from the API data)
  const [patientData, setPatientData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for forcing re-renders
  
  // Medication management state
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<{ medication: any; index: number } | null>(null);
  
  // Lab results management state
  const [isLabResultModalOpen, setIsLabResultModalOpen] = useState(false);
  const [selectedLabResult, setSelectedLabResult] = useState<{ labResult: any; index: number } | null>(null);
  
  // Care gaps management state
  const [isCareGapModalOpen, setIsCareGapModalOpen] = useState(false);
  const [selectedCareGap, setSelectedCareGap] = useState<{ careGap: any; index: number } | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'medication' | 'labResult' | 'careGap'>('medication');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  
  // Parse query parameters when component mounts
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('query');
    if (query) {
      setInitialQuery(query);
    }
  }, [location.search]);
  
  const { data: patient, isLoading, error, refetch } = useQuery({
    queryKey: ['patient', patientId, refreshKey], // Add refreshKey to dependencies
    queryFn: () => getPatient(patientId || '1'),
  });
  
  // Set patient data when API data changes
  useEffect(() => {
    if (patient) {
      setPatientData(patient);
    }
  }, [patient]);
  
  // Function to reload patient data after changes
  const refreshPatientData = useCallback(() => {
    if (patientId) {
      const updatedPatient = getPatientData(patientId);
      if (updatedPatient) {
        console.log("Refreshing patient data:", updatedPatient);
        setPatientData(updatedPatient);
        setRefreshKey(prev => prev + 1); // Increment to force re-render
      } else {
        console.error("Failed to refresh patient data");
      }
    }
  }, [patientId]);
  
  const handleAddMedication = () => {
    setSelectedMedication(null);
    setIsMedicationModalOpen(true);
  };

  const handleEditMedication = (medication: any, index: number) => {
    setSelectedMedication({ medication, index });
    setIsMedicationModalOpen(true);
  };

  const handleDeleteMedication = (index: number) => {
    setDeleteType('medication');
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (patientId && deleteIndex !== null) {
      let success = false;
      
      if (deleteType === 'medication') {
        success = deleteMedication(patientId, deleteIndex);
      } else if (deleteType === 'labResult') {
        success = deleteLabResult(patientId, deleteIndex);
      } else if (deleteType === 'careGap') {
        success = deleteCareGap(patientId, deleteIndex);
      }
      
      if (success) {
        let itemType = 'item';
        if (deleteType === 'medication') itemType = 'Medication';
        else if (deleteType === 'labResult') itemType = 'Lab result';
        else if (deleteType === 'careGap') itemType = 'Care gap';
        
        toast.success(`${itemType} deleted successfully`, {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
        
        refreshPatientData();
      } else {
        toast.error(`Failed to delete ${deleteType}`, {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    }
    
    setIsDeleteDialogOpen(false);
  };
  
  const handleModalClose = () => {
    setIsMedicationModalOpen(false);
    setIsLabResultModalOpen(false);
    setIsCareGapModalOpen(false);
    refreshPatientData();
  };
  
  // Lab results handlers
  const handleAddLabResult = () => {
    setSelectedLabResult(null);
    setIsLabResultModalOpen(true);
  };

  const handleEditLabResult = (labResult: any, index: number) => {
    setSelectedLabResult({ labResult, index });
    setIsLabResultModalOpen(true);
  };

  const handleDeleteLabResult = (index: number) => {
    setDeleteType('labResult');
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };
  
  // Care gaps handlers
  const handleAddCareGap = () => {
    setSelectedCareGap(null);
    setIsCareGapModalOpen(true);
  };

  const handleEditCareGap = (careGap: any, index: number) => {
    setSelectedCareGap({ careGap, index });
    setIsCareGapModalOpen(true);
  };

  const handleDeleteCareGap = (index: number) => {
    setDeleteType('careGap');
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healable-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !patientData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Patient Data</h2>
            <p className="text-red-600">
              {error ? (error as Error).message : 'No patient data found.'}
            </p>
            <Button
              onClick={() => window.history.back()}
              className="mt-4"
              variant="outline"
            >
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button variant="ghost" onClick={() => window.history.back()} className="mb-2">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-2xl font-bold">{patientData.name}</h1>
            <p className="text-muted-foreground">
              Last visit: {formatDateTime(patientData.lastVisit)}
            </p>
          </div>
        </div>

        <Tabs defaultValue="ai_assistant">
          <TabsList>
            <TabsTrigger value="ai_assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="patient_summary">Patient Summary</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="lab_results">Lab Results</TabsTrigger>
            <TabsTrigger value="care_gaps">Care Gaps</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="ai_assistant">
            <AIQuerySection
              setAiResponseContent={setAiResponseContent}
              setIsAddNoteModalOpen={setIsAddNoteModalOpen}
              patientId={patientId || ''}
              initialQuery={initialQuery}
            />
          </TabsContent>

          <TabsContent value="patient_summary">
            <PatientSummary 
              patient={patientData} 
              refreshData={refreshPatientData} 
            />
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Current Medications</CardTitle>
                  <Button size="sm" onClick={handleAddMedication}>
                    <Plus className="h-4 w-4 mr-2" /> Add Medication
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientData.medications?.map((med: any, idx: number) => (
                    <div key={idx} className="border rounded-md p-4 group">
                      <div className="flex justify-between">
                        <div className="font-medium">{med.name}</div>
                        <div className="hidden group-hover:flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditMedication(med, idx)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMedication(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency} • Started {med.startDate}
                      </div>
                      {med.adherence !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs text-muted-foreground">Adherence</div>
                            <div className="text-xs font-medium">{med.adherence}%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                med.adherence > 80
                                  ? "bg-green-500"
                                  : med.adherence > 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${med.adherence}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!patientData.medications || patientData.medications.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No medications recorded for this patient.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab_results">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Lab Results</CardTitle>
                  <Button size="sm" onClick={handleAddLabResult}>
                    <Plus className="h-4 w-4 mr-2" /> Add Lab Result
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patientData.labResults?.map((lab: any, idx: number) => {
                    const statusColors = {
                      normal: 'bg-green-100 text-green-800',
                      abnormal: 'bg-amber-100 text-amber-800',
                      critical: 'bg-red-100 text-red-800'
                    };
                    
                    return (
                      <div key={idx} className="flex items-center justify-between border-b pb-2 group">
                        <div>
                          <div className="font-medium">{lab.test}</div>
                          <div className="text-sm text-muted-foreground">{lab.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{lab.value} {lab.unit}</div>
                          <div className="text-xs text-muted-foreground">Range: {lab.referenceRange}</div>
                        </div>
                        <div className="flex items-center">
                          <Badge className={statusColors[lab.status]}>
                            {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                          </Badge>
                          <div className="hidden group-hover:flex ml-2 space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditLabResult(lab, idx)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLabResult(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!patientData.labResults || patientData.labResults.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No lab results recorded for this patient.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care_gaps">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Care Gaps</CardTitle>
                  <Button size="sm" onClick={handleAddCareGap}>
                    <Plus className="h-4 w-4 mr-2" /> Add Care Gap
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientData.careGaps?.map((gap: any, idx: number) => {
                    const priorityColors = {
                      low: 'border-l-green-500',
                      medium: 'border-l-amber-500',
                      high: 'border-l-red-500'
                    };
                    
                    return (
                      <div key={idx} className={`border-l-4 ${priorityColors[gap.priority]} pl-4 py-2 group`}>
                        <div className="flex justify-between">
                          <div className="font-semibold">{gap.type}</div>
                          <div className="hidden group-hover:flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditCareGap(gap, idx)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCareGap(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm">{gap.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Due: {gap.dueDate} • Priority: {gap.priority.charAt(0).toUpperCase() + gap.priority.slice(1)}
                        </div>
                      </div>
                    );
                  })}
                  {(!patientData.careGaps || patientData.careGaps.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No care gaps recorded for this patient.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <NotesTab patientId={patientId} />
          </TabsContent>
        </Tabs>

        <AddNoteModal
          isOpen={isAddNoteModalOpen}
          onClose={() => {
            setIsAddNoteModalOpen(false);
            setAiResponseContent('');
          }}
          patientId={patientId}
          initialContent={aiResponseContent}
          noteType={aiResponseContent ? 'ai_generated' : 'manual'}
        />

        <LiveNoteCapture
          isOpen={isLiveNoteCaptureOpen}
          onClose={() => setIsLiveNoteCaptureOpen(false)}
          patientId={patientId}
        />

        {/* Modals for medications */}
        {isMedicationModalOpen && (
          <MedicationModal
            isOpen={isMedicationModalOpen}
            onClose={handleModalClose}
            patientId={patientId || ''}
            medication={selectedMedication?.medication}
            index={selectedMedication?.index}
          />
        )}

        {/* Modals for lab results */}
        {isLabResultModalOpen && (
          <LabResultModal
            isOpen={isLabResultModalOpen}
            onClose={handleModalClose}
            patientId={patientId || ''}
            labResult={selectedLabResult?.labResult}
            index={selectedLabResult?.index}
          />
        )}

        {/* Modals for care gaps */}
        {isCareGapModalOpen && (
          <CareGapModal
            isOpen={isCareGapModalOpen}
            onClose={handleModalClose}
            patientId={patientId || ''}
            careGap={selectedCareGap?.careGap}
            index={selectedCareGap?.index}
          />
        )}

        {/* Confirmation dialog for deletions */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete this {
                  deleteType === 'medication' ? 'medication' : 
                  deleteType === 'labResult' ? 'lab result' : 'care gap'
                } and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default PatientRecord;
