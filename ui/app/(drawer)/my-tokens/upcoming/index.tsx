import React from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/app/tailwind';
import MyText from '@/components/text';
import { ThemedView } from '@/components/ThemedView';
import { useRoles } from '@/components/context/roles-context';
import { ROLE_NAMES } from '@/lib/constants';
import { useMyUpcomingTokens } from '@/api-hooks/token.api';
import { UpcomingToken } from '../../../../../shared-types';
import { ErrorToast } from '@/services/toaster';

export default function UpcomingTokensScreen() {
  const roles = useRoles();
  const isGenUser = roles?.includes(ROLE_NAMES.GENERAL_USER);
  const router = useRouter();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Fetch upcoming tokens using our hook
  const { 
    data: tokensData,
    isLoading,
    isError,
    error,
    refetch
  } = useMyUpcomingTokens();
  
  // Handle pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      ErrorToast('Failed to refresh tokens');
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  
  // Navigate to doctor details
  const navigateToDoctorDetails = (doctorId: number) => {
    router.push(`/(drawer)/dashboard/doctor-details/${doctorId}` as any);
  };

  // If user doesn't have the gen_user role, show unauthorized message
  if (!isGenUser) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center p-4`}>
        <MyText style={tw`text-red-500 text-lg mb-4`}>
          Unauthorized Access
        </MyText>
        <View style={tw`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md`}>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={tw`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6`}>
          <MyText style={tw`text-2xl font-bold mb-4`}>Upcoming Tokens</MyText>
          <MyText style={tw`mb-4`}>
            View your upcoming doctor appointments.
          </MyText>
          
          {isLoading ? (
            <View style={tw`items-center justify-center py-8`}>
              <ActivityIndicator size="large" color="#0891b2" />
              <MyText style={tw`mt-4 text-gray-500`}>Loading your tokens...</MyText>
            </View>
          ) : isError ? (
            <View style={tw`bg-red-50 dark:bg-red-900 p-4 rounded-lg mb-4`}>
              <MyText style={tw`text-red-600 dark:text-red-200`}>
                Error loading tokens: {error?.message || 'Unknown error'}
              </MyText>
            </View>
          ) : tokensData?.tokens && tokensData.tokens.length > 0 ? (
            <View>
              {tokensData.tokens.map((token) => (
                <TokenCard 
                  key={token.id} 
                  token={token} 
                  onDoctorPress={() => navigateToDoctorDetails(token.doctor.id)} 
                />
              ))}
            </View>
          ) : (
            <View style={tw`mt-4 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg items-center`}>
              <MyText style={tw`text-center text-gray-500 dark:text-gray-400 mb-2`}>
                No upcoming tokens available.
              </MyText>
              <TouchableOpacity 
                onPress={() => router.push('/(drawer)/dashboard')}
                style={tw`bg-blue-500 px-4 py-2 rounded-lg mt-2`}
              >
                <MyText style={tw`text-white font-medium`}>
                  Book a Consultation
                </MyText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Token Card Component
interface TokenCardProps {
  token: UpcomingToken;
  onDoctorPress: () => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, onDoctorPress }) => {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
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
    <View style={tw`bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm mb-4 border-l-4 ${isToday(token.tokenDate) ? 'border-green-500' : 'border-blue-500'}`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <View style={tw`flex-1`}>
          <MyText style={tw`text-lg font-bold`}>Token #{token.queueNumber}</MyText>
          <MyText style={tw`text-gray-600 dark:text-gray-400`}>
            {formatDate(token.tokenDate)}
            {isToday(token.tokenDate) && <MyText style={tw`text-green-500 font-bold`}> (Today)</MyText>}
          </MyText>
        </View>
        <View style={tw`bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full`}>
          <MyText style={tw`text-blue-800 dark:text-blue-200 text-xs font-medium`}>
            #{token.queueNumber}
          </MyText>
        </View>
      </View>
      
      <TouchableOpacity onPress={onDoctorPress}>
        <View style={tw`flex-row items-center mt-1 mb-2`}>
          <MyText style={tw`text-sm text-gray-500 dark:text-gray-400`}>Doctor: </MyText>
          <MyText style={tw`text-blue-600 dark:text-blue-400 font-medium`}>{token.doctor.name}</MyText>
        </View>
      </TouchableOpacity>
      
      {/* Current Consultation Number */}
      <View style={tw`flex-row justify-between items-center mt-2 mb-2`}>
        <View style={tw`flex-1`}>
          <MyText style={tw`text-sm text-gray-500 dark:text-gray-400`}>
            Current Consultation: 
            <MyText style={tw`font-medium ${
              token.currentConsultationNumber !== undefined && 
              token.currentConsultationNumber >= token.queueNumber ? 
              'text-green-600 dark:text-green-400' : 
              'text-gray-600 dark:text-gray-300'
            }`}> #{token.currentConsultationNumber || 0}</MyText>
          </MyText>
        </View>
        <View style={tw`flex-row items-center`}>
          <View style={tw`h-2 w-2 rounded-full ${
            token.currentConsultationNumber !== undefined && 
            token.currentConsultationNumber >= token.queueNumber ? 
            'bg-green-500' : 
            token.currentConsultationNumber !== undefined && 
            token.currentConsultationNumber + 3 >= token.queueNumber ? 
            'bg-yellow-500' : 
            'bg-gray-500'
          } mr-1`} />
          <MyText style={tw`text-xs ${
            token.currentConsultationNumber !== undefined && 
            token.currentConsultationNumber >= token.queueNumber ? 
            'text-green-600 dark:text-green-400' : 
            token.currentConsultationNumber !== undefined && 
            token.currentConsultationNumber + 3 >= token.queueNumber ? 
            'text-yellow-600 dark:text-yellow-400' : 
            'text-gray-500 dark:text-gray-400'
          }`}>
            {token.currentConsultationNumber !== undefined && 
              token.currentConsultationNumber >= token.queueNumber ? 
              'Your turn' : 
              token.currentConsultationNumber !== undefined && 
              token.currentConsultationNumber + 3 >= token.queueNumber ? 
              'Coming up soon' : 
              `${token.queueNumber - (token.currentConsultationNumber || 0)} ahead of you`
            }
          </MyText>
        </View>
      </View>
      
      {token.description && (
        <View style={tw`mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded`}>
          <MyText style={tw`text-sm text-gray-600 dark:text-gray-300`}>{token.description}</MyText>
        </View>
      )}
    </View>
  );
};
