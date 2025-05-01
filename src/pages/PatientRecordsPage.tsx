import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  riskLevel?: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

const mockPatients: Patient[] = [
  { id: '1', name: 'James Wilson', age: 67, condition: 'Hypertension, Diabetes', lastVisit: '3 days ago', riskLevel: 'High Risk' },
  { id: '2', name: 'Maria Garcia', age: 54, condition: 'COPD', lastVisit: '1 week ago', riskLevel: 'Medium Risk' },
  { id: '3', name: 'Robert Chen', age: 71, condition: 'Heart Failure', lastVisit: '2 weeks ago', riskLevel: 'Medium Risk' },
  { id: '4', name: 'Sarah Johnson', age: 42, condition: 'Asthma', lastVisit: '1 month ago', riskLevel: 'Low Risk' },
];

const PatientRecordsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePatientClick = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'High Risk':
        return 'text-red-600 bg-red-50';
      case 'Medium Risk':
        return 'text-yellow-600 bg-yellow-50';
      case 'Low Risk':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const content = (
    <div>
      <div className="mb-8">
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
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handlePatientClick(patient.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    <span>Age {patient.age}</span>
                    <span className="mx-2">•</span>
                    <span>{patient.condition}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Last visit: {patient.lastVisit}
                  </div>
                </div>
                {patient.riskLevel && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(patient.riskLevel)}`}>
                    {patient.riskLevel}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout title="Patient Records">
      {content}
    </AppLayout>
  );
};

export default PatientRecordsPage; 