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
import { addLabResult, updateLabResult } from '@/utils/storage';
import { toast } from '@/components/ui/sonner';

interface LabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  labResult?: {
    test: string;
    value: string;
    unit: string;
    referenceRange: string;
    date: string;
    status: 'normal' | 'abnormal' | 'critical';
  };
  index?: number;
}

const LabResultModal: React.FC<LabResultModalProps> = ({
  isOpen,
  onClose,
  patientId,
  labResult,
  index
}) => {
  const isEditing = !!labResult;
  
  const [test, setTest] = useState(labResult?.test || '');
  const [value, setValue] = useState(labResult?.value || '');
  const [unit, setUnit] = useState(labResult?.unit || '');
  const [referenceRange, setReferenceRange] = useState(labResult?.referenceRange || '');
  const [date, setDate] = useState(labResult?.date || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'normal' | 'abnormal' | 'critical'>(labResult?.status || 'normal');

  const handleSubmit = () => {
    // Validate inputs
    if (!test.trim() || !value.trim() || !unit.trim() || !referenceRange.trim() || !date) {
      toast.error('All fields are required', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    const labResultData = {
      test: test.trim(),
      value: value.trim(),
      unit: unit.trim(),
      referenceRange: referenceRange.trim(),
      date,
      status
    };

    let success;
    
    if (isEditing && typeof index === 'number') {
      success = updateLabResult(patientId, index, labResultData);
      if (success) {
        toast.success('Lab result updated successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to update lab result', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    } else {
      success = addLabResult(patientId, labResultData);
      if (success) {
        toast.success('Lab result added successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to add lab result', {
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
          <DialogTitle>{isEditing ? 'Edit Lab Result' : 'Add Lab Result'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update lab result details' : 'Add a new lab result to the patient\'s record'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lab-test">Test Name</Label>
            <Input
              id="lab-test"
              value={test}
              onChange={(e) => setTest(e.target.value)}
              placeholder="e.g., A1C"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lab-value">Value</Label>
              <Input
                id="lab-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g., 7.2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lab-unit">Unit</Label>
              <Input
                id="lab-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., %"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lab-range">Reference Range</Label>
            <Input
              id="lab-range"
              value={referenceRange}
              onChange={(e) => setReferenceRange(e.target.value)}
              placeholder="e.g., 4.0-5.6"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lab-date">Test Date</Label>
            <Input
              id="lab-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lab-status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value: 'normal' | 'abnormal' | 'critical') => setStatus(value)}
            >
              <SelectTrigger id="lab-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="abnormal">Abnormal</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
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

export default LabResultModal; 