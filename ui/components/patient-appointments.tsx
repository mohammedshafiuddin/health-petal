import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import tw from '@/app/tailwind';
import MyText from '@/components/text';
import { ThemedView } from '@/components/ThemedView';
import { useMyUpcomingTokens, usePastTokens } from '@/api-hooks/token.api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {}

const PatientAppointments: React.FC<Props> = (props) => {
  const {} = props;
  const router = useRouter();
  
  // Fetch patient's upcoming and past tokens
  const {
    data: upcomingTokensData,
    isLoading: isLoadingUpcoming,
    refetch: refetchUpcoming
  } = useMyUpcomingTokens();
  
  const {
    data: pastTokensData,
    isLoading: isLoadingPast,
    refetch: refetchPast
  } = usePastTokens();
  
  // State for confirmation dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  
  // Handle cancel appointment
  const handleCancelAppointment = (tokenId: number) => {
    setSelectedTokenId(tokenId);
    setShowCancelDialog(true);
  };
  
  // Confirm cancellation
  const confirmCancellation = () => {
    if (selectedTokenId) {
      // TODO: Implement API call to cancel appointment
      Alert.alert(
        'Appointment Cancelled',
        'Your appointment has been successfully cancelled.',
        [{ text: 'OK', onPress: () => {
          setShowCancelDialog(false);
          setSelectedTokenId(null);
          // Refresh the data
          refetchUpcoming();
          refetchPast();
        }}]
      );
    }
  };
  
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
    <ThemedView style={tw`flex-1`}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
        {/* Header */}
        <View style={tw`mb-6`}>
          <MyText style={tw`text-2xl font-bold`}>My Appointments</MyText>
          <MyText style={tw`text-gray-500`}>Manage your doctor consultations</MyText>
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
              <MyText style={tw`text-gray-500`}>Loading appointments...</MyText>
            </View>
          ) : upcomingTokensData?.tokens && upcomingTokensData.tokens.length > 0 ? (
            <View>
              {upcomingTokensData.tokens.map((token) => (
                <View 
                  key={token.id} 
                  style={tw`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4 border-l-4 ${
                    isToday(token.tokenDate) ? 'border-green-500' : 'border-blue-500'
                  }`}
                >
                  <View style={tw`flex-row justify-between items-start mb-2`}>
                    <View style={tw`flex-1`}>
                      <MyText style={tw`text-lg font-bold`}>
                        Token #{token.queueNumber}
                        {isToday(token.tokenDate) && (
                          <MyText style={tw`text-green-500 font-bold`}> (Today)</MyText>
                        )}
                      </MyText>
                      <MyText style={tw`text-gray-600 dark:text-gray-400`}>
                        {token.doctor.name}
                      </MyText>
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
                    <View style={tw`mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded`}>
                      <MyText style={tw`text-sm text-gray-700 dark:text-gray-300`}>
                        <MyText style={tw`font-medium`}>Description: </MyText>
                        {token.description}
                      </MyText>
                    </View>
                  )}
                  
                  <View style={tw`flex-row justify-end mt-3`}>
                    <TouchableOpacity
                      onPress={() => handleCancelAppointment(token.id)}
                      style={tw`bg-red-100 dark:bg-red-900 px-4 py-2 rounded-lg`}
                    >
                      <MyText style={tw`text-red-700 dark:text-red-200 font-medium`}>
                        Cancel Appointment
                      </MyText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={tw`bg-gray-100 dark:bg-gray-800 p-6 rounded-lg items-center`}>
              <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
              <MyText style={tw`text-gray-500 mt-2 text-center`}>
                No upcoming appointments
              </MyText>
              <TouchableOpacity
                onPress={() => router.push('/(drawer)/dashboard')}
                style={tw`bg-blue-500 px-4 py-2 rounded-lg mt-4`}
              >
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
              <MyText style={tw`text-gray-500`}>Loading appointment history...</MyText>
            </View>
          ) : pastTokensData?.tokens && pastTokensData.tokens.length > 0 ? (
            <View>
              {pastTokensData.tokens.map((token) => (
                <View 
                  key={token.id} 
                  style={tw`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4 border-l-4 border-gray-300`}
                >
                  <View style={tw`flex-row justify-between items-start mb-2`}>
                    <View style={tw`flex-1`}>
                      <MyText style={tw`text-lg font-bold`}>
                        Token #{token.queueNumber}
                      </MyText>
                      <MyText style={tw`text-gray-600 dark:text-gray-400`}>
                        {token.doctor.name}
                      </MyText>
                      <MyText style={tw`text-gray-500 text-sm`}>
                        {formatDate(token.tokenDate)}
                      </MyText>
                    </View>
                    <View style={tw`bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full`}>
                      <MyText style={tw`text-gray-800 dark:text-gray-200 text-xs font-medium`}>
                        {token.status || 'COMPLETED'}
                      </MyText>
                    </View>
                  </View>
                  
                  {token.description && (
                    <View style={tw`mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded`}>
                      <MyText style={tw`text-sm text-gray-700 dark:text-gray-300`}>
                        <MyText style={tw`font-medium`}>Description: </MyText>
                        {token.description}
                      </MyText>
                    </View>
                  )}
                </View>
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
      </ScrollView>
      
      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4`}>
          <View style={tw`bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm`}>
            <MyText style={tw`text-xl font-bold mb-2`}>Confirm Cancellation</MyText>
            <MyText style={tw`text-gray-600 dark:text-gray-400 mb-6`}>
              Are you sure you want to cancel this appointment?
            </MyText>
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                onPress={() => {
                  setShowCancelDialog(false);
                  setSelectedTokenId(null);
                }}
                style={tw`bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg flex-1 mr-2`}
              >
                <MyText style={tw`text-gray-800 dark:text-gray-200 font-medium text-center`}>
                  No
                </MyText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmCancellation}
                style={tw`bg-red-500 px-4 py-2 rounded-lg flex-1 ml-2`}
              >
                <MyText style={tw`text-white font-medium text-center`}>
                  Yes, Cancel
                </MyText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
};

export default PatientAppointments;