
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getAllPatients, PatientData } from '@/services/patientService';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface PatientListProps {
  onSelectPatient: (patient: PatientData) => void;
  selectedPatientId?: string;
}

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient, selectedPatientId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: getAllPatients,
  });
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.primaryCondition.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getRiskBadgeColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch(riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Patient Records</CardTitle>
        <CardDescription>View and manage your patients</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healable-primary"></div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>No patients found</p>
            {searchQuery && (
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-260px)]">
            <div className="px-4 py-2">
              {filteredPatients.map((patient, index) => {
                // Find the highest risk factor for the patient
                const highestRiskFactor = patient.riskFactors.reduce((highest, current) => {
                  const riskLevels = { high: 3, medium: 2, low: 1 };
                  return riskLevels[current.level] > riskLevels[highest.level] ? current : highest;
                }, patient.riskFactors[0]);
                
                return (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div 
                      className={`p-3 mb-2 rounded-md cursor-pointer border transition-colors ${
                        selectedPatientId === patient.id 
                          ? 'bg-healable-light border-healable-primary' 
                          : 'hover:bg-gray-50 border-transparent'
                      }`}
                      onClick={() => onSelectPatient(patient)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{patient.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {patient.age} years • {patient.gender}
                          </p>
                        </div>
                        <Badge className={getRiskBadgeColor(highestRiskFactor.level)}>
                          {highestRiskFactor.level.charAt(0).toUpperCase() + highestRiskFactor.level.slice(1)} Risk
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">{patient.primaryCondition}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last visit: {patient.lastVisit}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientList;
