import { Note, LiveNote } from '@/types/notes';
import { PatientData } from '@/types/patient';
import { MOCK_PATIENTS } from '@/services/mockData';

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_INFO: 'user_info',
  PATIENTS: 'patients',
  ETHICS_AGREED: 'ethics_agreed',
  NOTES: 'patient_notes',
  LIVE_NOTES: 'live_notes'
} as const;

export interface StoredUserInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  access_token: string;
  token_type: string;
}

// Auth Storage
export const setAccessToken = (token: string) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const setUserInfo = (userInfo: StoredUserInfo) => {
  localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
};

export const getUserInfo = (): StoredUserInfo | null => {
  const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  return userInfo ? JSON.parse(userInfo) : null;
};

// Patient Storage
export const getStoredPatients = () => {
  const patients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  return patients ? JSON.parse(patients) : [];
};

export const setStoredPatients = (patients: any[]) => {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
};

export const addStoredPatient = (patient: any) => {
  const patients = getStoredPatients();
  patients.push(patient);
  setStoredPatients(patients);
};

// Ethics Agreement Storage
export const setEthicsAgreed = (agreed: boolean) => {
  localStorage.setItem(STORAGE_KEYS.ETHICS_AGREED, String(agreed));
};

export const getEthicsAgreed = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ETHICS_AGREED) === 'true';
};

// Clear Storage
export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  localStorage.removeItem(STORAGE_KEYS.ETHICS_AGREED);
  // Clear any other user-related items that might exist
  localStorage.removeItem('user');
  localStorage.removeItem('user_company');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_name');
  localStorage.removeItem('auth_token');
};

export const clearAllStorage = () => {
  localStorage.clear();
};

// Notes Storage
export const getNotes = (patientId: string): Note[] => {
  const allNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
  if (!allNotes) return [];
  const notes = JSON.parse(allNotes);
  return notes[patientId] || [];
};

export const saveNote = (note: Note) => {
  const allNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
  const notes = allNotes ? JSON.parse(allNotes) : {};
  
  if (!notes[note.patientId]) {
    notes[note.patientId] = [];
  }
  
  notes[note.patientId].push(note);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
};

// New functions for notes
export const updateNote = (updatedNote: Note) => {
  const allNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
  if (!allNotes) return false;
  
  const notes = JSON.parse(allNotes);
  if (!notes[updatedNote.patientId]) return false;
  
  const noteIndex = notes[updatedNote.patientId].findIndex((note: Note) => note.id === updatedNote.id);
  if (noteIndex === -1) return false;
  
  notes[updatedNote.patientId][noteIndex] = updatedNote;
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  return true;
};

export const deleteNote = (patientId: string, noteId: string) => {
  const allNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
  if (!allNotes) return false;
  
  const notes = JSON.parse(allNotes);
  if (!notes[patientId]) return false;
  
  notes[patientId] = notes[patientId].filter((note: Note) => note.id !== noteId);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  return true;
};

// Initialize Mock Data - Call this on app start
export const initializeMockData = () => {
  console.log('Initializing mock data in localStorage');
  
  // Initialize patients data if not already present
  const storedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  if (!storedPatients || storedPatients === '{}' || !Object.keys(JSON.parse(storedPatients || '{}')).length) {
    // Create multiple dummy patients regardless of MOCK_PATIENTS content
    const dummyPatients = createDummyPatients();
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(dummyPatients));
    console.log('Multiple dummy patients created and stored in localStorage');
  } else {
    console.log('Patients data already exists in localStorage');
  }
  
  // Initialize notes data if not already present
  const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
  if (!storedNotes || storedNotes === '{}') {
    // Get all patients from localStorage
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '{}');
    
    // Creating initial notes for each patient
    const initialNotes = {};
    Object.keys(patients).forEach(patientId => {
      initialNotes[patientId] = generateNotesForPatient(patients[patientId]);
    });
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(initialNotes));
    console.log('Mock notes data initialized successfully');
  }
  
  // Log the current state of the data to help with debugging
  logCurrentData();
  
  return true;
};

