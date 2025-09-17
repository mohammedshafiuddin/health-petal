import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import HospitalCard from '@/components/hospital-card';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FeaturedHospitalsPreviewProps {
  hospitals: any[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  onViewAllPress: () => void;
  onHospitalPress: (hospitalId: number) => void;
}

const FeaturedHospitalsPreview: React.FC<FeaturedHospitalsPreviewProps> = ({ 
  hospitals, 
  isLoading, 
  isError, 
  error,
  onViewAllPress,
  onHospitalPress
}) => {
  const router = useRouter();
  const accentColor = '#4f46e5'; // Default accent color
  
  if (isLoading) {
    return (
      <ThemedView style={tw`p-8 items-center bg-white dark:bg-gray-800 rounded-2xl shadow-md`}>
        <ActivityIndicator size="large" color={accentColor} />
        <MyText style={tw`mt-4 text-center text-gray-500 dark:text-gray-400`}>Loading top hospitals...</MyText>
      </ThemedView>
    );
  }
  
  if (isError) {
    return (
      <ThemedView style={tw`p-6 bg-red-50 dark:bg-red-900 rounded-2xl`}>
        <MyText style={tw`text-red-600 dark:text-red-200 text-center`}>
          Error loading top hospitals
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
  
  if (!hospitals || hospitals.length === 0) {
    return (
      <ThemedView style={tw`p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md items-center`}>
        <Ionicons name="business-outline" size={48} color="#d1d5db" />
        <MyText style={tw`mt-2 text-center text-gray-500 dark:text-gray-400`}>No top hospitals available</MyText>
        <TouchableOpacity 
          style={tw`mt-3 bg-blue-500 px-4 py-2 rounded-lg`}
          onPress={() => router.push("/(drawer)/hospitals" as any)}
        >
          <MyText style={tw`text-white`}>Explore Hospitals</MyText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <View>
      {hospitals.slice(0, 2).map(hospital => (
        <HospitalCard
          key={hospital.id}
          id={hospital.id}
          name={hospital.name}
          address={hospital.address}
          description={hospital.description}
          employeeCount={hospital.employeeCount}
          onPress={() => onHospitalPress(hospital.id)}
        />
      ))}
      
      {hospitals.length > 2 && (
        <TouchableOpacity 
          style={tw`mt-3 items-center`}
          onPress={onViewAllPress}
        >
          <MyText style={tw`text-blue-500 dark:text-blue-400 font-medium`}>
            View All {hospitals.length} Hospitals →
          </MyText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FeaturedHospitalsPreview;