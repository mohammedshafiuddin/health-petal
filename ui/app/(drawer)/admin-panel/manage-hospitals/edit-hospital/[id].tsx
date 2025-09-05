import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert, ActivityIndicator } from 'react-native';
import tw from '@/app/tailwind';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MyText from '@/components/text';
import HospitalDetailsForm, { initialHospitalValues } from '@/components/hospital-details-form';
import { useGetHospitalById, useUpdateHospital } from '@/api-hooks/hospital.api';

function EditHospital() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hospitalData, setHospitalData] = useState(initialHospitalValues);
  
  const { data: hospital, isLoading, error } = useGetHospitalById(id);
  const updateHospitalMutation = useUpdateHospital();

  useEffect(() => {
    if (hospital) {
      setHospitalData({
        name: hospital.name,
        description: hospital.description || '',
        address: hospital.address || '',
        adminId: hospital.adminId || null,
        adminName: hospital.adminName || ''
      });
    }
  }, [hospital]);

  const handleSubmit = async (values: typeof initialHospitalValues, { setSubmitting }: any) => {
    try {
      const payload = {
        id: Number(id),
        name: values.name,
        description: values.description,
        address: values.address
      } as any;
      
      // Add adminId if selected
      if (values.adminId) {
        payload.adminId = values.adminId;
      }
      
      const result = await updateHospitalMutation.mutateAsync(payload);
      
      Alert.alert(
        'Success',
        result.message || 'Hospital updated successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => router.push("/(drawer)/admin-panel/manage-hospitals") 
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update hospital. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !hospital) {
    return (
      <View style={tw`flex-1 justify-center items-center p-5`}>
        <MyText style={tw`text-red-500`}>
          {error ? `Error: ${error.message}` : 'Hospital not found'}
        </MyText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={tw`flex-grow p-5`} style={tw`bg-white`}>
      <View style={tw`flex-col gap-4`}>
        <MyText style={tw`text-2xl font-bold mb-4`}>Edit Hospital</MyText>
        
        <HospitalDetailsForm
          initialValues={hospitalData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText="Update Hospital"
          isEdit={true}
        />
      </View>
    </ScrollView>
  );
}

export default EditHospital;
