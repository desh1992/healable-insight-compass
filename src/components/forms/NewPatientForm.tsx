import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const medicationSchema = z.object({
  name: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().optional(),
  adherence: z.number().min(0).max(100).optional(),
});

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dob: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  gender: z.enum(['Male', 'Female', 'Other']),
  contact: z.string().min(10, 'Contact number must be at least 10 digits').optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().optional(),
  insurance: z.string().optional(),
  primaryCondition: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  allergies: z.string().optional(),
  medications: z.array(medicationSchema).optional().default([]),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.number().min(30).max(200).optional(),
    respiratoryRate: z.number().min(8).max(40).optional(),
    temperature: z.number().min(95).max(105).optional(),
    oxygenSaturation: z.number().min(50).max(100).optional(),
  }).optional().default({}),
  riskFactors: z.object({
    cardiovascularRisk: z.enum(['low', 'medium', 'high']).optional(),
    diabetesComplicationRisk: z.enum(['low', 'medium', 'high']).optional(),
    medicationAdherenceRisk: z.enum(['low', 'medium', 'high']).optional(),
  }).optional().default({}),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional().default({}),
});

type FormData = z.infer<typeof formSchema>;

const NewPatientForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'Male',
      medications: [],
      vitalSigns: {
        heartRate: 70,
        respiratoryRate: 16,
        temperature: 98.6,
        oxygenSaturation: 98,
      },
      riskFactors: {
        cardiovascularRisk: 'low',
        diabetesComplicationRisk: 'low',
        medicationAdherenceRisk: 'low',
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Generate a unique ID for the new patient
      const patientId = Math.random().toString(36).substr(2, 9);
      
      // Store the patient data in localStorage for demo purposes
      const patientData = {
        id: patientId,
        ...data,
        lastVisit: new Date().toISOString(),
      };
      
      const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
      localStorage.setItem('patients', JSON.stringify([...existingPatients, patientData]));
      
      toast.success('Patient added successfully!');
      // Navigate to the new patient's record
      navigate(`/patient/${patientId}`);
    } catch (error) {
      toast.error('Failed to add patient. Please try again.');
    }
  };

  const formSections = [
    {
      title: 'Personal Information',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text' },
        { name: 'dob', label: 'Date of Birth', type: 'date' },
        {
          name: 'gender',
          label: 'Gender',
          type: 'radio',
          options: ['Male', 'Female', 'Other'],
        },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { name: 'contact', label: 'Phone Number', type: 'tel' },
        { name: 'email', label: 'Email Address', type: 'email' },
        { name: 'address', label: 'Address', type: 'textarea' },
      ],
    },
    {
      title: 'Medical Information',
      fields: [
        { name: 'insurance', label: 'Insurance Provider', type: 'text' },
        { name: 'primaryCondition', label: 'Primary Condition (if any)', type: 'text' },
        { name: 'allergies', label: 'Allergies', type: 'textarea' },
      ],
    },
    {
      title: 'Vital Signs',
      fields: [
        { name: 'vitalSigns.bloodPressure', label: 'Blood Pressure (e.g., 120/80)', type: 'text' },
        { name: 'vitalSigns.heartRate', label: 'Heart Rate (bpm)', type: 'number' },
        { name: 'vitalSigns.respiratoryRate', label: 'Respiratory Rate (br/min)', type: 'number' },
        { name: 'vitalSigns.temperature', label: 'Temperature (°F)', type: 'number' },
        { name: 'vitalSigns.oxygenSaturation', label: 'O2 Saturation (%)', type: 'number' },
      ],
    },
    {
      title: 'Risk Assessment',
      fields: [
        {
          name: 'riskFactors.cardiovascularRisk',
          label: 'Cardiovascular Risk',
          type: 'select',
          options: ['low', 'medium', 'high'],
        },
        {
          name: 'riskFactors.diabetesComplicationRisk',
          label: 'Diabetes Complication Risk',
          type: 'select',
          options: ['low', 'medium', 'high'],
        },
        {
          name: 'riskFactors.medicationAdherenceRisk',
          label: 'Medication Adherence Risk',
          type: 'select',
          options: ['low', 'medium', 'high'],
        },
      ],
    },
    {
      title: 'Emergency Contact',
      fields: [
        { name: 'emergencyContact.name', label: 'Contact Name', type: 'text' },
        { name: 'emergencyContact.relationship', label: 'Relationship', type: 'text' },
        { name: 'emergencyContact.phone', label: 'Contact Phone', type: 'tel' },
      ],
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto py-8" noValidate>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {formSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-healable-secondary mb-6">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </Label>
                    {field.type === 'radio' ? (
                      <RadioGroup
                        defaultValue="Male"
                        className="flex space-x-4"
                        {...register('gender')}
                      >
                        {field.options?.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : field.type === 'select' ? (
                      <Select
                        onValueChange={(value) => {
                          const event = { target: { value } };
                          register(field.name as any).onChange(event);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        className="w-full"
                        {...register(field.name as any)}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        className="w-full"
                        {...register(field.name as any)}
                        autoComplete="off"
                      />
                    )}
                    {errors[field.name.split('.')[0] as keyof FormData] && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-500"
                      >
                        {errors[field.name.split('.')[0] as keyof FormData]?.message}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Medications Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: formSections.length * 0.1 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-healable-secondary">
                Medications
              </h2>
              <Button
                type="button"
                onClick={() => append({ name: '', dosage: '', frequency: '', startDate: '', adherence: 100 })}
                className="bg-healable-primary hover:bg-healable-secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>

            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                >
                  <Card className="p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium">Medication #{index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`medications.${index}.name`}>Name</Label>
                        <Input
                          {...register(`medications.${index}.name` as const)}
                          placeholder="Medication name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`medications.${index}.dosage`}>Dosage</Label>
                        <Input
                          {...register(`medications.${index}.dosage` as const)}
                          placeholder="e.g., 20mg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`medications.${index}.frequency`}>Frequency</Label>
                        <Input
                          {...register(`medications.${index}.frequency` as const)}
                          placeholder="e.g., Once daily"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`medications.${index}.startDate`}>Start Date</Label>
                        <Input
                          type="date"
                          {...register(`medications.${index}.startDate` as const)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`medications.${index}.adherence`}>
                          Adherence Rate (%)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...register(`medications.${index}.adherence` as const, {
                            valueAsNumber: true,
                          })}
                        />
                        <div className="h-2 bg-gray-200 rounded-full mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              field.adherence >= 85
                                ? 'bg-green-500'
                                : field.adherence >= 70
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${field.adherence || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end space-x-4"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            className="w-32"
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="w-32 bg-healable-primary hover:bg-healable-secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save'
            )}
          </Button>
        </motion.div>
      </motion.div>
    </form>
  );
};

export default NewPatientForm; 