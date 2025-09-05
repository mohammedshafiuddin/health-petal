import React from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import tw from '@/app/tailwind';
import { ThemedView } from '@/components/ThemedView';
import MyText from '@/components/text';
import MyButton from '@/components/button';
import { useRouter } from 'expo-router';
import useHideDrawerHeader from '@/hooks/useHideDrawerHeader';
import { useFeaturedHospitals } from '@/api-hooks/dashboard.api';
import HospitalDetails from '@/components/hospital-details';

export default function HospitalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hospitalId = parseInt(id as string);
  const router = useRouter();
  
  // Use the hook to hide the drawer header
  useHideDrawerHeader();
  
  // Fetch hospital data - in a real app you'd have a dedicated hook for a single hospital
  const { data: hospitals, isLoading, error } = useFeaturedHospitals();
  const hospital = hospitals?.find(h => h.id === hospitalId);
  
  if (isNaN(hospitalId)) {
    return (
      <ThemedView style={tw`flex-1 p-4 justify-center items-center`}>
        <MyText style={tw`text-red-500 text-lg text-center mb-4`}>Invalid hospital ID</MyText>
        <MyButton
          onPress={() => router.back()}
          textContent="Go Back"
        />
      </ThemedView>
    );
  }
  
  if (isLoading) {
    return (
      <ThemedView style={tw`flex-1 p-4 justify-center items-center`}>
        <MyText style={tw`text-lg text-center mb-4`}>Loading hospital details...</MyText>
      </ThemedView>
    );
  }
  
  if (error || !hospital) {
    return (
      <ThemedView style={tw`flex-1 p-4 justify-center items-center`}>
        <MyText style={tw`text-red-500 text-lg text-center mb-4`}>
          {error ? 'Error loading hospital details' : 'Hospital not found'}
        </MyText>
        <MyButton
          onPress={() => router.back()}
          textContent="Go Back"
        />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
      <HospitalDetails 
        hospital={hospital}
        showFullDetails={true}
      />
    </ScrollView>
  );
}
