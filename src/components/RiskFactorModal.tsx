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
import { addRiskFactor, updateRiskFactor } from '@/utils/storage';
import { toast } from '@/components/ui/sonner';

interface RiskFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  riskFactor?: {
    factor: string;
    level: 'low' | 'medium' | 'high';
    trend: 'improving' | 'stable' | 'worsening';
  };
  index?: number;
}

const RiskFactorModal: React.FC<RiskFactorModalProps> = ({
  isOpen,
  onClose,
  patientId,
  riskFactor,
  index
}) => {
  const isEditing = !!riskFactor;
  
  const [factor, setFactor] = useState(riskFactor?.factor || '');
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>(riskFactor?.level || 'medium');
  const [trend, setTrend] = useState<'improving' | 'stable' | 'worsening'>(riskFactor?.trend || 'stable');

  const handleSubmit = () => {
    if (!factor.trim()) {
      toast.error('Risk factor name is required', {
        duration: 3000,
        position: 'bottom-right'
      });
      return;
    }

    const riskFactorData = {
      factor: factor.trim(),
      level,
      trend
    };

    let success;
    
    if (isEditing && typeof index === 'number') {
      success = updateRiskFactor(patientId, index, riskFactorData);
      if (success) {
        toast.success('Risk factor updated successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to update risk factor', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    } else {
      success = addRiskFactor(patientId, riskFactorData);
      if (success) {
        toast.success('Risk factor added successfully', {
          duration: 3000,
          position: 'bottom-right',
          className: 'bg-healable-primary text-white',
          icon: '✓'
        });
      } else {
        toast.error('Failed to add risk factor', {
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
          <DialogTitle>{isEditing ? 'Edit Risk Factor' : 'Add Risk Factor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update risk factor details' : 'Add a new risk factor to the patient\'s record'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="risk-factor-name">Factor Name</Label>
            <Input
              id="risk-factor-name"
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
              placeholder="e.g., Cardiovascular Risk"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="risk-factor-level">Level</Label>
            <Select 
              value={level} 
              onValueChange={(value: 'low' | 'medium' | 'high') => setLevel(value)}
            >
              <SelectTrigger id="risk-factor-level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="risk-factor-trend">Trend</Label>
            <Select 
              value={trend} 
              onValueChange={(value: 'improving' | 'stable' | 'worsening') => setTrend(value)}
            >
              <SelectTrigger id="risk-factor-trend">
                <SelectValue placeholder="Select trend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="improving">Improving</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="worsening">Worsening</SelectItem>
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

export default RiskFactorModal; 