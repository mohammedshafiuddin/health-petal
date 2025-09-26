import React from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/app/tailwind';
import MyText from '@/components/text';
import { ThemedView } from '@/components/ThemedView';
import { useRoles } from '@/components/context/roles-context';
import { ROLE_NAMES } from '@/lib/constants';
import { useMyUpcomingTokens, usePastTokens } from '@/api-hooks/token.api';
import { UpcomingToken, PastToken } from '../../../../shared-types';
import { Ionicons } from '@expo/vector-icons';

export default function MyTokensScreen() {
  const roles = useRoles();
  const isGenUser = roles?.includes(ROLE_NAMES.GENERAL_USER);
  const router = useRouter();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Fetch both upcoming and past tokens
  const { 
    data: upcomingTokensData,
    isLoading: isLoadingUpcoming,
    isError: isErrorUpcoming,
    error: errorUpcoming,
    refetch: refetchUpcoming
  } = useMyUpcomingTokens();
  
  const { 
    data: pastTokensData,
    isLoading: isLoadingPast,
    isError: isErrorPast,
    error: errorPast,
    refetch: refetchPast
  } = usePastTokens();
  
  // Handle pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUpcoming(),
        refetchPast()
      ]);
    } catch (err) {
      console.error('Failed to refresh tokens', err);
    } finally {
      setRefreshing(false);
    }
  }, [refetchUpcoming, refetchPast]);
  
  // Navigate to doctor details
  const navigateToDoctorDetails = (doctorId: number) => {
    router.push(`/(drawer)/dashboard/doctor-details/${doctorId}` as any);
  };
  
  // Navigate to dashboard to book appointment
  const navigateToDashboard = () => {
    router.push('/(drawer)/dashboard');
  };

  // If user doesn't have the gen_user role, show unauthorized message
  if (!isGenUser) {
    return (
      <AppContainer>
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <View style={tw`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md`}>
            <MyText style={tw`text-red-500 text-lg mb-4 text-center`}>
              Unauthorized Access
            </MyText>
            <MyText style={tw`text-center`}>
              You don't have permission to view this page.
            </MyText>
          </View>
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <View style={tw`flex-1 p-4`}>
        {/* Header */}
        <View style={tw`mb-6`}>
          <MyText style={tw`text-2xl font-bold`}>My Tokens</MyText>
          <MyText style={tw`text-gray-500`}>View your upcoming and past appointments</MyText>
        </View>
        
        {/* Upcoming Appointments */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <MyText style={tw`text-xl font-bold`}>Upcoming Appointments</MyText>
            <MyText style={tw`text-gray-500`}>
              {upcomingTokensData?.tokens.length || 0} appointments
            </MyText>
          </View>
          
          {isLoadingUpcoming ? (
            <View style={tw`items-center py-6`}>
              <ActivityIndicator size="large" color="#0891b2" />
              <MyText style={tw`mt-4 text-gray-500`}>Loading upcoming appointments...</MyText>
            </View>
          ) : isErrorUpcoming ? (
            <View style={tw`bg-red-50 dark:bg-red-900 p-4 rounded-lg mb-4`}>
              <MyText style={tw`text-red-600 dark:text-red-200`}>
                Error loading upcoming tokens: {errorUpcoming?.message || 'Unknown error'}
              </MyText>
            </View>
          ) : upcomingTokensData?.tokens && upcomingTokensData.tokens.length > 0 ? (
            <View>
              {upcomingTokensData.tokens.map((token) => (
                <UpcomingTokenCard 
                  key={token.id} 
                  token={token} 
                  onDoctorPress={() => navigateToDoctorDetails(token.doctor.id)} 
                />
              ))}
            </View>
          ) : (
            <View style={tw`bg-gray-100 dark:bg-gray-800 p-6 rounded-lg items-center`}>
              <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
              <MyText style={tw`text-gray-500 mt-2 text-center`}>
                No upcoming appointments
              </MyText>
              <TouchableOpacity
                onPress={navigateToDashboard}
                style={tw`bg-blue-500 px-4 py-2 rounded-lg mt-4`}>
                <MyText style={tw`text-white font-medium`}>
                  Book New Appointment
                </MyText>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Past Appointments */}
        <View>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <MyText style={tw`text-xl font-bold`}>Past Appointments</MyText>
            <MyText style={tw`text-gray-500`}>
              {pastTokensData?.tokens.length || 0} appointments
            </MyText>
          </View>
          
          {isLoadingPast ? (
            <View style={tw`items-center py-6`}>
              <ActivityIndicator size="large" color="#0891b2" />
              <MyText style={tw`mt-4 text-gray-500`}>Loading past appointments...</MyText>
            </View>
          ) : isErrorPast ? (
            <View style={tw`bg-red-50 dark:bg-red-900 p-4 rounded-lg mb-4`}>
              <MyText style={tw`text-red-600 dark:text-red-200`}>
                Error loading past tokens: {errorPast?.message || 'Unknown error'}
              </MyText>
            </View>
          ) : pastTokensData?.tokens && pastTokensData.tokens.length > 0 ? (
            <View>
              {pastTokensData.tokens.map((token) => (
                <PastTokenCard 
                  key={token.id} 
                  token={token} 
                  onDoctorPress={() => navigateToDoctorDetails(token.doctor.id)} 
                />
              ))}
            </View>
          ) : (
            <View style={tw`bg-gray-100 dark:bg-gray-800 p-6 rounded-lg items-center`}>
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <MyText style={tw`text-gray-500 mt-2 text-center`}>
                No past appointments
              </MyText>
            </View>
          )}
        </View>
      </View>
    </AppContainer>
  );
}

// Upcoming Token Card Component
interface UpcomingTokenCardProps {
  token: UpcomingToken;
  onDoctorPress: () => void;
}

const UpcomingTokenCard: React.FC<UpcomingTokenCardProps> = ({ token, onDoctorPress }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Check if token is for today
  const isToday = (dateString: string) => {
    const today = new Date();
    const tokenDate = new Date(dateString);
    return (
      tokenDate.getDate() === today.getDate() &&
      tokenDate.getMonth() === today.getMonth() &&
      tokenDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <View style={tw`bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm mb-4 border-l-4 ${
      isToday(token.tokenDate) ? 'border-green-500' : 'border-blue-500'
    }`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <View style={tw`flex-1`}>
          <MyText style={tw`text-lg font-bold`}>
            Token #{token.queueNumber}
            {isToday(token.tokenDate) && (
              <MyText style={tw`text-green-500 font-bold`}> (Today)</MyText>
            )}
          </MyText>
          <TouchableOpacity onPress={onDoctorPress}>
            <MyText style={tw`text-blue-600 dark:text-blue-400 font-medium`}>
              {token.doctor.name}
            </MyText>
          </TouchableOpacity>
          <MyText style={tw`text-gray-500 text-sm`}>
            {formatDate(token.tokenDate)}
          </MyText>
        </View>
        <View style={tw`bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full`}>
          <MyText style={tw`text-blue-800 dark:text-blue-200 text-xs font-medium`}>
            #{token.queueNumber}
          </MyText>
        </View>
      </View>
      
      {/* Current Consultation Number */}
      <View style={tw`flex-row justify-between items-center mt-2 mb-3`}>
        <MyText style={tw`text-sm text-gray-500 dark:text-gray-400`}>
          Current Running Token:
          <MyText
            style={tw`font-medium ${
              token.currentConsultationNumber !== undefined &&
              token.currentConsultationNumber >= token.queueNumber
                ? "text-green-600 dark:text-green-400"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {" "}
            #{token.currentConsultationNumber || 0}
          </MyText>
        </MyText>
      </View>
      
      {token.description && (
        <View style={tw`mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded`}>
          <MyText style={tw`text-sm text-gray-600 dark:text-gray-300`}>{token.description}</MyText>
        </View>
      )}
    </View>
  );
};

// Past Token Card Component
interface PastTokenCardProps {
  token: PastToken;
  onDoctorPress: () => void;
}

const PastTokenCard: React.FC<PastTokenCardProps> = ({ token, onDoctorPress }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Calculate how many days ago
  const daysAgo = (dateString: string) => {
    const today = new Date();
    const tokenDate = new Date(dateString);
    const diffTime = Math.abs(today.getTime() - tokenDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <View style={tw`bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm mb-4 border-l-4 border-gray-400`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <View style={tw`flex-1`}>
          <MyText style={tw`text-lg font-bold`}>Token #{token.queueNumber}</MyText>
          <MyText style={tw`text-gray-600 dark:text-gray-400`}>
            {formatDate(token.tokenDate)}
            <MyText style={tw`text-gray-500 italic`}> ({daysAgo(token.tokenDate)})</MyText>
          </MyText>
        </View>
        {token.status && (
          <View style={tw`${
            token.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900' : 
            token.status === 'MISSED' ? 'bg-red-100 dark:bg-red-900' : 
            'bg-gray-100 dark:bg-gray-900'
          } px-3 py-1 rounded-full`}>
            <MyText style={tw`${
              token.status === 'COMPLETED' ? 'text-green-800 dark:text-green-200' : 
              token.status === 'MISSED' ? 'text-red-800 dark:text-red-200' : 
              'text-gray-800 dark:text-gray-200'
            } text-xs font-medium`}>
              {token.status}
            </MyText>
          </View>
        )}
      </View>
      
      <TouchableOpacity onPress={onDoctorPress}>
        <View style={tw`flex-row items-center mt-1 mb-2`}>
          <MyText style={tw`text-sm text-gray-500 dark:text-gray-400`}>Doctor: </MyText>
          <MyText style={tw`text-blue-600 dark:text-blue-400 font-medium`}>{token.doctor.name}</MyText>
        </View>
      </TouchableOpacity>
      
      {token.description && (
        <View style={tw`mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded`}>
          <MyText style={tw`text-sm text-gray-600 dark:text-gray-300`}>{token.description}</MyText>
        </View>
      )}
      
      {token.consultationNotes && (
        <View style={tw`mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg`}>
          <MyText style={tw`text-sm font-medium mb-1 text-gray-700 dark:text-gray-300`}>Consultation Notes</MyText>
          <MyText style={tw`text-sm text-gray-600 dark:text-gray-400`}>{token.consultationNotes}</MyText>
        </View>
      )}
    </View>
  );
};
