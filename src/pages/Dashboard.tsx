import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import AppLayout from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedCard, AnimatedCardContent, AnimatedCardDescription, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { MotionWrapper } from '@/components/ui/motion-wrapper';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { getAllPatients } from '@/services/patientService';
import { PatientData } from '@/types/patient';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from '@/utils/dateFormat';
import { Badge } from "@/components/ui/badge";

interface PatientCardProps {
  name: string;
  age?: number;
  primaryCondition?: string;
  conditions?: string[];
  lastVisit: string;
  riskFactors?: Array<{ level: 'low' | 'medium' | 'high'; factor: string; trend?: 'improving' | 'stable' | 'worsening' }>;
  onClick: () => void;
  delay?: number;
}

const PatientCard: React.FC<PatientCardProps> = ({ 
  name, 
  age, 
  primaryCondition,
  conditions,
  lastVisit, 
  riskFactors = [],
  onClick, 
  delay = 0 
}) => {
  const getRiskBadgeStyle = () => {
    if (!Array.isArray(riskFactors) || riskFactors.length === 0) {
      return 'bg-gray-100 text-gray-800';
    }
    
    if (riskFactors.some(r => r.level === 'high')) {
      return 'bg-red-100 text-red-800';
    }
    if (riskFactors.some(r => r.level === 'medium')) {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getRiskLevel = () => {
    if (!Array.isArray(riskFactors) || riskFactors.length === 0) return 'Low Risk';
    
    if (riskFactors.some(r => r.level === 'high')) return 'High Risk';
    if (riskFactors.some(r => r.level === 'medium')) return 'Medium Risk';
    return 'Low Risk';
  };

  const condition = primaryCondition || conditions?.[0] || 'No condition listed';
  
  return (
    <Link to={`/patient/${name.replace(/\s+/g, '-').toLowerCase()}`} className="block">
      <Card className="hover:bg-gray-50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{name}</h3>
              <p className="text-sm text-muted-foreground">
                Age {age} • {condition}
              </p>
            </div>
            <Badge className={getRiskBadgeStyle()}>
              {getRiskLevel()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const allPatients = await getAllPatients();
        setPatients(allPatients);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePatientClick = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const getRiskLevelColor = (riskFactors?: Array<{ level: string }>) => {
    if (!riskFactors || !Array.isArray(riskFactors) || riskFactors.length === 0) {
      return 'text-gray-600 bg-gray-50';
    }
    
    const highRisk = riskFactors.some(r => r.level === 'high');
    const mediumRisk = riskFactors.some(r => r.level === 'medium');
    
    if (highRisk) return 'text-red-600 bg-red-50';
    if (mediumRisk) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskLevel = (riskFactors: Array<{ level: string }> = []) => {
    if (!Array.isArray(riskFactors)) return 'Low Risk';
    
    if (riskFactors.some(risk => risk.level === 'high')) {
      return 'High Risk';
    }
    if (riskFactors.some(risk => risk.level === 'medium')) {
      return 'Medium Risk';
    }
    return 'Low Risk';
  };

  if (isLoading) {
    return (
      <AppLayout title="Clinical Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healable-primary mx-auto"></div>
            <p className="mt-4 text-healable-secondary">Loading patients...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPatients.map((patient, index) => (
              <PatientCard 
                key={patient.id}
                name={patient.name}
                age={patient.age}
                primaryCondition={patient.primaryCondition}
                conditions={patient.conditions}
                lastVisit={patient.lastVisit}
                riskFactors={patient.riskFactors}
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
