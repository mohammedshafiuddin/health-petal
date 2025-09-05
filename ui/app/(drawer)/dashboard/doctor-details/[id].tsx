import React from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import tw from '@/app/tailwind';
import DoctorDetails from '@/components/doctor-details';
import { ThemedView } from '@/components/ThemedView';
import MyText from '@/components/text';
import MyButton from '@/components/button';
import { useRouter } from 'expo-router';
import useHideDrawerHeader from '@/hooks/useHideDrawerHeader';

export default function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const doctorId = parseInt(id as string);
  const router = useRouter();
  useHideDrawerHeader();
  
  if (isNaN(doctorId)) {
    return (
      <ThemedView style={tw`flex-1 p-4 justify-center items-center`}>
        <MyText style={tw`text-red-500 text-lg text-center mb-4`}>Invalid doctor ID</MyText>
        <MyButton
          onPress={() => router.back()}
          textContent="Go Back"
        />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
      <DoctorDetails 
        doctorId={doctorId}
        showFullDetails={true}
        isAdmin={true}
      />
    </ScrollView>
  );
}
