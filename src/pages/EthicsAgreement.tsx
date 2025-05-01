
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import HealableLogo from '@/components/HealableLogo';

const EthicsAgreement: React.FC = () => {
  const navigate = useNavigate();
  const { agreeToEthics } = useAuth();
  
  const handleAgree = () => {
    agreeToEthics();
    navigate('/dashboard');
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
                  I accept responsibility for ensuring confidentiality and appropriate use of this information 
                  in accordance with regulatory and ethical healthcare standards.
                </p>
                
                <div className="bg-healable-accent/20 p-4 rounded-md border border-healable-accent/30 mt-6">
                  <p className="font-semibold text-healable-secondary">
                    This agreement is recorded and timestamped in accordance with HIPAA compliance requirements and institutional policies.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4 bg-gray-50">
            <Button variant="outline" onClick={() => window.history.back()}>
              Decline
            </Button>
            <Button 
              className="bg-healable-primary hover:bg-healable-secondary transition-colors"
              onClick={handleAgree}
            >
              I Agree & Acknowledge
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EthicsAgreement;
