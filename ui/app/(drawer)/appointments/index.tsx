import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from '@/app/tailwind';
import MyText from '@/components/text';
import { ThemedView } from '@/components/ThemedView';
import { useRoles } from '@/components/context/roles-context';
import { ROLE_NAMES } from '@/lib/constants';
import { useAppointmentScreenDoctors } from '@/api-hooks/dashboard.api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DoctorCard from '@/components/doctor-card';

export default function AppointmentsScreen() {
  const roles = useRoles();
  const isGenUser = roles?.includes(ROLE_NAMES.GENERAL_USER);
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch doctors based on search query
  const { 
    data: doctors,
    isLoading,
    isError,
    error
  } = useAppointmentScreenDoctors(debouncedSearchQuery, 20, 0);
  
  // Navigate to doctor details
  const navigateToDoctorDetails = (doctorId: number) => {
    router.push(`/(drawer)/dashboard/doctor-details/${doctorId}` as any);
  };

  // If user doesn't have the gen_user role, show unauthorized message
  if (!isGenUser) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center p-4`}>
        <View style={tw`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md`}>
          <MyText style={tw`text-red-500 text-lg mb-4 text-center`}>
            Unauthorized Access
          </MyText>
          <MyText style={tw`text-center`}>
            You don't have permission to view this page.
          </MyText>
        </View>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={tw`flex-1`}>
      <ScrollView 
        contentContainerStyle={tw`p-4`}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={tw`mb-6`}>
          <MyText style={tw`text-2xl font-bold`}>Find Doctors</MyText>
          <MyText style={tw`text-gray-500`}>Search for doctors, hospitals, or specializations</MyText>
        </View>
        
        {/* Search Bar */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700`}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={tw`flex-1 ml-3 text-gray-900 dark:text-gray-100`}
              placeholder="Search doctors, hospitals, specializations..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Results */}
        <View>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <MyText style={tw`text-xl font-bold`}>Doctors</MyText>
            <MyText style={tw`text-gray-500`}>
              {doctors?.length || 0} found
            </MyText>
          </View>
          
          {isLoading ? (
            <View style={tw`items-center py-8`}>
              <ActivityIndicator size="large" color="#0891b2" />
              <MyText style={tw`mt-4 text-gray-500`}>Searching for doctors...</MyText>
            </View>
          ) : isError ? (
            <View style={tw`bg-red-50 dark:bg-red-900 p-4 rounded-lg mb-4`}>
              <MyText style={tw`text-red-600 dark:text-red-200`}>
                Error loading doctors: {error?.message || 'Unknown error'}
              </MyText>
            </View>
          ) : doctors && doctors.length > 0 ? (
            <View>
              {doctors.map((doctor) => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  onPress={() => navigateToDoctorDetails(doctor.id)} 
                />
              ))}
            </View>
          ) : (
            <View style={tw`bg-gray-100 dark:bg-gray-800 p-8 rounded-lg items-center`}>
              <Ionicons name="search-outline" size={48} color="#9ca3af" />
              <MyText style={tw`text-gray-500 mt-2 text-center`}>
                {debouncedSearchQuery 
                  ? `No doctors found for "${debouncedSearchQuery}"` 
                  : 'Start searching for doctors, hospitals, or specializations'}
              </MyText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}