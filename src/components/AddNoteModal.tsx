import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveNote } from '@/utils/storage';
import { Note } from '@/types/notes';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  initialContent?: string;
  noteType?: 'manual' | 'ai_generated';
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  patientId,
  initialContent = '',
  noteType = 'manual'
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (!content.trim()) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      patientId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: noteType
    };

    saveNote(note);
    setContent('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            {noteType === 'ai_generated' ? 'Save AI-generated content as a note' : 'Add a new note to the patient\'s record'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note here..."
            className="min-h-[200px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal; 