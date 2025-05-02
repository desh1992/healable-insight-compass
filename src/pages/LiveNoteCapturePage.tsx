import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { saveLiveNote } from '@/utils/storage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  text: string;
  speaker: 'doctor' | 'patient';
  timestamp: string;
}

interface CompletedConversation {
  id: string;
  patientName: string;
  timestamp: string;
  messages: Message[];
}

const dummyConversation: Message[] = [
  { id: 1, text: "Hello Mrs. Johnson, how are you feeling today?", speaker: 'doctor', timestamp: '10:30 AM' },
  { id: 2, text: "I've been having some trouble sleeping lately, doctor.", speaker: 'patient', timestamp: '10:30 AM' },
  { id: 3, text: "I see. How long has this been going on?", speaker: 'doctor', timestamp: '10:31 AM' },
  { id: 4, text: "About two weeks now. I keep waking up in the middle of the night.", speaker: 'patient', timestamp: '10:31 AM' },
  { id: 5, text: "Have you noticed any changes in your daily routine or stress levels?", speaker: 'doctor', timestamp: '10:32 AM' },
  { id: 6, text: "Well, I started a new job last month, and it's been quite demanding.", speaker: 'patient', timestamp: '10:32 AM' },
];

const TypewriterText: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayedText}</span>;
};

const LiveNoteCapturePage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [completedConversations, setCompletedConversations] = useState<CompletedConversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isRecording && currentMessageIndex < dummyConversation.length) {
      const timer = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, dummyConversation[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isRecording, currentMessageIndex]);

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  const handleStartCapture = () => {
    setIsRecording(true);
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
  };

  const handleStopCapture = () => {
    setIsRecording(false);
    // Save the completed conversation
    if (displayedMessages.length > 0) {
      const newConversation: CompletedConversation = {
        id: Date.now().toString(),
        patientName: "Mrs. Johnson", // In real app, this would come from selected patient
        timestamp: new Date().toLocaleString(),
        messages: displayedMessages
      };
      setCompletedConversations(prev => [newConversation, ...prev]);
      
      // Save to storage (you would implement this based on your storage needs)
      saveLiveNote({
        id: newConversation.id,
        patientId: "123", // In real app, this would be actual patient ID
        content: displayedMessages.map(m => `${m.speaker}: ${m.text}`).join('\n'),
        timestamp: new Date().toISOString(),
        type: 'live_capture',
        speaker: 'system'
      });
    }
  };

  return (
    <AppLayout title="Live Note Capture">
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          {!isRecording ? (
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

        <div className="flex flex-1 gap-4 p-4 overflow-hidden">
          {/* Live Conversation Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                <AnimatePresence>
                  {displayedMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cn(
                        "flex flex-col p-4 rounded-lg max-w-[80%]",
                        message.speaker === 'doctor' 
                          ? "bg-healable-light ml-auto" 
                          : "bg-gray-100"
                      )}
                    >
                      <div className="text-sm text-gray-500 mb-1">
                        {message.speaker === 'doctor' ? 'Doctor' : 'Patient'} • {message.timestamp}
                      </div>
                      <TypewriterText 
                        text={message.text}
                        onComplete={scrollToBottom}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Completed Conversations List */}
          <div className="w-80 flex flex-col">
            <Card>
              <CardHeader>
                <CardTitle>Live Notes History</CardTitle>
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LiveNoteCapturePage; 