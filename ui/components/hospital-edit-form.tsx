import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Chip } from 'react-native-paper';
import tw from '@/app/tailwind';
import MyText from '@/components/text';
import MyTextInput from '@/components/textinput';
import MyButton from '@/components/button';
import { useGetHospitalById, useUpdateHospital } from '@/api-hooks/hospital.api';
import { ThemedView } from '@/components/ThemedView';
import { useGetPotentialDoctorEmployees } from '@/api-hooks/hospital-admin.api';
import MultiSelectDropdown from '@/components/multi-select';
import { useHospitalAdminDashboard } from '@/api-hooks/hospital.api';

// Define validation schema using Yup
const HospitalSchema = Yup.object().shape({
  name: Yup.string()
    .required('Hospital name is required'),
  description: Yup.string(),
  address: Yup.string()
    .required('Hospital address is required'),
});

// Initial form values
const initialHospitalValues = {
  name: '',
  description: '',
  address: '',
};

interface HospitalEditFormProps {
  hospitalId: number | undefined;
  onCancel: () => void;
  submitButtonText?: string;
  onSuccess?: () => void;
}

export default function 
HospitalEditForm({
  hospitalId,
  onCancel,
  submitButtonText = "Update Hospital",
  onSuccess
}: HospitalEditFormProps) {
  // Fetch hospital data
  const { 
    data: hospital, 
    isLoading: hospitalLoading, 
    error: hospitalError
  } = useGetHospitalById(hospitalId);
  
  // Fetch hospital dashboard data to get doctors
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useHospitalAdminDashboard(hospitalId);
  
  // Fetch potential doctors who can be added to this hospital
  const {
    data: potentialDoctors,
    isLoading: potentialDoctorsLoading,
    error: potentialDoctorsError
  } = useGetPotentialDoctorEmployees();
  
  // State for doctors to be added
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<(string | number)[]>([]);
  
  // State for doctors to be removed (just marked for removal, not actually removed until form submission)
  const [doctorsToRemove, setDoctorsToRemove] = useState<number[]>([]);
  
  // Update hospital mutation
  const updateHospitalMutation = useUpdateHospital();
  
  const isLoading = hospitalLoading || dashboardLoading || potentialDoctorsLoading;
  const error = hospitalError || dashboardError || potentialDoctorsError;
  
  if (isLoading) {
    return (
      <View style={tw`py-6 items-center`}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <MyText style={tw`mt-4 text-gray-600`}>Loading hospital details...</MyText>
      </View>
    );
  }
  
  if (error || !hospital) {
    return (
      <ThemedView style={tw`py-6 items-center`}>
        <MyText style={tw`text-red-500 text-lg mb-4 text-center`}>
          {error instanceof Error ? error.message : 'Hospital not found or could not be loaded.'}
        </MyText>
        <MyButton
          textContent="Go Back"
          onPress={onCancel}
        />
      </ThemedView>
    );
  }
  
  // Handler for marking a doctor for removal (doesn't actually remove until form submission)
  const handleMarkDoctorForRemoval = (doctorId: number) => {
    setDoctorsToRemove(prev => [...prev, doctorId]);
  };
  
  // Handler for unmarking a doctor for removal
  const handleUnmarkDoctorForRemoval = (doctorId: number) => {
    setDoctorsToRemove(prev => prev.filter(id => id !== doctorId));
  };
  
  // Check if a doctor is marked for removal
  const isDoctorMarkedForRemoval = (doctorId: number) => {
    return doctorsToRemove.includes(doctorId);
  };
  
  const handleSubmit = async (values: typeof initialHospitalValues, { setSubmitting }: any) => {
    try {
      if (!hospitalId) {
        Alert.alert('Error', 'Hospital ID is missing');
        setSubmitting(false);
        return;
      }
      
      const numId = Number(hospitalId);
      
      // Create a comprehensive update payload that includes doctors to add/remove
      const payload = {
        id: numId,
        name: values.name,
        description: values.description,
        address: values.address,
        doctorsToAdd: selectedDoctorIds.map(id => Number(id)),
        doctorsToRemove: doctorsToRemove
      };
      
      // Send a single update request
      await updateHospitalMutation.mutateAsync(payload);
      
      // Clear the doctor selections after successful update
      setDoctorsToRemove([]);
      setSelectedDoctorIds([]);
      
      Alert.alert(
        'Success',
        'Hospital updated successfully',
        [{ text: 'OK', onPress: onSuccess || onCancel }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update hospital',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  // Initialize form values from the hospital data
  const formInitialValues = {
    name: hospital.name,
    description: hospital.description || '',
    address: hospital.address || '',
  };
  
  return (
    <Formik
      initialValues={formInitialValues}
      validationSchema={HospitalSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
        <View>
          <View style={tw`mb-4`}>
            <MyTextInput
              topLabel="Hospital Name"
              placeholder="Enter hospital name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              style={tw`mb-2`}
            />
            {touched.name && errors.name && (
              <MyText style={tw`text-red-500 text-xs mt-1`}>{errors.name}</MyText>
            )}
          </View>
          
          <View style={tw`mb-4`}>
            <MyTextInput
              topLabel="Description"
              placeholder="Enter hospital description"
              value={values.description}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              multiline
              numberOfLines={4}
              style={tw`mb-2`}
            />
            {touched.description && errors.description && (
              <MyText style={tw`text-red-500 text-xs mt-1`}>{errors.description}</MyText>
            )}
          </View>
          
          <View style={tw`mb-4`}>
            <MyTextInput
              topLabel="Address"
              placeholder="Enter hospital address"
              value={values.address}
              onChangeText={handleChange('address')}
              onBlur={handleBlur('address')}
              multiline
              numberOfLines={3}
              style={tw`mb-2`}
            />
            {touched.address && errors.address && (
              <MyText style={tw`text-red-500 text-xs mt-1`}>{errors.address}</MyText>
            )}
          </View>
          
          <View style={tw`mt-6 mb-4`}>
            <MyText style={tw`text-lg font-semibold mb-2`}>Hospital Doctors</MyText>
            
            {/* Display current doctors as chips */}
            <View style={tw`mb-4`}>
              <MyText style={tw`mb-2 text-sm text-gray-600`}>Current Doctors:</MyText>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`flex-row flex-wrap`}
                style={tw`max-h-20`}
              >
                {dashboardData?.doctors && dashboardData.doctors.length > 0 ? (
                  dashboardData.doctors.map(doctor => {
                    const isMarkedForRemoval = isDoctorMarkedForRemoval(doctor.id);
                    return (
                      <Chip
                        key={doctor.id}
                        onClose={() => {
                          if (isMarkedForRemoval) {
                            handleUnmarkDoctorForRemoval(doctor.id);
                          } else {
                            handleMarkDoctorForRemoval(doctor.id);
                          }
                        }}
                        style={[
                          tw`m-1`,
                          isMarkedForRemoval ? tw`bg-red-100` : null
                        ]}
                        mode="outlined"
                        closeIcon={isMarkedForRemoval ? "close-circle-outline" : "close"}
                      >
                        {doctor.name}
                        {isMarkedForRemoval ? " (will be removed)" : ""}
                      </Chip>
                    );
                  })
                ) : (
                  <MyText style={tw`text-gray-500 italic`}>No doctors assigned to this hospital</MyText>
                )}
              </ScrollView>
              {doctorsToRemove.length > 0 && (
                <MyText style={tw`text-xs text-red-500 mt-1`}>
                  {doctorsToRemove.length} doctor(s) marked for removal. Changes will apply when you update the hospital.
                </MyText>
              )}
            </View>
            
            {/* MultiSelect for adding new doctors */}
            <View style={tw`mb-4`}>
              <MyText style={tw`mb-1 text-sm font-medium`}>Add Doctors</MyText>
              <MultiSelectDropdown
                data={potentialDoctors?.map(doctor => ({
                  label: doctor.name,
                  value: doctor.id.toString()
                })) || []}
                value={selectedDoctorIds.map(id => id.toString())}
                onChange={(values) => setSelectedDoctorIds(values.map(v => Number(v)))}
                placeholder="Select doctors to add..."
                search
                maxHeight={300}
                inputSearchStyle={tw`h-10 p-2`}
              />
              
              {selectedDoctorIds.length > 0 && (
                <MyText style={tw`text-xs text-blue-500 mt-1`}>
                  {selectedDoctorIds.length} doctor(s) selected to add. Changes will apply when you update the hospital.
                </MyText>
              )}
            </View>
          </View>
          
          <View style={tw`flex-row justify-between mt-4`}>
            <MyButton
              mode="outlined"
              textContent="Cancel"
              onPress={onCancel}
              style={tw`flex-1 mr-2`}
            />
            
            <MyButton
              mode="contained"
              textContent={isSubmitting ? "Updating..." : submitButtonText}
              onPress={handleSubmit as any}
              disabled={isSubmitting}
              style={tw`flex-1 ml-2`}
            />
          </View>
        </View>
      )}
    </Formik>
  );
}
