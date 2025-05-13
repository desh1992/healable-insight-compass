import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SpeakerMessage {
  id: number;
  speakerId: number;
  text: string;
  timestamp: string;
}

interface SpeakerTranscriptionProps {
  messages: SpeakerMessage[];
  currentSpeakerId: number;
  isRecording: boolean;
}

const SpeakerTranscription: React.FC<SpeakerTranscriptionProps> = ({ 
  messages, 
  currentSpeakerId,
  isRecording 
}) => {
  // Get speaker labels and avatars
  const getSpeakerInfo = (speakerId: number) => {
    // Speaker numbering is 1-based (we added 1 to the Amazon Transcribe speaker IDs)
    switch (speakerId) {
      case 1:
        return {
          label: 'Patient',
          colorClass: 'bg-blue-50 border-blue-200',
          textColorClass: 'text-blue-700',
          avatarClass: 'bg-blue-100 text-blue-700',
          initials: 'PT'
        };
      case 2:
        return {
          label: 'Provider',
          colorClass: 'bg-amber-50 border-amber-200',
          textColorClass: 'text-amber-700',
          avatarClass: 'bg-amber-100 text-amber-700',
          initials: 'DR'
        };
      default:
        return {
          label: `Speaker ${speakerId}`,
          colorClass: 'bg-gray-50 border-gray-200',
          textColorClass: 'text-gray-700',
          avatarClass: 'bg-gray-100 text-gray-700',
          initials: `S${speakerId}`
        };
    }
  };

  // Group consecutive messages from the same speaker
  const groupedMessages = messages.reduce((acc, message) => {
    const lastGroup = acc[acc.length - 1];
    
    if (lastGroup && lastGroup.speakerId === message.speakerId) {
      // Append to the existing group if the speaker is the same
      lastGroup.messages.push(message);
    } else {
      // Create a new group for a different speaker
      acc.push({
        speakerId: message.speakerId,
        messages: [message]
      });
    }
    
    return acc;
  }, [] as { speakerId: number; messages: SpeakerMessage[] }[]);

  return (
    <div className="space-y-4 py-2">
      {groupedMessages.map((group, index) => {
        const speakerInfo = getSpeakerInfo(group.speakerId);
        
        return (
          <div key={`group-${index}`} className="flex items-start gap-3">
            <Avatar className={`mt-1 ${speakerInfo.avatarClass}`}>
              <AvatarFallback>{speakerInfo.initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className={`font-semibold text-sm ${speakerInfo.textColorClass}`}>
                {speakerInfo.label}
              </div>
              
              {group.messages.map((message, msgIndex) => (
                <Card 
                  key={message.id}
                  className={`${speakerInfo.colorClass} shadow-sm mb-1`}
                >
                  <CardContent className="pt-3 pb-3">
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    {msgIndex === group.messages.length - 1 && (
                      <div className="text-gray-500 text-xs mt-1">
                        {message.timestamp}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      
      {isRecording && (
        <div className="flex items-center text-sm text-gray-500 mt-3 ml-2">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Listening to {getSpeakerInfo(currentSpeakerId).label}...
        </div>
      )}
    </div>
  );
};

export default SpeakerTranscription; 