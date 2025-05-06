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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addCareGap, updateCareGap } from '@/utils/storage';
import { toast } from '@/components/ui/sonner';

interface CareGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  careGap?: {
    type: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  };
  index?: number;
}

const CareGapModal: React.FC<CareGapModalProps> = ({
  isOpen,
  onClose,
  patientId,
  careGap,
  index
}) => {
  const isEditing = !!careGap;
  
  const [type, setType] = useState(careGap?.type || '');
  const [description, setDescription] = useState(careGap?.description || '');
  const [dueDate, setDueDate] = useState(careGap?.dueDate || new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(careGap?.priority || 'medium');

  const handleSubmit = () => {
    // Validate inputs
    if (!type.trim() || !description.trim() || !dueDate) {
      toast.error('All fields are required', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    const careGapData = {
      type: type.trim(),
      description: description.trim(),
      dueDate,
      priority
    };

    let success;
    
    if (isEditing && typeof index === 'number') {
      success = updateCareGap(patientId, index, careGapData);
      if (success) {
        toast.success('Care gap updated successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to update care gap', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    } else {
      success = addCareGap(patientId, careGapData);
      if (success) {
        toast.success('Care gap added successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to add care gap', {
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
          <DialogTitle>{isEditing ? 'Edit Care Gap' : 'Add Care Gap'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update care gap details' : 'Add a new care gap to the patient\'s record'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="care-gap-type">Type</Label>
            <Input
              id="care-gap-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., Screening, Immunization"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="care-gap-description">Description</Label>
            <Textarea
              id="care-gap-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Overdue for annual eye exam"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="care-gap-due-date">Due Date</Label>
            <Input
              id="care-gap-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="care-gap-priority">Priority</Label>
            <Select 
              value={priority} 
              onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}
            >
              <SelectTrigger id="care-gap-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
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

export default CareGapModal; 