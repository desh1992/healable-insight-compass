import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import HealableLogo from '@/components/HealableLogo';
import { toast } from '@/components/ui/sonner';
import UsagePolicyModal from '@/components/UsagePolicyModal';

const EthicsAgreement: React.FC = () => {
  const navigate = useNavigate();
  const { setHasAgreedToEthics, logout } = useAuth();
  const [hasAgreed, setHasAgreed] = React.useState(false);
  const [isUsagePolicyOpen, setIsUsagePolicyOpen] = React.useState(false);

  const handleAgree = () => {
    setHasAgreedToEthics(true);
    navigate('/dashboard');
  };

  const handleDecline = () => {
    toast.error("You must agree to the confidentiality terms to proceed.");
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-healable-light/30">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-6">
          <HealableLogo size="md" />
        </div>
        
        <Card className="shadow-lg animate-slide-up border-healable-light">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-2xl text-healable-secondary">Ethics & Confidentiality Agreement</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg font-medium mb-4">
                By proceeding, I acknowledge that:
              </p>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  The data surfaced through this platform is intended <strong>strictly for clinical decision support</strong>. 
                </p>
                
                <p>
                  I understand that the insights provided are evidence-based, cite-backed, and generated to 
                  <strong> enhance—not replace—my professional medical judgment</strong>.
                </p>
                
                <p>
                  I acknowledge my responsibility to maintain strict confidentiality of all patient information in accordance with 
                  <strong> HIPAA (Health Insurance Portability and Accountability Act)</strong> regulations and other applicable 
                  healthcare privacy laws. This includes protecting all patient data from unauthorized access, use, or disclosure.
                </p>

                <p>
                  I understand that any breach of confidentiality or unauthorized use of this system may result in disciplinary action, 
                  termination of access privileges, and potential legal consequences under HIPAA regulations.
                </p>
                
                <div className="bg-healable-accent/20 p-4 rounded-md border border-healable-accent/30 mt-6">
                  <p className="font-semibold text-healable-secondary">
                    We'll keep a record of your agreement to protect everyone involved. By clicking "I Agree & Acknowledge", 
                    you're adding your digital signature to this commitment.
                  </p>
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox 
                    id="agreement" 
                    checked={hasAgreed}
                    onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                  />
                  <label
                    htmlFor="agreement"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and agree to the ethics and confidentiality terms
                  </label>
                </div>

                <div className="text-sm text-gray-600 mt-6">
                  By agreeing, you also confirm that you have read and understood our{' '}
                  <a 
                    href="https://www.healable.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-healable-primary hover:text-healable-secondary underline"
                  >
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <button
                    onClick={() => setIsUsagePolicyOpen(true)}
                    className="text-healable-primary hover:text-healable-secondary underline"
                  >
                    Usage Policy
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4 bg-gray-50">
            <Button variant="outline" onClick={handleDecline}>
              Decline
            </Button>
            <Button 
              className="bg-healable-primary hover:bg-healable-secondary transition-colors"
              onClick={handleAgree}
              disabled={!hasAgreed}
            >
              I Agree & Acknowledge
            </Button>
          </CardFooter>
        </Card>
      </div>
      <UsagePolicyModal 
        isOpen={isUsagePolicyOpen}
        onClose={() => setIsUsagePolicyOpen(false)}
      />
    </div>
  );
};

export default EthicsAgreement;
