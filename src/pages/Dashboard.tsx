
import React from 'react';
import { Button } from "@/components/ui/button";
import AppLayout from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedCard, AnimatedCardContent, AnimatedCardDescription, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { MotionWrapper } from '@/components/ui/motion-wrapper';
import { motion } from 'framer-motion';

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  riskLevel: 'low' | 'medium' | 'high';
  onClick: () => void;
  delay?: number;
}

const PatientCard: React.FC<PatientCardProps> = ({ 
  name, age, condition, lastVisit, riskLevel, onClick, delay = 0
}) => {
  const riskColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800'
  };
  
  return (
    <AnimatedCard 
      variant="hover" 
      className="overflow-hidden cursor-pointer" 
      onClick={onClick}
      delay={delay}
    >
      <AnimatedCardHeader className="p-4 pb-2">
        <AnimatedCardTitle className="text-lg">{name}</AnimatedCardTitle>
        <AnimatedCardDescription>Age {age} • {condition}</AnimatedCardDescription>
      </AnimatedCardHeader>
      <AnimatedCardContent className="p-4 pt-0">
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-muted-foreground">Last visit: {lastVisit}</span>
          <AnimatedBadge 
            animation={riskLevel === 'high' ? 'pulse' : 'none'} 
            className={`text-xs px-2 py-1 rounded-full font-medium ${riskColors[riskLevel]}`}
          >
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
          </AnimatedBadge>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  // Mock patient data
  const recentPatients = [
    { id: '1', name: 'James Wilson', age: 67, condition: 'Hypertension, Diabetes', lastVisit: '3 days ago', riskLevel: 'high' as const },
    { id: '2', name: 'Maria Garcia', age: 54, condition: 'COPD', lastVisit: '1 week ago', riskLevel: 'medium' as const },
    { id: '3', name: 'Robert Chen', age: 71, condition: 'Heart Failure', lastVisit: '2 weeks ago', riskLevel: 'high' as const },
    { id: '4', name: 'Sarah Johnson', age: 42, condition: 'Asthma', lastVisit: '1 month ago', riskLevel: 'low' as const },
  ];
  
  const handlePatientClick = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };
  
  return (
    <AppLayout title="Clinical Dashboard">
      <div className="space-y-6">
        <MotionWrapper variant="fadeUp">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-healable-secondary">
              Welcome, {userInfo?.name}
            </h2>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-healable-primary hover:bg-healable-secondary transition-colors">
                New Patient
              </Button>
            </motion.div>
          </div>
        </MotionWrapper>
        
        <MotionWrapper variant="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard delay={0.1}>
            <AnimatedCardHeader className="pb-2">
              <AnimatedCardTitle className="text-lg">Today's Appointments</AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <motion.div 
                className="text-3xl font-bold text-healable-primary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                6
              </motion.div>
              <p className="text-muted-foreground">2 with care gaps</p>
            </AnimatedCardContent>
          </AnimatedCard>
          
          <AnimatedCard delay={0.2}>
            <AnimatedCardHeader className="pb-2">
              <AnimatedCardTitle className="text-lg">Care Gap Alerts</AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <motion.div 
                className="text-3xl font-bold text-healable-warning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                12
              </motion.div>
              <p className="text-muted-foreground">5 high priority</p>
            </AnimatedCardContent>
          </AnimatedCard>
          
          <AnimatedCard delay={0.3}>
            <AnimatedCardHeader className="pb-2">
              <AnimatedCardTitle className="text-lg">Pending Actions</AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <motion.div 
                className="text-3xl font-bold text-healable-danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                8
              </motion.div>
              <p className="text-muted-foreground">3 medication reviews</p>
            </AnimatedCardContent>
          </AnimatedCard>
        </MotionWrapper>
        
        <MotionWrapper variant="fadeUp" delay={0.4}>
          <h2 className="text-xl font-semibold mb-4 text-healable-secondary">Recent Patients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPatients.map((patient, index) => (
              <PatientCard 
                key={patient.id}
                {...patient}
                onClick={() => handlePatientClick(patient.id)}
                delay={0.1 * index}
              />
            ))}
          </div>
        </MotionWrapper>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
