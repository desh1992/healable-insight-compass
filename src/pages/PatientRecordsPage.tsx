import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { getAllPatients } from '@/services/patientService';
import { PatientData } from '@/types/patient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionWrapper } from '@/components/ui/motion-wrapper';
import { Link } from 'react-router-dom';

const PatientRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const allPatients = await getAllPatients();
        setPatients(allPatients);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadgeStyle = (riskFactors: Array<{ level: string }> = []) => {
    if (!Array.isArray(riskFactors) || riskFactors.length === 0) {
      return 'bg-gray-100 text-gray-800';
    }
    
    if (riskFactors.some(risk => risk.level === 'high')) {
      return 'bg-red-100 text-red-800';
    }
    if (riskFactors.some(risk => risk.level === 'medium')) {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getRiskLevel = (riskFactors: Array<{ level: string }> = []) => {
    if (!Array.isArray(riskFactors) || riskFactors.length === 0) {
      return 'Low Risk';
    }
    
    if (riskFactors.some(r => r.level === 'high')) {
      return 'High Risk';
    }
    if (riskFactors.some(r => r.level === 'medium')) {
      return 'Medium Risk';
    }
    return 'Low Risk';
  };

  if (isLoading) {
    return (
      <AppLayout title="Patient Records">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healable-primary mx-auto"></div>
            <p className="mt-4 text-healable-secondary">Loading patients...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Patient Records">
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search patients by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <MotionWrapper variant="fadeUp" className="space-y-4">
          {filteredPatients.map((patient, index) => (
            <Link 
              key={patient.id} 
              to={`/patient/${patient.id}`}
              className="block"
            >
              <Card className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age {patient.age} • {patient.primaryCondition}
                      </p>
                    </div>
                    <Badge className={getRiskBadgeStyle(patient.riskFactors || [])}>
                      {getRiskLevel(patient.riskFactors || [])}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </MotionWrapper>
      </div>
    </AppLayout>
  );
};

export default PatientRecordsPage; 