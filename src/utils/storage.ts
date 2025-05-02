import { Note, LiveNote } from '@/types/notes';

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