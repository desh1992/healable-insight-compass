// This is a mock service for demo purposes
import { PatientData } from '@/types/patient';
import { MOCK_PATIENTS } from '@/services/mockData';
import { getStoredPatients, setStoredPatients, addStoredPatient } from '@/utils/storage';

export const getPatient = async (patientId: string): Promise<PatientData | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // First check localStorage for real patient data
        const storedPatients = getStoredPatients();
        const storedPatient = storedPatients.find((p: PatientData) => p.id === patientId);
        
        if (storedPatient) {
          // Calculate age from DOB
          const dob = new Date(storedPatient.dob);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          
          resolve({
            ...storedPatient,
            age,
            lastVisit: new Date().toISOString(),
            vitalSigns: {
              ...storedPatient.vitalSigns,
              lastUpdated: new Date().toISOString()
            },
            riskFactors: Array.isArray(storedPatient.riskFactors) ? storedPatient.riskFactors : []
          });
        } else {
          // Fall back to mock data
          const mockPatient = MOCK_PATIENTS[patientId];
          if (mockPatient) {
            resolve({
              ...mockPatient,
              riskFactors: Array.isArray(mockPatient.riskFactors) ? mockPatient.riskFactors : []
            });
          } else {
            resolve(null);
          }
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        resolve(null);
      }
    }, 500);
  });
};

export const getAllPatients = async (): Promise<PatientData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Combine stored and mock patients
        const storedPatients = getStoredPatients();
        const allPatients = [...storedPatients, ...Object.values(MOCK_PATIENTS)];
        
        // Calculate age for all patients and ensure riskFactors is always an array
        const patientsWithAge = allPatients.map(patient => {
          const processedPatient = { ...patient };
          
          // Calculate age if not present
          if (!processedPatient.age && processedPatient.dob) {
            const dob = new Date(processedPatient.dob);
            const today = new Date();
            processedPatient.age = today.getFullYear() - dob.getFullYear();
          }
          
          // Ensure riskFactors is an array
          if (!Array.isArray(processedPatient.riskFactors)) {
            processedPatient.riskFactors = [];
          }
          
          return processedPatient;
        });
        
        resolve(patientsWithAge);
      } catch (error) {
        console.error('Error fetching patients:', error);
        resolve([]);
      }
    }, 500);
  });
};

export const addPatient = async (patientData: Omit<PatientData, 'id' | 'lastVisit'>): Promise<PatientData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Generate a unique ID
        const id = `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create the new patient object
        const newPatient: PatientData = {
          ...patientData,
          id,
          lastVisit: new Date().toISOString(),
        };
        
        // Add to localStorage
        addStoredPatient(newPatient);
        
        resolve(newPatient);
      } catch (error) {
        console.error('Error adding patient:', error);
        reject(new Error('Failed to add patient'));
      }
    }, 500);
  });
};
