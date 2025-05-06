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
import { addCondition, updateCondition } from '@/utils/storage';
import { toast } from '@/components/ui/sonner';

interface ConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  condition?: string;
  index?: number;
}

const ConditionModal: React.FC<ConditionModalProps> = ({
  isOpen,
  onClose,
  patientId,
  condition,
  index
}) => {
  const isEditing = condition !== undefined;
  const [conditionName, setConditionName] = useState(condition || '');

  const handleSubmit = () => {
    if (!conditionName.trim()) {
      toast.error('Condition name is required', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    let success;
    
    if (isEditing && typeof index === 'number') {
      success = updateCondition(patientId, index, conditionName.trim());
      if (success) {
        toast.success('Condition updated successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to update condition', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    } else {
      success = addCondition(patientId, conditionName.trim());
      if (success) {
        toast.success('Condition added successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to add condition', {
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
          <DialogTitle>{isEditing ? 'Edit Condition' : 'Add Condition'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update patient condition' : 'Add a new condition to the patient\'s record'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="condition-name">Condition Name</Label>
            <Input
              id="condition-name"
              value={conditionName}
              onChange={(e) => setConditionName(e.target.value)}
              placeholder="e.g., Type 2 Diabetes"
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

export default ConditionModal; 