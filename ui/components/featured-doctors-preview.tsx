import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import DoctorDetails from '@/components/doctor-details';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

interface FeaturedDoctorsPreviewProps {
  doctors: any[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  onViewAllPress: () => void;
  onDoctorPress: (doctorId: number) => void;
}

const FeaturedDoctorsPreview: React.FC<FeaturedDoctorsPreviewProps> = ({ 
  doctors, 
  isLoading, 
  isError, 
  error,
  onViewAllPress,
  onDoctorPress
}) => {
  const accentColor = '#4f46e5'; // Default accent color
  
  if (isLoading) {
    return (
      <ThemedView style={tw`p-8 items-center bg-white dark:bg-gray-800 rounded-2xl shadow-md`}>
        <ActivityIndicator size="large" color={accentColor} />
        <MyText style={tw`mt-4 text-center text-gray-500 dark:text-gray-400`}>Loading featured doctors...</MyText>
      </ThemedView>
    );
  }
  
  if (isError) {
    return (
      <ThemedView style={tw`p-6 bg-red-50 dark:bg-red-900 rounded-2xl`}>
        <MyText style={tw`text-red-600 dark:text-red-200 text-center`}>
          Error loading featured doctors
        </MyText>
        <TouchableOpacity 
          style={tw`mt-3 bg-red-500 px-4 py-2 rounded-lg self-center`}
          onPress={() => window.location.reload()}
        >
          <MyText style={tw`text-white`}>Retry</MyText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  if (!doctors || doctors.length === 0) {
    return (
      <ThemedView style={tw`p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md items-center`}>
        <Ionicons name="person-outline" size={48} color="#d1d5db" />
        <MyText style={tw`mt-2 text-center text-gray-500 dark:text-gray-400`}>No featured doctors available</MyText>
        <TouchableOpacity 
          style={tw`mt-3 bg-blue-500 px-4 py-2 rounded-lg`}
          onPress={onViewAllPress}
        >
          <MyText style={tw`text-white`}>Browse Doctors</MyText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <View>
      {doctors.slice(0, 2).map((doctor) => (
        <DoctorDetails 
          key={doctor.id}
          doctorId={doctor.id}
          onPress={() => onDoctorPress(doctor.id)}
        />
      ))}
      
      {doctors.length > 2 && (
        <TouchableOpacity 
          style={tw`mt-3 items-center`}
          onPress={onViewAllPress}
        >
          <MyText style={tw`text-blue-500 dark:text-blue-400 font-medium`}>
            View All {doctors.length} Doctors →
          </MyText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FeaturedDoctorsPreview;