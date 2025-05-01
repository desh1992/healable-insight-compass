
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PatientData } from '@/services/patientService';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface PatientDetailPanelProps {
  patient: PatientData | null;
  onClose: () => void;
}

const PatientDetailPanel: React.FC<PatientDetailPanelProps> = ({ patient, onClose }) => {
  if (!patient) return null;

  const getRiskBadgeColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch(riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  const getMedicationAdherenceColor = (adherence: number) => {
    if (adherence > 85) return 'bg-green-500';
    if (adherence > 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle>{patient.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {patient.age} years • {patient.gender} • {patient.contact}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-muted-foreground"
          >
            Close
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[calc(100vh-240px)]">
            <div className="px-6 py-2 space-y-6">
              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="labs">Lab Results</TabsTrigger>
                  <TabsTrigger value="care-gaps">Care Gaps</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Patient Information</h3>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">DOB:</dt>
                            <dd>{patient.dob}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Insurance:</dt>
                            <dd>{patient.insurance}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Address:</dt>
                            <dd>{patient.address}</dd>
                          </div>
                        </dl>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Vital Signs</h3>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Blood Pressure:</dt>
                            <dd>{patient.vitalSigns.bloodPressure}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Heart Rate:</dt>
                            <dd>{patient.vitalSigns.heartRate} bpm</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Temperature:</dt>
                            <dd>{patient.vitalSigns.temperature}°F</dd>
                          </div>
                        </dl>
                        <div className="text-xs text-muted-foreground mt-2">
                          Last updated: {patient.vitalSigns.lastUpdated}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Conditions</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {patient.conditions.map((condition, idx) => (
                          <Badge key={idx} variant="outline">{condition}</Badge>
                        ))}
                      </div>
                      <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
                      <div className="space-y-2">
                        {patient.riskFactors.map((risk, idx) => {
                          const trendIcons = {
                            improving: "↓",
                            stable: "→",
                            worsening: "↑"
                          };
                          
                          return (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span>{risk.factor}</span>
                              <span className={`px-2 py-0.5 rounded ${getRiskBadgeColor(risk.level)}`}>
                                {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)} {trendIcons[risk.trend]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="medications">
                  <div className="space-y-4">
                    {patient.medications.map((medication, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium">{medication.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} • {medication.frequency} • Started {medication.startDate}
                          </p>
                          
                          {medication.adherence !== undefined && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Adherence</span>
                                <span>{medication.adherence}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getMedicationAdherenceColor(medication.adherence)}`}
                                  style={{ width: `${medication.adherence}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="labs">
                  <div className="space-y-4">
                    {patient.labResults.map((lab, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">{lab.test}</h3>
                              <p className="text-sm text-muted-foreground">{lab.date}</p>
                            </div>
                            <Badge className={getRiskBadgeColor(lab.status as any)}>
                              {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Result:</span>
                              <span className="font-medium">{lab.value} {lab.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Reference Range:</span>
                              <span>{lab.referenceRange}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="care-gaps">
                  <div className="space-y-4">
                    {patient.careGaps.map((gap, idx) => {
                      const priorityColors = {
                        low: 'border-l-green-500',
                        medium: 'border-l-amber-500',
                        high: 'border-l-red-500'
                      };
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <div className={`border-l-4 ${priorityColors[gap.priority]} pl-4 py-3 border-t border-r border-b rounded-r-md`}>
                            <div className="font-medium">{gap.type}</div>
                            <div className="text-sm">{gap.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Due: {gap.dueDate} • Priority: {gap.priority.charAt(0).toUpperCase() + gap.priority.slice(1)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PatientDetailPanel;
