import React, { useState, useEffect } from 'react';
import { getNotes, deleteNote } from '@/utils/storage';
import { Note } from '@/types/notes';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from '@/utils/dateFormat';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import UpdateNoteModal from './UpdateNoteModal';
import AddNoteModal from './AddNoteModal';
import { toast } from '@/components/ui/sonner';
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

interface NotesTabProps {
  patientId: string;
}

const NotesTab: React.FC<NotesTabProps> = ({ patientId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, [patientId]);

  const loadNotes = () => {
    setNotes(getNotes(patientId));
  };

  const getNoteBadgeStyle = (type: string) => {
    return type === 'ai_generated' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const handleUpdateClick = (note: Note) => {
    setSelectedNote(note);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedNote) {
      const success = deleteNote(patientId, selectedNote.id);
      
      if (success) {
        toast.success('Note deleted successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
        loadNotes();
      } else {
        toast.error('Failed to delete note', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
      
      setIsDeleteDialogOpen(false);
    }
  };

  const handleModalClose = () => {
    setIsUpdateModalOpen(false);
    setIsAddModalOpen(false);
    loadNotes();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Patient Notes</h2>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Add Note
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-4 p-1">
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No notes available for this patient.
            </p>
          ) : (
            notes.map((note: Note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getNoteBadgeStyle(note.type)}>
                      {note.type === 'ai_generated' ? 'AI Generated' : 'Manual Note'}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleUpdateClick(note)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(note)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatDateTime(note.timestamp)}
                  </div>
                  <div className="prose prose-sm max-w-none break-words">
                    <p className="whitespace-pre-wrap overflow-hidden text-sm">{note.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {selectedNote && (
        <UpdateNoteModal
          isOpen={isUpdateModalOpen}
          onClose={handleModalClose}
          note={selectedNote}
        />
      )}

      <AddNoteModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        patientId={patientId}
        noteType="manual"
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this note and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NotesTab; 