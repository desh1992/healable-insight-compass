
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  riskLevel: 'low' | 'medium' | 'high';
  onClick: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ 
  name, age, condition, lastVisit, riskLevel, onClick 
}) => {
  const riskColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800'
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>Age {age} • {condition}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-muted-foreground">Last visit: {lastVisit}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskColors[riskLevel]}`}>
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  // Mock patient data
  const recentPatients = [
    { id: '1', name: 'James Wilson', age: 67, condition: 'Hypertension, Diabetes', lastVisit: '3 days ago', riskLevel: 'high' as const },
    { id: '2', name: 'Maria Garcia', age: 54, condition: 'COPD', lastVisit: '1 week ago', riskLevel: 'medium' as const },
    { id: '3', name: 'Robert Chen', age: 71, condition: 'Heart Failure', lastVisit: '2 weeks ago', riskLevel: 'high' as const },
    { id: '4', name: 'Sarah Johnson', age: 42, condition: 'Asthma', lastVisit: '1 month ago', riskLevel: 'low' as const },
  ];
  
  const handlePatientClick = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };
  
  return (
    <AppLayout title="Clinical Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-healable-secondary">
            Welcome, {userInfo?.name}
          </h2>
          <Button className="bg-healable-primary hover:bg-healable-secondary transition-colors">
            New Patient
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-healable-primary">6</div>
              <p className="text-muted-foreground">2 with care gaps</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Care Gap Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-healable-warning">12</div>
              <p className="text-muted-foreground">5 high priority</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-healable-danger">8</div>
              <p className="text-muted-foreground">3 medication reviews</p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 text-healable-secondary">Recent Patients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPatients.map((patient) => (
              <PatientCard 
                key={patient.id}
                {...patient}
                onClick={() => handlePatientClick(patient.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
