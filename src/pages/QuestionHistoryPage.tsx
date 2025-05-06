import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { getPatient } from '@/services/patientService';
import { useQuery } from '@tanstack/react-query';

interface QuestionHistoryItem {
  text: string;
  timestamp: string;
  answer?: string;
}

const QuestionHistoryPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  
  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId || '1'),
  });
  
  // Load question history from localStorage on component mount
  useEffect(() => {
    if (!patientId) return;
    
    const savedHistory = localStorage.getItem(`question_history_${patientId}`);
    if (savedHistory) {
      try {
        setQuestionHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse saved question history", e);
      }
    }
  }, [patientId]);
  
  // Toggle expanded state for a question
  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };
  
  // Go back to patient record
  const handleBack = () => {
    navigate(`/patient/${patientId}`);
  };
  
  // Reuse a question
  const handleReuseQuestion = (question: string) => {
    // Navigate back to patient page with query param
    navigate(`/patient/${patientId}?query=${encodeURIComponent(question)}`);
  };
  
  return (
    <AppLayout title={`Question History - ${patient?.name || 'Patient'}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Patient Record
          </Button>
          
          <h1 className="text-2xl font-semibold text-healable-secondary">Question History</h1>
        </div>
        
        {questionHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No question history found for this patient.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questionHistory.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-healable-primary">
                <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleExpand(index)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{item.text}</CardTitle>
                      <CardDescription>{item.timestamp}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      {expandedItems.has(index) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedItems.has(index) && (
                  <CardContent className="pt-4 pb-6 border-t">
                    <div className="bg-healable-light/10 p-4 rounded-md whitespace-pre-line">
                      {item.answer || "No answer recorded"}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default QuestionHistoryPage; 