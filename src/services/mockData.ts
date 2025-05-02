import { PatientData } from '@/types/patient';

export const MOCK_PATIENTS: Record<string, PatientData> = {
  'mock-1': {
    id: 'mock-1',
    name: 'James Wilson',
    age: 67,
    dob: '1957-03-15',
    gender: 'Male',
    contact: '(555) 123-4567',
    insurance: 'Medicare',
    primaryCondition: 'Hypertension',
    conditions: ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia'],
    lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    vitalSigns: {
      bloodPressure: '145/92',
      heartRate: 76,
      respiratoryRate: 16,
      temperature: 98.6,
      oxygenSaturation: 97,
      lastUpdated: '2023-04-12'
    },
    medications: [
      { 
        name: 'Lisinopril', 
        dosage: '20mg', 
        frequency: 'Once daily', 
        startDate: '2021-06-10',
        adherence: 85 
      },
      { 
        name: 'Metformin', 
        dosage: '1000mg', 
        frequency: 'Twice daily', 
        startDate: '2020-11-22',
        adherence: 72 
      },
      { 
        name: 'Atorvastatin', 
        dosage: '40mg', 
        frequency: 'Once daily', 
        startDate: '2019-03-15',
        adherence: 90 
      }
    ],
    labResults: [
      { 
        test: 'A1C', 
        value: '7.8', 
        unit: '%', 
        referenceRange: '<7.0', 
        date: '2023-04-01',
        status: 'abnormal' 
      },
      { 
        test: 'LDL Cholesterol', 
        value: '118', 
        unit: 'mg/dL', 
        referenceRange: '<100', 
        date: '2023-04-01',
        status: 'abnormal' 
      },
      { 
        test: 'eGFR', 
        value: '65', 
        unit: 'mL/min/1.73m²', 
        referenceRange: '>60', 
        date: '2023-04-01',
        status: 'normal' 
      }
    ],
    careGaps: [
      { 
        type: 'Screening',
        description: 'Overdue for eye exam',
        dueDate: '2023-01-15',
        priority: 'high'
      },
      { 
        type: 'Immunization',
        description: 'Pneumococcal vaccine needed',
        dueDate: '2023-05-30',
        priority: 'medium'
      }
    ],
    riskFactors: [
      { factor: 'Cardiovascular Risk', level: 'high', trend: 'stable' },
      { factor: 'Diabetes Complication Risk', level: 'medium', trend: 'worsening' },
      { factor: 'Medication Adherence Risk', level: 'medium', trend: 'improving' }
    ]
  },
  'mock-2': {
    id: 'mock-2',
    name: 'Maria Garcia',
    age: 54,
    dob: '1970-05-20',
    gender: 'Female',
    contact: '(555) 234-5678',
    insurance: 'Blue Cross',
    primaryCondition: 'COPD',
    conditions: ['COPD', 'Anxiety'],
    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    vitalSigns: {
      bloodPressure: '128/82',
      heartRate: 82,
      respiratoryRate: 18,
      temperature: 98.2,
      oxygenSaturation: 95,
      lastUpdated: '2023-04-05'
    },
    medications: [
      { 
        name: 'Albuterol', 
        dosage: '90mcg', 
        frequency: 'As needed', 
        startDate: '2021-01-15',
        adherence: 88 
      },
      { 
        name: 'Fluticasone', 
        dosage: '250mcg', 
        frequency: 'Twice daily', 
        startDate: '2021-01-15',
        adherence: 75 
      }
    ],
    labResults: [
      { 
        test: 'Spirometry FEV1', 
        value: '65', 
        unit: '%', 
        referenceRange: '>80', 
        date: '2023-03-15',
        status: 'abnormal' 
      }
    ],
    careGaps: [
      { 
        type: 'Vaccination',
        description: 'Flu shot needed',
        dueDate: '2023-09-30',
        priority: 'medium'
      }
    ],
    riskFactors: [
      { factor: 'COPD Exacerbation', level: 'medium', trend: 'stable' },
      { factor: 'Anxiety Management', level: 'medium', trend: 'improving' }
    ]
  },
  'mock-3': {
    id: 'mock-3',
    name: 'Robert Chen',
    age: 71,
    dob: '1953-08-10',
    gender: 'Male',
    contact: '(555) 345-6789',
    insurance: 'Medicare',
    primaryCondition: 'Heart Failure',
    conditions: ['Heart Failure', 'Hypertension'],
    lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    vitalSigns: {
      bloodPressure: '142/88',
      heartRate: 88,
      respiratoryRate: 20,
      temperature: 98.4,
      oxygenSaturation: 94,
      lastUpdated: '2023-03-29'
    },
    medications: [
      { 
        name: 'Carvedilol', 
        dosage: '25mg', 
        frequency: 'Twice daily', 
        startDate: '2022-06-01',
        adherence: 92 
      },
      { 
        name: 'Furosemide', 
        dosage: '40mg', 
        frequency: 'Once daily', 
        startDate: '2022-06-01',
        adherence: 85 
      }
    ],
    labResults: [
      { 
        test: 'BNP', 
        value: '850', 
        unit: 'pg/mL', 
        referenceRange: '<100', 
        date: '2023-03-29',
        status: 'abnormal' 
      },
      { 
        test: 'Creatinine', 
        value: '1.2', 
        unit: 'mg/dL', 
        referenceRange: '0.7-1.3', 
        date: '2023-03-29',
        status: 'normal' 
      }
    ],
    careGaps: [
      { 
        type: 'Monitoring',
        description: 'Due for echocardiogram',
        dueDate: '2023-04-30',
        priority: 'high'
      }
    ],
    riskFactors: [
      { factor: 'Heart Failure', level: 'high', trend: 'worsening' },
      { factor: 'Blood Pressure', level: 'medium', trend: 'stable' }
    ]
  },
  'mock-4': {
    id: 'mock-4',
    name: 'Sarah Johnson',
    age: 42,
    dob: '1982-11-30',
    gender: 'Female',
    contact: '(555) 456-7890',
    insurance: 'Aetna',
    primaryCondition: 'Asthma',
    conditions: ['Asthma', 'Allergies'],
    lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    vitalSigns: {
      bloodPressure: '118/75',
      heartRate: 72,
      respiratoryRate: 14,
      temperature: 98.2,
      oxygenSaturation: 99,
      lastUpdated: '2023-03-15'
    },
    medications: [
      { 
        name: 'Fluticasone/Salmeterol', 
        dosage: '250/50mcg', 
        frequency: 'Twice daily', 
        startDate: '2022-01-15',
        adherence: 95 
      },
      { 
        name: 'Montelukast', 
        dosage: '10mg', 
        frequency: 'Once daily', 
        startDate: '2022-01-15',
        adherence: 90 
      }
    ],
    labResults: [
      { 
        test: 'Peak Flow', 
        value: '450', 
        unit: 'L/min', 
        referenceRange: '>400', 
        date: '2023-03-15',
        status: 'normal' 
      }
    ],
    careGaps: [
      { 
        type: 'Follow-up',
        description: 'Annual asthma review',
        dueDate: '2023-06-15',
        priority: 'medium'
      }
    ],
    riskFactors: [
      { factor: 'Asthma Control', level: 'low', trend: 'improving' },
      { factor: 'Allergy Management', level: 'low', trend: 'stable' }
    ]
  }
}; 