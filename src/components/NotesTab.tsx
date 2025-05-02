import React from 'react';
import { getNotes } from '@/utils/storage';
import { Note } from '@/types/notes';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from '@/utils/dateFormat';
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotesTabProps {
  patientId: string;
}

const NotesTab: React.FC<NotesTabProps> = ({ patientId }) => {
  const notes = getNotes(patientId);

  const getNoteBadgeStyle = (type: string) => {
    return type === 'ai_generated' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
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
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(note.timestamp)}
                  </span>
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
  );
};

export default NotesTab; 