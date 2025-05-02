import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UsagePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UsagePolicyModal: React.FC<UsagePolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-healable-secondary">Usage Policy</DialogTitle>
          <DialogDescription className="text-base">
            <div className="space-y-4 mt-4">
              <p>
                At Healable, we're redefining collaboration in healthcare by offering a unified platform 
                that caters to the needs of healthcare providers, healthcare seekers, and medical institutions. 
                Our mission is to streamline the exchange of knowledge, enhance professional development, and 
                strengthen community ties across the healthcare spectrum.
              </p>
              
              <p>
                Discover a world where communication is secure, learning is continuous, and partnerships thrive.
              </p>
              
              <p>
                Medical professionals from around the world can share experiences, discuss treatment options, 
                and collaborate on groundbreaking research. Our secure platform provisions to add and message 
                other doctors, creating a network of trusted colleagues who share a passion for healthcare.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UsagePolicyModal; 