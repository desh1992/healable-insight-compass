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
import { updateNote } from '@/utils/storage';
import { Note } from '@/types/notes';
import { toast } from '@/components/ui/sonner';

interface UpdateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

const UpdateNoteModal: React.FC<UpdateNoteModalProps> = ({
  isOpen,
  onClose,
  note
}) => {
  const [content, setContent] = useState(note.content);

  const handleUpdate = () => {
    if (!content.trim()) {
      toast.error('Note content cannot be empty', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    const updatedNote: Note = {
      ...note,
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    const success = updateNote(updatedNote);
    
    if (success) {
      toast.success('Note updated successfully', {
        duration: 3000,
        position: 'bottom-right',
        className: 'bg-healable-primary text-white',
        icon: '✓'
      });
      onClose();
    } else {
      toast.error('Failed to update note', {
        duration: 3000,
        position: 'bottom-right'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Note</DialogTitle>
          <DialogDescription>
            Edit the note content
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate}>Update Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateNoteModal; 