// Function to create multiple dummy patients for testing
const createDummyPatients = () => {
  const dummyPatients = {};
  
  // Patient 1 - Hypertension/Diabetes
  dummyPatients['dummy-1'] = {
    id: 'dummy-1',
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
      lastUpdated: new Date().toISOString()
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
  };
  
  // Patient 2 - COPD
  dummyPatients['dummy-2'] = {
    id: 'dummy-2',
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
      lastUpdated: new Date().toISOString()
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
  };
  
  // Patient 3 - Heart Failure
  dummyPatients['dummy-3'] = {
    id: 'dummy-3',
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
      lastUpdated: new Date().toISOString()
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
  };
  
  // Patient 4 - Asthma
  dummyPatients['dummy-4'] = {
    id: 'dummy-4',
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
      lastUpdated: new Date().toISOString()
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
        value: '410', 
        unit: 'L/min', 
        referenceRange: '>380', 
        date: '2023-03-15',
        status: 'normal' 
      }
    ],
    careGaps: [
      { 
        type: 'Follow-up',
        description: 'Annual asthma management review',
        dueDate: '2023-07-15',
        priority: 'medium'
      }
    ],
    riskFactors: [
      { factor: 'Asthma Exacerbation', level: 'low', trend: 'improving' },
      { factor: 'Allergic Reaction', level: 'medium', trend: 'seasonal' }
    ]
  };

  return dummyPatients;
};

// Generate realistic notes for a patient
const generateNotesForPatient = (patient) => {
  const notes = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  // Initial consultation note (oldest)
  notes.push({
    id: `note-${now}-1`,
    patientId: patient.id,
    content: `Initial consultation for ${patient.name}. Patient presents with ${patient.primaryCondition}. Medical history includes ${patient.conditions.join(', ')}. Started initial treatment plan and ordered baseline lab tests.`,
    timestamp: new Date(now - 90 * day).toISOString(), // 90 days ago
    type: 'manual'
  });
  
  // Follow-up note
  notes.push({
    id: `note-${now}-2`,
    patientId: patient.id,
    content: `Follow-up visit with ${patient.name}. Reviewed lab results and adjusted medications. Patient reports ${patient.primaryCondition} symptoms have ${Math.random() > 0.5 ? 'improved' : 'remained stable'}.`,
    timestamp: new Date(now - 60 * day).toISOString(), // 60 days ago
    type: 'manual'
  });
  
  // Recent note
  notes.push({
    id: `note-${now}-3`,
    patientId: patient.id,
    content: `${patient.name} came in for regular check-up. Vital signs: BP ${patient.vitalSigns?.bloodPressure || 'WNL'}, HR ${patient.vitalSigns?.heartRate || 'WNL'}. Discussed management of ${patient.primaryCondition} and addressed concerns about ${patient.medications?.[0]?.name || 'current medications'}.`,
    timestamp: new Date(now - 30 * day).toISOString(), // 30 days ago
    type: 'manual'
  });
  
  // AI generated note (most recent)
  notes.push({
    id: `note-${now}-4`,
    patientId: patient.id,
    content: `ASSESSMENT & PLAN:\n\n1. ${patient.primaryCondition.toUpperCase()}: ${patient.primaryCondition === 'Hypertension' ? 'BP elevated at ' + patient.vitalSigns?.bloodPressure : 'Currently ' + (Math.random() > 0.5 ? 'stable' : 'requiring adjustment')}. Continue ${patient.medications?.[0]?.name || 'current medication regimen'}.\n\n2. ${patient.conditions?.[1]?.toUpperCase() || 'SECONDARY CONDITION'}: Monitor and follow up in 3 months.\n\n3. PREVENTATIVE CARE: Due for ${patient.careGaps?.[0]?.description?.toLowerCase() || 'routine screenings'}.`,
    timestamp: new Date(now - 7 * day).toISOString(), // 7 days ago
    type: 'ai_generated'
  });
  
  return notes;
};

// Helper function to log current localStorage data for debugging
const logCurrentData = () => {
  try {
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '{}');
    const patientIds = Object.keys(patients);
    console.log(`Current patients in localStorage: ${patientIds.length} patients`);
    console.log('Patient IDs:', patientIds);
    
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '{}');
    const notePatientIds = Object.keys(notes);
    console.log(`Notes available for ${notePatientIds.length} patients`);
  } catch (error) {
    console.error('Error logging current data:', error);
  }
};

