import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { saveLiveNote } from '@/utils/storage';
import { LiveNote } from '@/types/notes';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '@/utils/dateFormat';

interface LiveNoteCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

// Dummy conversation data
const DUMMY_CONVERSATION = [
  { speaker: 'doctor', content: "How have you been feeling since your last visit?" },
  { speaker: 'patient', content: "The breathing exercises have helped, but I still have some discomfort in the mornings." },
  { speaker: 'doctor', content: "I see. Have you been using the inhaler as prescribed?" },
  { speaker: 'patient', content: "Yes, twice daily as recommended. It provides immediate relief when needed." },
  { speaker: 'doctor', content: "That's good to hear. Let's review your peak flow measurements." },
  { speaker: 'patient', content: "I've been recording them daily. They've improved but still vary quite a bit." }
] as const;

const LiveNoteCapture: React.FC<LiveNoteCaptureProps> = ({
  isOpen,
  onClose,
  patientId
}) => {
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [activeNotes, setActiveNotes] = useState<LiveNote[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentNoteIndex(0);
      setActiveNotes([]);
      return;
    }

    const interval = setInterval(() => {
      if (currentNoteIndex < DUMMY_CONVERSATION.length) {
        const newNote: LiveNote = {
          id: `live-note-${Date.now()}`,
          patientId,
          content: DUMMY_CONVERSATION[currentNoteIndex].content,
          timestamp: new Date().toISOString(),
          type: 'manual',
          speaker: DUMMY_CONVERSATION[currentNoteIndex].speaker,
          isActive: true
        };

        saveLiveNote(newNote);
        setActiveNotes(prev => [...prev, newNote]);
        setCurrentNoteIndex(prev => prev + 1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, currentNoteIndex, patientId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh]">
        <DialogHeader>
          <DialogTitle>Live Conversation Capture</DialogTitle>
          <DialogDescription>
            Real-time transcription of the doctor-patient conversation
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          <AnimatePresence>
            {activeNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${note.speaker === 'doctor' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-lg ${
                    note.speaker === 'doctor' 
                      ? 'bg-healable-primary text-white' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {note.speaker === 'doctor' ? 'Doctor' : 'Patient'}
                  </div>
                  <p>{note.content}</p>
                  <div className="text-xs opacity-70 mt-2">
                    {formatTime(note.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveNoteCapture; 