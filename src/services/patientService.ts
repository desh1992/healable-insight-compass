// This is a mock service for demo purposes
import { PatientData } from '@/types/patient';
import { MOCK_PATIENTS } from '@/services/mockData';
import { getPatientData, savePatientData } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/storage';

export const getPatient = async (patientId: string): Promise<PatientData | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Use the patientData utility function that checks localStorage
        const patient = getPatientData(patientId);
        
        if (patient) {
          // Calculate age from DOB if needed
          if (!patient.age && patient.dob) {
            const dob = new Date(patient.dob);
            const today = new Date();
            patient.age = today.getFullYear() - dob.getFullYear();
            
            // Save the updated patient with age
            savePatientData(patient);
          }
          
          // Ensure all collections are arrays
          if (!Array.isArray(patient.riskFactors)) patient.riskFactors = [];
          if (!Array.isArray(patient.medications)) patient.medications = [];
          if (!Array.isArray(patient.labResults)) patient.labResults = [];
          if (!Array.isArray(patient.careGaps)) patient.careGaps = [];
          if (!Array.isArray(patient.conditions)) patient.conditions = [];
          
          resolve(patient);
        } else {
          console.log(`Patient with ID ${patientId} not found`);
          resolve(null);
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
        // Get all patients from localStorage
        const storedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
        if (!storedPatients) {
          console.log('No patients found in storage');
          resolve([]);
          return;
        }
        
        const patients = JSON.parse(storedPatients);
        const patientArray = Object.values(patients) as PatientData[];
        
        // Process each patient to ensure data consistency
        const processedPatients = patientArray.map(patient => {
          // Create a deep copy to avoid reference issues
          const processedPatient = { ...patient };
          
          // Calculate age if needed
          if (!processedPatient.age && processedPatient.dob) {
            const dob = new Date(processedPatient.dob);
            const today = new Date();
            processedPatient.age = today.getFullYear() - dob.getFullYear();
          }
          
          // Ensure all collections are arrays
          if (!Array.isArray(processedPatient.riskFactors)) processedPatient.riskFactors = [];
          if (!Array.isArray(processedPatient.medications)) processedPatient.medications = [];
          if (!Array.isArray(processedPatient.labResults)) processedPatient.labResults = [];
          if (!Array.isArray(processedPatient.careGaps)) processedPatient.careGaps = [];
          if (!Array.isArray(processedPatient.conditions)) processedPatient.conditions = [];
          
          return processedPatient;
        });
        
        resolve(processedPatients);
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
        
        // Add to localStorage using the storage utility function
        savePatientData(newPatient);
        
        resolve(newPatient);
      } catch (error) {
        console.error('Error adding patient:', error);
        reject(new Error('Failed to add patient'));
      }
    }, 500);
  });
};
