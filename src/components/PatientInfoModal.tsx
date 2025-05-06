import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPatientData, savePatientData } from '@/utils/storage';
import { toast } from '@/components/ui/sonner';

interface PatientInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientInfo: {
    age?: number;
    dob?: string;
    gender?: string;
    contact?: string;
    insurance?: string;
  };
}

const PatientInfoModal: React.FC<PatientInfoModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientInfo
}) => {
  const [age, setAge] = useState(patientInfo.age?.toString() || '');
  const [dob, setDob] = useState(patientInfo.dob || '');
  const [gender, setGender] = useState(patientInfo.gender || '');
  const [contact, setContact] = useState(patientInfo.contact || '');
  const [insurance, setInsurance] = useState(patientInfo.insurance || '');

  const handleSubmit = () => {
    if (!age.trim() || !dob || !gender) {
      toast.error('Age, date of birth, and gender are required', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    // Get current patient data
    const patient = getPatientData(patientId);
    if (!patient) {
      toast.error('Failed to retrieve patient data', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    // Update patient data
    const updatedPatient = {
      ...patient,
      age: parseInt(age.trim()),
      dob,
      gender,
      contact: contact.trim(),
      insurance: insurance.trim()
    };

    // Save updated patient data
    savePatientData(updatedPatient);
    
    toast.success('Patient information updated successfully', {
      duration: 3000,
      position: 'bottom-right',
      className: 'bg-healable-primary text-white',
      icon: '✓'
    });
    
    // Call onClose to trigger the parent component to refresh data
    onClose();
    
    return true; // Return true to indicate success
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Patient Information</DialogTitle>
          <DialogDescription>
            Update the patient's basic information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient-age">Age</Label>
              <Input
                id="patient-age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 45"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patient-dob">Date of Birth</Label>
              <Input
                id="patient-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patient-gender">Gender</Label>
            <Select 
              value={gender} 
              onValueChange={(value) => setGender(value)}
            >
              <SelectTrigger id="patient-gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patient-contact">Contact</Label>
            <Input
              id="patient-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g., (555) 123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patient-insurance">Insurance</Label>
            <Input
              id="patient-insurance"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              placeholder="e.g., Blue Cross Blue Shield"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientInfoModal; 