// Patient data management
export const getPatientData = (patientId: string): PatientData | null => {
  // Make sure we have mock data initialized
  const storedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  if (!storedPatients) {
    console.log('No patients found in storage, initializing mock data');
    initializeMockData();
    // Retry after initialization
    return getPatientData(patientId);
  }
  
  try {
    const patients = JSON.parse(storedPatients);
    const patient = patients[patientId];
    if (!patient) {
      console.log(`Patient with ID ${patientId} not found. Available IDs: ${Object.keys(patients).join(', ')}`);
      return null;
    }
    return patient;
  } catch (error) {
    console.error('Error parsing patient data:', error);
    return null;
  }
};

export const savePatientData = (patient: PatientData) => {
  if (!patient || !patient.id) {
    console.error('Cannot save patient: Invalid patient data or missing ID');
    return false;
  }

  try {
    const storedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    const patients = storedPatients ? JSON.parse(storedPatients) : {};
    
    patients[patient.id] = patient;
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    console.log(`Patient data saved successfully for ID: ${patient.id}`);
    return true;
  } catch (error) {
    console.error('Error saving patient data:', error);
    return false;
  }
};

// Add, update, delete for medications
export const addMedication = (patientId: string, medication: PatientData['medications'][0]) => {
  const patient = getPatientData(patientId);
  if (!patient) return false;
  
  if (!patient.medications) {
    patient.medications = [];
  }
  
  patient.medications.push(medication);
  savePatientData(patient);
  return true;
};

export const updateMedication = (patientId: string, index: number, medication: PatientData['medications'][0]) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.medications || index >= patient.medications.length) return false;
  
  patient.medications[index] = medication;
  savePatientData(patient);
  return true;
};

export const deleteMedication = (patientId: string, index: number) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.medications || index >= patient.medications.length) return false;
  
  patient.medications.splice(index, 1);
  savePatientData(patient);
  return true;
};

// Add, update, delete for lab results
export const addLabResult = (patientId: string, labResult: PatientData['labResults'][0]) => {
  const patient = getPatientData(patientId);
  if (!patient) return false;
  
  if (!patient.labResults) {
    patient.labResults = [];
  }
  
  patient.labResults.push(labResult);
  savePatientData(patient);
  return true;
};

export const updateLabResult = (patientId: string, index: number, labResult: PatientData['labResults'][0]) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.labResults || index >= patient.labResults.length) return false;
  
  patient.labResults[index] = labResult;
  savePatientData(patient);
  return true;
};

export const deleteLabResult = (patientId: string, index: number) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.labResults || index >= patient.labResults.length) return false;
  
  patient.labResults.splice(index, 1);
  savePatientData(patient);
  return true;
};

// Add, update, delete for care gaps
export const addCareGap = (patientId: string, careGap: PatientData['careGaps'][0]) => {
  const patient = getPatientData(patientId);
  if (!patient) return false;
  
  if (!patient.careGaps) {
    patient.careGaps = [];
  }
  
  patient.careGaps.push(careGap);
  savePatientData(patient);
  return true;
};

export const updateCareGap = (patientId: string, index: number, careGap: PatientData['careGaps'][0]) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.careGaps || index >= patient.careGaps.length) return false;
  
  patient.careGaps[index] = careGap;
  savePatientData(patient);
  return true;
};

export const deleteCareGap = (patientId: string, index: number) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.careGaps || index >= patient.careGaps.length) return false;
  
  patient.careGaps.splice(index, 1);
  savePatientData(patient);
  return true;
};

// Add, update, delete for conditions (Patient Summary)
export const addCondition = (patientId: string, condition: string) => {
  const patient = getPatientData(patientId);
  if (!patient) return false;
  
  if (!patient.conditions) {
    patient.conditions = [];
  }
  
  patient.conditions.push(condition);
  savePatientData(patient);
  return true;
};

export const updateCondition = (patientId: string, index: number, condition: string) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.conditions || index >= patient.conditions.length) return false;
  
  patient.conditions[index] = condition;
  savePatientData(patient);
  return true;
};

export const deleteCondition = (patientId: string, index: number) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.conditions || index >= patient.conditions.length) return false;
  
  patient.conditions.splice(index, 1);
  savePatientData(patient);
  return true;
};

