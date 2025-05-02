import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import NewPatientForm from '@/components/forms/NewPatientForm';
import { motion } from 'framer-motion';

const NewPatient: React.FC = () => {
  return (
    <AppLayout title="Add New Patient">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <motion.h1 
              className="text-3xl font-bold text-healable-secondary"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Add New Patient
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Please fill in the patient's information below. All required fields are marked with an asterisk (*).
            </motion.p>
          </div>
          
          <NewPatientForm />
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default NewPatient; 