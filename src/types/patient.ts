export interface PatientData {
  id: string;
  name: string;
  age?: number;
  dob: string;
  gender: string;
  contact?: string;
  address?: string;
  insurance?: string;
  primaryCondition?: string;
  conditions?: string[];
  lastVisit: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    lastUpdated?: string;
  };
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    adherence?: number;
  }>;
  labResults?: Array<{
    test: string;
    value: string;
    unit: string;
    referenceRange: string;
    date: string;
    status: 'normal' | 'abnormal' | 'critical';
  }>;
  careGaps?: Array<{
    type: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  notes?: Array<{
    date: string;
    provider: string;
    content: string;
  }>;
  riskFactors?: Array<{
    factor: string;
    level: 'low' | 'medium' | 'high';
    trend: 'improving' | 'stable' | 'worsening';
  }>;
} 