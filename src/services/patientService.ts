
// This is a mock service for demo purposes

export interface PatientData {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: string;
  contact: string;
  address: string;
  insurance: string;
  primaryCondition: string;
  conditions: string[];
  lastVisit: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    oxygenSaturation: number;
    lastUpdated: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    adherence?: number;
  }>;
  labResults: Array<{
    test: string;
    value: string;
    unit: string;
    referenceRange: string;
    date: string;
    status: 'normal' | 'abnormal' | 'critical';
  }>;
  careGaps: Array<{
    type: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  notes: Array<{
    date: string;
    provider: string;
    content: string;
  }>;
  riskFactors: Array<{
    factor: string;
    level: 'low' | 'medium' | 'high';
    trend: 'improving' | 'stable' | 'worsening';
  }>;
}

const MOCK_PATIENTS: Record<string, PatientData> = {
  '1': {
    id: '1',
    name: 'James Wilson',
    age: 67,
    dob: '1957-03-15',
    gender: 'Male',
    contact: '(555) 123-4567',
    address: '123 Main St, Anytown, USA',
    insurance: 'Medicare',
    primaryCondition: 'Hypertension',
    conditions: ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia'],
    lastVisit: '2023-04-12',
    vitalSigns: {
      bloodPressure: '145/92',
      heartRate: 76,
      respiratoryRate: 16,
      temperature: 98.6,
      oxygenSaturation: 97,
      lastUpdated: '2023-04-12'
    },
    medications: [
      { name: 'Lisinopril', dosage: '20mg', frequency: 'Once daily', startDate: '2021-06-10', adherence: 85 },
      { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', startDate: '2020-11-22', adherence: 72 },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily', startDate: '2019-03-15', adherence: 90 }
    ],
    labResults: [
      { test: 'A1C', value: '7.8', unit: '%', referenceRange: '<7.0', date: '2023-04-01', status: 'abnormal' },
      { test: 'LDL Cholesterol', value: '118', unit: 'mg/dL', referenceRange: '<100', date: '2023-04-01', status: 'abnormal' },
      { test: 'eGFR', value: '65', unit: 'mL/min/1.73m²', referenceRange: '>60', date: '2023-04-01', status: 'normal' }
    ],
    careGaps: [
      { type: 'Screening', description: 'Overdue for eye exam', dueDate: '2023-01-15', priority: 'high' },
      { type: 'Immunization', description: 'Pneumococcal vaccine needed', dueDate: '2023-05-30', priority: 'medium' }
    ],
    notes: [
      { date: '2023-04-12', provider: 'Dr. Sarah Smith', content: 'Patient reports occasional dizziness. BP remains elevated despite current regimen. Consider adjusting medications.' },
      { date: '2023-02-27', provider: 'Dr. Sarah Smith', content: 'Patient reports improved adherence to diabetic diet. A1C still elevated. Continue current management with follow-up in 6 weeks.' }
    ],
    riskFactors: [
      { factor: 'Cardiovascular Risk', level: 'high', trend: 'stable' },
      { factor: 'Diabetes Complication Risk', level: 'medium', trend: 'worsening' },
      { factor: 'Medication Adherence Risk', level: 'medium', trend: 'improving' }
    ]
  }
};

export const getPatient = async (patientId: string): Promise<PatientData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const patient = MOCK_PATIENTS[patientId];
      if (patient) {
        resolve(patient);
      } else {
        throw new Error('Patient not found');
      }
    }, 500);
  });
};

export const getAllPatients = async (): Promise<PatientData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Object.values(MOCK_PATIENTS));
    }, 500);
  });
};
