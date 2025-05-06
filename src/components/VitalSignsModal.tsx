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
import { getPatientData, savePatientData } from '@/utils/storage';
import { toast } from '@/components/ui/sonner';

interface VitalSignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string | number;
    respiratoryRate?: string | number;
    temperature?: string | number;
    oxygenSaturation?: string | number;
    lastUpdated?: string;
  };
}

const VitalSignsModal: React.FC<VitalSignsModalProps> = ({
  isOpen,
  onClose,
  patientId,
  vitalSigns = {}
}) => {
  const [bloodPressure, setBloodPressure] = useState(vitalSigns.bloodPressure || '');
  const [heartRate, setHeartRate] = useState(vitalSigns.heartRate?.toString() || '');
  const [respiratoryRate, setRespiratoryRate] = useState(vitalSigns.respiratoryRate?.toString() || '');
  const [temperature, setTemperature] = useState(vitalSigns.temperature?.toString() || '');
  const [oxygenSaturation, setOxygenSaturation] = useState(vitalSigns.oxygenSaturation?.toString() || '');

  const handleSubmit = () => {
    // Get current patient data
    const patient = getPatientData(patientId);
    if (!patient) {
      toast.error('Failed to retrieve patient data', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    // Update vital signs
    const updatedVitalSigns = {
      bloodPressure: bloodPressure.trim(),
      heartRate: heartRate ? parseFloat(heartRate.trim()) : undefined,
      respiratoryRate: respiratoryRate ? parseFloat(respiratoryRate.trim()) : undefined,
      temperature: temperature ? parseFloat(temperature.trim()) : undefined,
      oxygenSaturation: oxygenSaturation ? parseFloat(oxygenSaturation.trim()) : undefined,
      lastUpdated: new Date().toISOString()
    };

    // Update patient data
    const updatedPatient = {
      ...patient,
      vitalSigns: updatedVitalSigns
    };

    // Save updated patient data
    savePatientData(updatedPatient);
    
    toast.success('Vital signs updated successfully', {
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
          <DialogTitle>Edit Vital Signs</DialogTitle>
          <DialogDescription>
            Update the patient's vital signs
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="blood-pressure">Blood Pressure</Label>
            <Input
              id="blood-pressure"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              placeholder="e.g., 120/80"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
              <Input
                id="heart-rate"
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="e.g., 75"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="respiratory-rate">Respiratory Rate (breaths/min)</Label>
              <Input
                id="respiratory-rate"
                type="number"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
                placeholder="e.g., 16"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g., 98.6"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="oxygen-saturation">O2 Saturation (%)</Label>
              <Input
                id="oxygen-saturation"
                type="number"
                value={oxygenSaturation}
                onChange={(e) => setOxygenSaturation(e.target.value)}
                placeholder="e.g., 98"
              />
            </div>
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

export default VitalSignsModal; 