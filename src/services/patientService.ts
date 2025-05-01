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
  },
  '2': {
    id: '2',
    name: 'Maria Garcia',
    age: 54,
    dob: '1970-11-22',
    gender: 'Female',
    contact: '(555) 234-5678',
    address: '456 Oak Ave, Sometown, USA',
    insurance: 'Blue Cross',
    primaryCondition: 'COPD',
    conditions: ['COPD', 'Anxiety', 'Osteoarthritis'],
    lastVisit: '2023-05-01',
    vitalSigns: {
      bloodPressure: '128/78',
      heartRate: 82,
      respiratoryRate: 20,
      temperature: 98.2,
      oxygenSaturation: 92,
      lastUpdated: '2023-05-01'
    },
    medications: [
      { name: 'Albuterol', dosage: '90mcg', frequency: 'As needed', startDate: '2020-03-15', adherence: 88 },
      { name: 'Fluticasone/Salmeterol', dosage: '250/50mcg', frequency: 'Twice daily', startDate: '2021-01-30', adherence: 91 },
      { name: 'Escitalopram', dosage: '10mg', frequency: 'Once daily', startDate: '2022-07-12', adherence: 95 }
    ],
    labResults: [
      { test: 'PFT FEV1', value: '65', unit: '%', referenceRange: '>80', date: '2023-03-15', status: 'abnormal' },
      { test: 'CBC', value: 'Normal', unit: '', referenceRange: 'Normal', date: '2023-03-15', status: 'normal' },
      { test: 'CRP', value: '1.2', unit: 'mg/L', referenceRange: '<3.0', date: '2023-03-15', status: 'normal' }
    ],
    careGaps: [
      { type: 'Vaccination', description: 'Annual flu vaccine due', dueDate: '2023-10-01', priority: 'medium' },
      { type: 'Screening', description: 'Bone density test recommended', dueDate: '2023-08-15', priority: 'low' }
    ],
    notes: [
      { date: '2023-05-01', provider: 'Dr. Michael Chang', content: 'Patient reports increased use of rescue inhaler. Adjusted maintenance medication regimen. Consider pulmonary rehabilitation.' },
      { date: '2023-01-20', provider: 'Dr. Michael Chang', content: 'Winter exacerbation resolved. Patient adhering well to medication regimen. Continue current management.' }
    ],
    riskFactors: [
      { factor: 'Respiratory Exacerbation Risk', level: 'medium', trend: 'worsening' },
      { factor: 'Mental Health Status', level: 'low', trend: 'stable' },
      { factor: 'Vaccination Adherence', level: 'medium', trend: 'improving' }
    ]
  },
  '3': {
    id: '3',
    name: 'Robert Chen',
    age: 71,
    dob: '1953-06-08',
    gender: 'Male',
    contact: '(555) 345-6789',
    address: '789 Pine Ln, Othertown, USA',
    insurance: 'Medicare Advantage',
    primaryCondition: 'Heart Failure',
    conditions: ['Heart Failure', 'Atrial Fibrillation', 'Chronic Kidney Disease'],
    lastVisit: '2023-04-22',
    vitalSigns: {
      bloodPressure: '132/84',
      heartRate: 88,
      respiratoryRate: 18,
      temperature: 97.9,
      oxygenSaturation: 94,
      lastUpdated: '2023-04-22'
    },
    medications: [
      { name: 'Furosemide', dosage: '40mg', frequency: 'Twice daily', startDate: '2019-08-10', adherence: 78 },
      { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', startDate: '2020-02-15', adherence: 82 },
      { name: 'Apixaban', dosage: '5mg', frequency: 'Twice daily', startDate: '2021-11-03', adherence: 94 },
      { name: 'Spironolactone', dosage: '25mg', frequency: 'Once daily', startDate: '2022-03-28', adherence: 80 }
    ],
    labResults: [
      { test: 'BNP', value: '450', unit: 'pg/mL', referenceRange: '<100', date: '2023-04-10', status: 'critical' },
      { test: 'Creatinine', value: '1.8', unit: 'mg/dL', referenceRange: '0.7-1.3', date: '2023-04-10', status: 'abnormal' },
      { test: 'Potassium', value: '4.8', unit: 'mmol/L', referenceRange: '3.5-5.0', date: '2023-04-10', status: 'normal' },
      { test: 'INR', value: '2.4', unit: '', referenceRange: '2.0-3.0', date: '2023-04-10', status: 'normal' }
    ],
    careGaps: [
      { type: 'Monitoring', description: 'Home weight monitoring compliance low', dueDate: '2023-05-01', priority: 'high' },
      { type: 'Follow-up', description: 'Cardiology follow-up appointment needed', dueDate: '2023-06-15', priority: 'high' },
      { type: 'Education', description: 'Dietary sodium restriction counseling', dueDate: '2023-05-10', priority: 'medium' }
    ],
    notes: [
      { date: '2023-04-22', provider: 'Dr. Elizabeth Wong', content: 'Patient with increased peripheral edema and shortness of breath. Increased diuretic dose and scheduled for echocardiogram next week.' },
      { date: '2023-03-05', provider: 'Dr. Elizabeth Wong', content: 'Stable at follow-up. Medication reconciliation performed. Continue current heart failure management plan.' }
    ],
    riskFactors: [
      { factor: 'Heart Failure Decompensation', level: 'high', trend: 'worsening' },
      { factor: 'Medication Adherence Risk', level: 'medium', trend: 'stable' },
      { factor: 'Renal Function Decline', level: 'high', trend: 'worsening' },
      { factor: 'Fall Risk', level: 'medium', trend: 'stable' }
    ]
  },
  '4': {
    id: '4',
    name: 'Sarah Johnson',
    age: 42,
    dob: '1981-12-03',
    gender: 'Female',
    contact: '(555) 456-7890',
    address: '101 Maple Dr, Somewhere, USA',
    insurance: 'Aetna',
    primaryCondition: 'Asthma',
    conditions: ['Asthma', 'Allergic Rhinitis', 'Eczema'],
    lastVisit: '2023-03-15',
    vitalSigns: {
      bloodPressure: '118/76',
      heartRate: 72,
      respiratoryRate: 14,
      temperature: 98.4,
      oxygenSaturation: 99,
      lastUpdated: '2023-03-15'
    },
    medications: [
      { name: 'Fluticasone', dosage: '110mcg', frequency: 'Twice daily', startDate: '2021-05-20', adherence: 85 },
      { name: 'Montelukast', dosage: '10mg', frequency: 'Once daily', startDate: '2022-01-15', adherence: 92 },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', startDate: '2021-08-30', adherence: 78 }
    ],
    labResults: [
      { test: 'Peak Flow', value: '420', unit: 'L/min', referenceRange: '>400', date: '2023-03-15', status: 'normal' },
      { test: 'IgE', value: '180', unit: 'IU/mL', referenceRange: '<100', date: '2022-11-10', status: 'abnormal' }
    ],
    careGaps: [
      { type: 'Action Plan', description: 'Asthma action plan needs updating', dueDate: '2023-06-01', priority: 'low' },
      { type: 'Screening', description: 'Allergy testing recommended', dueDate: '2023-07-15', priority: 'low' }
    ],
    notes: [
      { date: '2023-03-15', provider: 'Dr. James Miller', content: 'Patient\'s asthma well-controlled. No exacerbations in past 6 months. Seasonal allergies starting to affect symptoms. Adjusted medication regimen for spring season.' },
      { date: '2022-09-20', provider: 'Dr. James Miller', content: 'Patient recovered from bronchitis. Resumed normal asthma medication regimen. Discussed importance of flu vaccination.' }
    ],
    riskFactors: [
      { factor: 'Asthma Exacerbation Risk', level: 'low', trend: 'stable' },
      { factor: 'Seasonal Allergy Impact', level: 'medium', trend: 'worsening' },
      { factor: 'Medication Adherence Risk', level: 'low', trend: 'improving' }
    ]
  }
};

export const getPatient = async (patientId: string): Promise<PatientData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const patient = MOCK_PATIENTS[patientId];
      if (patient) {
        resolve(patient);
      } else {
        reject(new Error('Patient not found'));
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
