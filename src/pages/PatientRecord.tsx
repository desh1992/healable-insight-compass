import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { getPatient } from '@/services/patientService';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AddNoteModal from '@/components/AddNoteModal';
import NotesTab from '@/components/NotesTab';
import LiveNoteCapture from '@/components/LiveNoteCapture';
import { FileText, Mic } from 'lucide-react';
import { formatDateTime, formatDate } from '@/utils/dateFormat';
import { Note } from '@/types/notes';
import { saveNote } from '@/utils/storage';

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
}> = ({ setAiResponseContent, setIsAddNoteModalOpen, patientId }) => {
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  
  const commonQueries = [
    "What were this patient's last A1C results?",
    "Any missed medications in the last 60 days?",
    "Are there any missed or overdue screenings?",
    "What comorbidities might impact today's treatment plan?",
    "Show me this patient's hospitalization history",
    "What risk factors have increased since their last visit?"
  ];
  
  const handleQuerySubmit = (queryText: string) => {
    setQuery(queryText);
    setIsQuerying(true);
    setAIResponse(null);
    
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
      
      setAIResponse(response);
    }, 1500);
  };
  
  const handleCopyToNote = (content: string) => {
    const note: Note = {
      id: `note-${Date.now()}`,
      patientId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'ai_generated'
    };
    
    saveNote(note);
    toast.success('Note saved successfully');
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center">
          <Input
            placeholder="Ask a question about this patient..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-28"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleQuerySubmit(query);
              }
            }}
          />
          <Button 
            className="absolute right-1 h-[calc(100%-8px)] px-6 bg-healable-primary hover:bg-healable-secondary rounded-md"
            disabled={isQuerying || !query.trim()}
            onClick={() => handleQuerySubmit(query)}
          >
            {isQuerying ? "Processing..." : "Ask"}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
  );
};

// Update the PatientSummary component
const PatientSummary: React.FC<PatientSummaryProps> = ({ patient }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Age/DOB:</dt>
              <dd>{patient.age} years ({patient.dob})</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Gender:</dt>
              <dd>{patient.gender}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Contact:</dt>
              <dd>{patient.contact}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Insurance:</dt>
              <dd>{patient.insurance}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Latest Vital Signs</CardTitle>
          <CardDescription>{patient.vitalSigns?.lastUpdated || 'No data available'}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Blood Pressure:</dt>
              <dd className="text-healable-danger">{patient.vitalSigns?.bloodPressure || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Heart Rate:</dt>
              <dd>{patient.vitalSigns?.heartRate ? `${patient.vitalSigns.heartRate} bpm` : 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Respiratory Rate:</dt>
              <dd>{patient.vitalSigns?.respiratoryRate ? `${patient.vitalSigns.respiratoryRate} br/min` : 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Temperature:</dt>
              <dd>{patient.vitalSigns?.temperature ? `${patient.vitalSigns.temperature}°F` : 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">O2 Saturation:</dt>
              <dd>{patient.vitalSigns?.oxygenSaturation ? `${patient.vitalSigns.oxygenSaturation}%` : 'N/A'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Primary Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {patient.conditions?.map((condition: string, idx: number) => (
              <Badge key={idx} variant="outline" className="bg-healable-light">
                {condition}
              </Badge>
            )) || <span className="text-muted-foreground">No conditions recorded</span>}
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Key Risk Factors</h4>
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
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{risk.factor}</span>
                    <span className={`px-2 py-0.5 rounded ${levelColors[risk.level]}`}>
                      {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)} {trendIcons[risk.trend]}
                    </span>
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
    </div>
  );
};

// Main Patient Record component
const PatientRecord: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isLiveNoteCaptureOpen, setIsLiveNoteCaptureOpen] = useState(false);
  const [aiResponseContent, setAiResponseContent] = useState<string>('');
  
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId || '1'),
  });
  
  if (isLoading) {
    return (
      <AppLayout title="Patient Record">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healable-primary mx-auto"></div>
            <p className="mt-4 text-healable-secondary">Loading patient information...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (error || !patient) {
    return (
      <AppLayout title="Patient Record">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-healable-danger">Error loading patient information</p>
            <Button variant="outline" className="mt-2" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout title={`Patient: ${patient.name}`}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-healable-secondary">
              {patient.name}
            </h1>
            <div className="text-muted-foreground">
              Last Visit: {formatDate(patient.lastVisit)}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Patient History</Button>
            <Button 
              className="bg-healable-primary hover:bg-healable-secondary"
              onClick={() => setIsAddNoteModalOpen(true)}
            >
              Add Note
            </Button>
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
            />
          </TabsContent>

          <TabsContent value="patient_summary">
            <PatientSummary patient={patient} />
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.medications?.map((med: any, idx: number) => (
                    <div key={idx} className="border rounded-md p-4">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency} • Started {med.startDate}
                      </div>
                      {med.adherence !== undefined && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Adherence</div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                med.adherence > 85 ? 'bg-green-500' : 
                                med.adherence > 70 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${med.adherence}%` }}
                            ></div>
                          </div>
                          <div className="text-xs mt-1 text-right">{med.adherence}%</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab_results">
            <Card>
              <CardHeader>
                <CardTitle>Lab Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patient.labResults?.map((lab: any, idx: number) => {
                    const statusColors = {
                      normal: 'bg-green-100 text-green-800',
                      abnormal: 'bg-amber-100 text-amber-800',
                      critical: 'bg-red-100 text-red-800'
                    };
                    
                    return (
                      <div key={idx} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">{lab.test}</div>
                          <div className="text-sm text-muted-foreground">{lab.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{lab.value} {lab.unit}</div>
                          <div className="text-xs text-muted-foreground">Range: {lab.referenceRange}</div>
                        </div>
                        <Badge className={statusColors[lab.status]}>
                          {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care_gaps">
            <Card>
              <CardHeader>
                <CardTitle>Care Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.careGaps?.map((gap: any, idx: number) => {
                    const priorityColors = {
                      low: 'border-l-green-500',
                      medium: 'border-l-amber-500',
                      high: 'border-l-red-500'
                    };
                    
                    return (
                      <div key={idx} className={`border-l-4 ${priorityColors[gap.priority]} pl-4 py-2`}>
                        <div className="font-semibold">{gap.type}</div>
                        <div className="text-sm">{gap.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Due: {gap.dueDate} • Priority: {gap.priority.charAt(0).toUpperCase() + gap.priority.slice(1)}
                        </div>
                      </div>
                    );
                  })}
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
      </div>
    </AppLayout>
  );
};

export default PatientRecord;
