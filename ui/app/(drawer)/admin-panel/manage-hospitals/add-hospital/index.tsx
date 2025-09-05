import MyText from '@/components/text';
import React from 'react';
import { ScrollView, View, Alert } from 'react-native';
import tw from '@/app/tailwind';
import { useRouter } from 'expo-router';
import { useCreateHospital } from '@/api-hooks/hospital.api';
import HospitalDetailsForm, { initialHospitalValues } from '@/components/hospital-details-form';

function AddHospital() {
  const router = useRouter();
  const createHospitalMutation = useCreateHospital();

  const handleSubmit = async (values: typeof initialHospitalValues, { setSubmitting }: any) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        address: values.address
      } as any;
      
      // Add adminId if selected
      if (values.adminId) {
        payload.adminId = values.adminId;
      }
      
      const result = await createHospitalMutation.mutateAsync(payload);
      
      Alert.alert(
        'Success',
        result.message || 'Hospital added successfully!',
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
        error.message || 'Failed to add hospital. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={tw`flex-grow p-5`} style={tw`bg-white`}>
      <View style={tw`flex-col gap-4`}>
        <MyText style={tw`text-2xl font-bold mb-4`}>Add New Hospital</MyText>
        
        <HospitalDetailsForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText="Add Hospital"
        />
      </View>
    </ScrollView>
  );
}

export default AddHospital;
