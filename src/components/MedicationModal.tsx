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
import { Slider } from "@/components/ui/slider";
import { addMedication, updateMedication } from '@/utils/storage';
import { toast } from '@/components/ui/sonner';

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  medication?: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    adherence?: number;
  };
  index?: number;
}

const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  patientId,
  medication,
  index
}) => {
  const isEditing = !!medication;
  
  const [name, setName] = useState(medication?.name || '');
  const [dosage, setDosage] = useState(medication?.dosage || '');
  const [frequency, setFrequency] = useState(medication?.frequency || '');
  const [startDate, setStartDate] = useState(medication?.startDate || new Date().toISOString().split('T')[0]);
  const [adherence, setAdherence] = useState(medication?.adherence || 100);

  const handleSubmit = () => {
    // Validate inputs
    if (!name.trim() || !dosage.trim() || !frequency.trim() || !startDate) {
      toast.error('All fields are required', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    const medicationData = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      startDate,
      adherence
    };

    let success;
    
    if (isEditing && typeof index === 'number') {
      success = updateMedication(patientId, index, medicationData);
      if (success) {
        toast.success('Medication updated successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to update medication', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    } else {
      success = addMedication(patientId, medicationData);
      if (success) {
        toast.success('Medication added successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to add medication', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    }

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update medication details' : 'Add a new medication to the patient\'s record'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="medication-name">Medication Name</Label>
            <Input
              id="medication-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Metformin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medication-dosage">Dosage</Label>
            <Input
              id="medication-dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 500mg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medication-frequency">Frequency</Label>
            <Input
              id="medication-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g., Twice daily"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medication-start-date">Start Date</Label>
            <Input
              id="medication-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="medication-adherence">Adherence ({adherence}%)</Label>
            </div>
            <Slider
              id="medication-adherence"
              min={0}
              max={100}
              step={1}
              value={[adherence]}
              onValueChange={(value) => setAdherence(value[0])}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEditing ? 'Update' : 'Add'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationModal; 