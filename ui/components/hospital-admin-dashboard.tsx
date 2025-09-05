import React, { useState } from 'react'
import { View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native'
import tw from '@/app/tailwind'
import MyText from '@/components/text'
import { ThemedView } from '@/components/ThemedView'
import { useAuth } from '@/components/context/auth-context'
import { useHospitalAdminDashboard, Doctor } from '@/api-hooks/hospital.api'
import { useUpdateDoctorAvailability } from '@/api-hooks/token.api'
import { ErrorToast, SuccessToast } from '@/services/toaster'

interface HospitalAdminDashboardProps {
  // Add any props you might need to pass to the dashboard
}

const HospitalAdminDashboard: React.FC<HospitalAdminDashboardProps> = () => {
  const { responsibilities } = useAuth();
  const hospitalId = responsibilities?.hospitalAdminFor;
  const [refreshing, setRefreshing] = React.useState(false);
  // State for tracking updates
  const [updatingDoctor, setUpdatingDoctor] = useState<string | null>(null);
  
  // State for optimistic UI updates
  const [optimisticDoctors, setOptimisticDoctors] = useState<Record<number, { 
    tokensIssued?: number, 
    consultationsDone?: number 
  }>>({});

  const { 
    data: dashboardData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useHospitalAdminDashboard(hospitalId);
  
  // Setup mutation for updating availability with destructured properties
  const {
    mutate: updateAvailability,
    isPending: isUpdatingAvailability,
    isError: hasUpdateError,
    error: updateError
  } = useUpdateDoctorAvailability();

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      ErrorToast('Failed to refresh dashboard data');
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  
  // Function to adjust tokens issued (filledTokenCount)
  const adjustTokensIssued = (doctor: Doctor, increment: boolean) => {
    if (!dashboardData) return;
    
    // Calculate new filled token count
    let newTokensIssued = doctor.tokensIssuedToday + (increment ? 1 : -1);
    
    // Ensure filled count doesn't go below 0 or above total
    if (newTokensIssued < 0) newTokensIssued = 0;
    if (newTokensIssued > doctor.totalTokenCount) newTokensIssued = doctor.totalTokenCount;
    
    // If nothing changed, exit early
    if (newTokensIssued === doctor.tokensIssuedToday) return;
    
    // Update optimistic state immediately for a responsive UI
    setOptimisticDoctors(prev => ({
      ...prev,
      [doctor.id]: {
        ...prev[doctor.id],
        tokensIssued: newTokensIssued
      }
    }));
    
    // Show updating state
    setUpdatingDoctor(`${doctor.id}-tokens`);
    
    // Prepare the update payload
    const update = {
      doctorId: doctor.id,
      date: dashboardData.currentDate,
      tokenCount: doctor.totalTokenCount,
      filledTokenCount: newTokensIssued,
      consultationsDone: doctor.consultationsDone,
      isStopped: !doctor.isAvailable
    };
    
    // Send the update to the server
    updateAvailability([update], {
      onSuccess: () => {
        SuccessToast('Tokens updated successfully');
        // Reset optimistic state on success as we'll refetch
        setOptimisticDoctors(prev => {
          const newState = { ...prev };
          if (newState[doctor.id]) {
            delete newState[doctor.id].tokensIssued;
            if (!newState[doctor.id].consultationsDone) {
              delete newState[doctor.id];
            }
          }
          return newState;
        });
        refetch(); // Refresh data to get the latest counts
      },
      onError: (err: Error) => {
        console.error('Error updating tokens:', err);
        Alert.alert('Update Failed', 'Failed to update tokens. Please try again.');
        // Reset optimistic state on error
        setOptimisticDoctors(prev => {
          const newState = { ...prev };
          if (newState[doctor.id]) {
            delete newState[doctor.id].tokensIssued;
            if (!newState[doctor.id].consultationsDone) {
              delete newState[doctor.id];
            }
          }
          return newState;
        });
      },
      onSettled: () => {
        setUpdatingDoctor(null);
      }
    });
  };
  
  // Function to adjust consultations done count
  const adjustConsultationsDone = (doctor: Doctor, increment: boolean) => {
    if (!dashboardData) return;
    
    // Calculate new consultations done count
    let newConsultationsDone = doctor.consultationsDone + (increment ? 1 : -1);
    
    // Ensure consultations done count doesn't go below 0
    if (newConsultationsDone < 0) newConsultationsDone = 0;
    
    // If nothing changed, exit early
    if (newConsultationsDone === doctor.consultationsDone) return;
    
    // Update optimistic state immediately for a responsive UI
    setOptimisticDoctors(prev => ({
      ...prev,
      [doctor.id]: {
        ...prev[doctor.id],
        consultationsDone: newConsultationsDone
      }
    }));
    
    // Show updating state
    setUpdatingDoctor(`${doctor.id}-consultations`);
    
    // Prepare the update payload
    const update = {
      doctorId: doctor.id,
      date: dashboardData.currentDate,
      tokenCount: doctor.totalTokenCount,
      filledTokenCount: doctor.tokensIssuedToday,
      consultationsDone: newConsultationsDone,
      isStopped: !doctor.isAvailable
    };
    
    // Send the update to the server
    updateAvailability([update], {
      onSuccess: () => {
        SuccessToast('Consultations count updated successfully');
        // Reset optimistic state on success as we'll refetch
        setOptimisticDoctors(prev => {
          const newState = { ...prev };
          if (newState[doctor.id]) {
            delete newState[doctor.id].consultationsDone;
            if (!newState[doctor.id].tokensIssued) {
              delete newState[doctor.id];
            }
          }
          return newState;
        });
        refetch(); // Refresh data to get the latest counts
      },
      onError: (err: Error) => {
        console.error('Error updating consultations:', err);
        Alert.alert('Update Failed', 'Failed to update consultations count. Please try again.');
        // Reset optimistic state on error
        setOptimisticDoctors(prev => {
          const newState = { ...prev };
          if (newState[doctor.id]) {
            delete newState[doctor.id].consultationsDone;
            if (!newState[doctor.id].tokensIssued) {
              delete newState[doctor.id];
            }
          }
          return newState;
        });
      },
      onSettled: () => {
        setUpdatingDoctor(null);
      }
    });
  };

  // Show error state if there was an error fetching data
  if (isError) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center p-4`}>
        <MyText style={tw`text-red-500 text-lg mb-4`}>
          Error loading dashboard: {error?.message || 'Unknown error'}
        </MyText>
        <View style={tw`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md`}>
          <MyText style={tw`text-center`}>
            We couldn't load your dashboard data. Please try again later.
          </MyText>
        </View>
      </ThemedView>
    );
  }
  
  // Show API update error if there was an issue updating
  React.useEffect(() => {
    if (hasUpdateError && updateError) {
      ErrorToast(`Update failed: ${updateError.message || 'Unknown error'}`);
    }
  }, [hasUpdateError, updateError]);

  // Render loading state
  if (isLoading || !dashboardData) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0891b2" />
        <MyText style={tw`mt-4 text-lg`}>Loading dashboard...</MyText>
      </ThemedView>
    );
  }

  // Render dashboard with data
  return (
    <ThemedView style={tw`flex-1`}>
      <ScrollView 
        contentContainerStyle={tw`p-4`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hospital Info Card */}
        <View style={tw`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6`}>
          <MyText style={tw`text-2xl font-bold mb-2`}>
            {dashboardData.hospital.name}
          </MyText>
          <MyText style={tw`text-gray-600 dark:text-gray-400 mb-4`}>
            {dashboardData.hospital.address}
          </MyText>
          {dashboardData.hospital.description && (
            <MyText style={tw`mb-2`}>
              {dashboardData.hospital.description}
            </MyText>
          )}
        </View>

        {/* Stats Summary */}
        <View style={tw`flex-row flex-wrap justify-between mb-6`}>
          <StatCard 
            title="Total Doctors" 
            value={dashboardData.totalDoctors} 
            backgroundColor="bg-blue-100 dark:bg-blue-900"
          />
          <StatCard 
            title="Today's Appointments" 
            value={dashboardData.totalAppointmentsToday} 
            backgroundColor="bg-green-100 dark:bg-green-900"
          />
          <StatCard 
            title="Consultations Done" 
            value={dashboardData.totalConsultationsDone} 
            backgroundColor="bg-purple-100 dark:bg-purple-900"
          />
        </View>

        {/* Doctors List */}
        <MyText style={tw`text-xl font-bold mb-4`}>Doctors</MyText>
        {dashboardData.doctors.length === 0 ? (
          <View style={tw`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md`}>
            <MyText style={tw`text-center`}>No doctors found for this hospital.</MyText>
          </View>
        ) : (
          dashboardData.doctors.map(doctor => (
            <DoctorCard 
              key={doctor.id} 
              doctor={doctor} 
              onAdjustTokens={adjustTokensIssued}
              onAdjustConsultations={adjustConsultationsDone}
              isUpdating={
                isUpdatingAvailability && 
                (updatingDoctor === `${doctor.id}-tokens` || 
                updatingDoctor === `${doctor.id}-consultations`)
              }
              optimisticValues={optimisticDoctors[doctor.id]}
            />
          ))
        )}
      </ScrollView>
    </ThemedView>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  backgroundColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, backgroundColor }) => (
  <View style={tw`${backgroundColor} p-4 rounded-xl shadow-sm mb-4 w-[30%]`}>
    <MyText style={tw`text-center text-3xl font-bold`}>{value}</MyText>
    <MyText style={tw`text-center text-sm mt-1`}>{title}</MyText>
  </View>
);

// Doctor Card Component
interface DoctorCardProps {
  doctor: Doctor;
  onAdjustTokens: (doctor: Doctor, increment: boolean) => void;
  onAdjustConsultations: (doctor: Doctor, increment: boolean) => void;
  isUpdating: boolean;
  optimisticValues?: {
    tokensIssued?: number;
    consultationsDone?: number;
  };
}

const DoctorCard: React.FC<DoctorCardProps> = ({ 
  doctor, 
  onAdjustTokens, 
  onAdjustConsultations,
  isUpdating,
  optimisticValues
}) => (
  <View style={tw`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-4`}>
    <View style={tw`flex-row justify-between items-center mb-2`}>
      <MyText style={tw`text-lg font-bold`}>{doctor.name}</MyText>
      <View style={tw`${doctor.isAvailable ? 'bg-green-100' : 'bg-red-100'} px-3 py-1 rounded-full`}>
        <MyText style={tw`${doctor.isAvailable ? 'text-green-800' : 'text-red-800'} text-xs font-medium`}>
          {doctor.isAvailable ? 'Available' : 'Unavailable'}
        </MyText>
      </View>
    </View>
    
    {doctor.qualifications && (
      <MyText style={tw`text-gray-600 dark:text-gray-400 mb-3`}>
        {doctor.qualifications}
      </MyText>
    )}
    
    <View style={tw`flex-row flex-wrap justify-between mt-2`}>
      {/* Tokens Issued with adjustment buttons */}
      <View style={tw`mb-3 w-[48%]`}>
        <MyText style={tw`text-xs text-gray-500 dark:text-gray-400`}>Tokens Issued</MyText>
        <View style={tw`flex-row items-center mt-1`}>
          <TouchableOpacity
            style={tw`w-8 h-8 ${isUpdating ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'} rounded-full items-center justify-center ${doctor.tokensIssuedToday <= 0 ? 'opacity-50' : ''}`}
            onPress={() => onAdjustTokens(doctor, false)}
            disabled={isUpdating || doctor.tokensIssuedToday <= 0}
          >
            <MyText style={tw`text-lg font-bold`}>-</MyText>
          </TouchableOpacity>
          <View style={tw`flex-row items-center mx-3 min-w-[24px] justify-center`}>
            <MyText style={tw`text-sm font-medium`}>
              {optimisticValues?.tokensIssued !== undefined 
                ? optimisticValues.tokensIssued 
                : doctor.tokensIssuedToday}
            </MyText>
          </View>
          <TouchableOpacity
            style={tw`w-8 h-8 ${isUpdating ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'} rounded-full items-center justify-center ${doctor.tokensIssuedToday >= doctor.totalTokenCount ? 'opacity-50' : ''}`}
            onPress={() => onAdjustTokens(doctor, true)}
            disabled={isUpdating || doctor.tokensIssuedToday >= doctor.totalTokenCount}
          >
            <MyText style={tw`text-lg font-bold`}>+</MyText>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Consultations Done with adjustment buttons */}
      <View style={tw`mb-3 w-[48%]`}>
        <MyText style={tw`text-xs text-gray-500 dark:text-gray-400`}>Consultations Done</MyText>
        <View style={tw`flex-row items-center mt-1`}>
          <TouchableOpacity
            style={tw`w-8 h-8 ${isUpdating ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'} rounded-full items-center justify-center ${doctor.consultationsDone <= 0 ? 'opacity-50' : ''}`}
            onPress={() => onAdjustConsultations(doctor, false)}
            disabled={isUpdating || doctor.consultationsDone <= 0}
          >
            <MyText style={tw`text-lg font-bold`}>-</MyText>
          </TouchableOpacity>
          <View style={tw`flex-row items-center mx-3 min-w-[24px] justify-center`}>
            <MyText style={tw`text-sm font-medium`}>
              {optimisticValues?.consultationsDone !== undefined 
                ? optimisticValues.consultationsDone 
                : doctor.consultationsDone}
            </MyText>
          </View>
          <TouchableOpacity
            style={tw`w-8 h-8 ${isUpdating ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'} rounded-full items-center justify-center`}
            onPress={() => onAdjustConsultations(doctor, true)}
            disabled={isUpdating}
          >
            <MyText style={tw`text-lg font-bold`}>+</MyText>
          </TouchableOpacity>
        </View>
      </View>
      
      <ConsultationInfo label="Available Tokens" value={doctor.availableTokens} />
      <ConsultationInfo label="Current No." value={doctor.currentConsultationNumber} />
      <ConsultationInfo label="Fee" value={`₹${doctor.consultationFee}`} isPrice />
    </View>
  </View>
);

// Consultation Info Component
interface ConsultationInfoProps {
  label: string;
  value: number | string;
  isPrice?: boolean;
}

const ConsultationInfo: React.FC<ConsultationInfoProps> = ({ label, value, isPrice = false }) => (
  <View style={tw`mb-2 ${isPrice ? 'w-full' : 'w-[30%]'}`}>
    <MyText style={tw`text-xs text-gray-500 dark:text-gray-400`}>{label}</MyText>
    <MyText style={tw`text-sm font-medium`}>{value}</MyText>
  </View>
);

export default HospitalAdminDashboard