// Add, update, delete for risk factors (Patient Summary)
export const addRiskFactor = (patientId: string, riskFactor: PatientData['riskFactors'][0]) => {
  const patient = getPatientData(patientId);
  if (!patient) return false;
  
  if (!patient.riskFactors) {
    patient.riskFactors = [];
  }
  
  patient.riskFactors.push(riskFactor);
  savePatientData(patient);
  return true;
};

export const updateRiskFactor = (patientId: string, index: number, riskFactor: PatientData['riskFactors'][0]) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.riskFactors || index >= patient.riskFactors.length) return false;
  
  patient.riskFactors[index] = riskFactor;
  savePatientData(patient);
  return true;
};

export const deleteRiskFactor = (patientId: string, index: number) => {
  const patient = getPatientData(patientId);
  if (!patient || !patient.riskFactors || index >= patient.riskFactors.length) return false;
  
  patient.riskFactors.splice(index, 1);
  savePatientData(patient);
  return true;
};

export const getLiveNotes = (patientId: string): LiveNote[] => {
  const allLiveNotes = localStorage.getItem(STORAGE_KEYS.LIVE_NOTES);
  if (!allLiveNotes) return [];
  const notes = JSON.parse(allLiveNotes);
  return notes[patientId] || [];
};

export const saveLiveNote = (note: LiveNote) => {
  const allLiveNotes = localStorage.getItem(STORAGE_KEYS.LIVE_NOTES);
  const notes = allLiveNotes ? JSON.parse(allLiveNotes) : {};
  
  if (!notes[note.patientId]) {
    notes[note.patientId] = [];
  }
  
  notes[note.patientId].push(note);
  localStorage.setItem(STORAGE_KEYS.LIVE_NOTES, JSON.stringify(notes));
};

// Clear patient information fields
export const clearPatientInfoField = (patientId: string, field: 'contact' | 'insurance') => {
  try {
    console.log(`Clearing patient field: ${field} for patient ID: ${patientId}`);
    const patient = getPatientData(patientId);
    if (!patient) {
      console.error('Cannot clear field: Patient not found');
      return false;
    }
    
    // Create a new patient object to avoid reference issues
    const updatedPatient = {...patient};
    
    if (field === 'contact') {
      updatedPatient.contact = '';
    } else if (field === 'insurance') {
      updatedPatient.insurance = '';
    }
    
    return savePatientData(updatedPatient);
  } catch (error) {
    console.error(`Error clearing patient ${field}:`, error);
    return false;
  }
};

// Clear vital signs
export const clearVitalSign = (patientId: string, field: 'bloodPressure' | 'heartRate' | 'respiratoryRate' | 'temperature' | 'oxygenSaturation') => {
  try {
    console.log(`Clearing vital sign: ${field} for patient ID: ${patientId}`);
    const patient = getPatientData(patientId);
    if (!patient) {
      console.error('Cannot clear vital sign: Patient not found');
      return false;
    }
    
    // Create a new patient object with a fresh vitalSigns object to avoid reference issues
    const updatedPatient = {
      ...patient,
      vitalSigns: patient.vitalSigns ? {...patient.vitalSigns} : {
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Delete the specific vital sign if vitalSigns exists
    if (updatedPatient.vitalSigns) {
      delete (updatedPatient.vitalSigns as any)[field];
      updatedPatient.vitalSigns.lastUpdated = new Date().toISOString();
    }
    
    return savePatientData(updatedPatient);
  } catch (error) {
    console.error(`Error clearing vital sign ${field}:`, error);
    return false;
  }
};

// Clear all vital signs
export const clearAllVitalSigns = (patientId: string) => {
  try {
    console.log(`Clearing all vital signs for patient ID: ${patientId}`);
    const patient = getPatientData(patientId);
    if (!patient) {
      console.error('Cannot clear vital signs: Patient not found');
      return false;
    }
    
    // Create a new patient object to avoid reference issues
    const updatedPatient = {
      ...patient,
      vitalSigns: {
        lastUpdated: new Date().toISOString()
      }
    };
    
    return savePatientData(updatedPatient);
  } catch (error) {
    console.error('Error clearing all vital signs:', error);
    return false;
  }
}; 