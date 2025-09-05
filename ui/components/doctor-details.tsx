import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGetUserById } from '@/api-hooks/user.api';
import { 
  useGetDoctorAvailabilityForNextDays, 
  useUpdateDoctorAvailability,
  useBookToken
} from '@/api-hooks/token.api';
import { User } from 'shared-types';
import { BottomDialog } from './dialog';
import Button from './button';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';

interface Specialization {
  id: number;
  name: string;
  description?: string;
}

// Extended user type with doctor-specific fields
interface DoctorUser extends User {
  qualifications?: string;
  specializations?: Specialization[];
  consultationFee?: number;
  dailyTokenCount?: number;
  doctorId?: number;
  role?: string;
}

interface DoctorDetailsProps {
  doctorId: number;
  onPress?: () => void;
  showFullDetails?: boolean;
  isHospitalAdmin?: boolean;
  isAdmin?: boolean;
}

const DoctorDetails: React.FC<DoctorDetailsProps> = ({ 
  doctorId, 
  onPress, 
  showFullDetails = false,
  isHospitalAdmin = false,
  isAdmin = false
}) => {
  const backgroundColor = useThemeColor({ light: 'white', dark: '#1f2937' }, 'background');
  const textColor = useThemeColor({ light: '#333', dark: '#f3f4f6' }, 'text');
  const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
  const secondaryColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'tabIconDefault');
  
  const { data: userData, isLoading, isError, error } = useGetUserById(doctorId);
  
  // Cast the User data to our DoctorUser type
  const doctorData = userData as DoctorUser | undefined;

  const Container = onPress ? TouchableOpacity : View;

  // Handle loading state
  if (isLoading) {
    return (
      <View style={[
        tw`rounded-lg mb-4 p-4 items-center justify-center`,
        { backgroundColor },
        styles.container,
        { borderColor: '#e5e7eb' }
      ]}>
        <ActivityIndicator size="large" color={accentColor} />
        <MyText style={[tw`mt-2`, { color: textColor }]}>Loading doctor details...</MyText>
      </View>
    );
  }

  // Handle error state
  if (isError || !doctorData) {
    return (
      <View style={[
        tw`rounded-lg mb-4 p-4`,
        { backgroundColor },
        styles.container,
        { borderColor: '#e5e7eb' }
      ]}>
        <MyText style={[tw`text-center`, { color: 'red' }]}>
          {error?.message || "Failed to load doctor details"}
        </MyText>
      </View>
    );
  }

  // Extract relevant data
  const { 
    name = '', 
    profilePicUrl, 
    qualifications = '', 
    specializations = [], 
    consultationFee = 0, 
    dailyTokenCount = 0 
  } = doctorData || {};

  return (
    <Container 
      style={[
        tw`rounded-lg mb-4 overflow-hidden shadow-sm`,
        { backgroundColor },
        styles.container,
        { borderColor: '#e5e7eb' }
      ]} 
      onPress={onPress}
    >
      <View style={tw`flex-row p-4`}>
        {profilePicUrl ? (
          <Image 
            source={{ uri: profilePicUrl }} 
            style={tw`h-16 w-16 rounded-full mr-3`}
          />
        ) : (
          <View style={[tw`h-16 w-16 rounded-full mr-3 items-center justify-center`, { backgroundColor: accentColor }]}>
            <MyText style={tw`text-white text-lg font-bold`}>
              {name.charAt(0).toUpperCase()}
            </MyText>
          </View>
        )}
        
        <View style={tw`flex-1 justify-center`}>
          <MyText style={[tw`text-lg font-bold`, { color: textColor }]}>
            Dr. {name}
          </MyText>
          
          {specializations && specializations.length > 0 && (
            <MyText style={[tw`text-sm`, { color: secondaryColor }]}>
              {specializations.map((spec: Specialization) => spec.name).join(', ')}
            </MyText>
          )}
          
          <MyText style={[tw`text-sm mt-1`, { color: textColor }]}>
            Consultation Fee: ₹{consultationFee}
          </MyText>
        </View>
      </View>
      
      {showFullDetails && (
        <ThemedView style={tw`px-4 pb-4 pt-0`}>
          {qualifications && (
            <View style={tw`mb-3`}>
              <MyText style={tw`text-sm font-medium mb-1`}>Qualifications</MyText>
              <MyText style={tw`text-sm`}>{qualifications}</MyText>
            </View>
          )}
          
          <View style={tw`mb-3`}>
            <MyText style={tw`text-sm font-medium mb-1`}>Specializations</MyText>
            <View>
              {specializations && specializations.length > 0 ? (
                specializations.map((spec: Specialization) => (
                  <View key={spec.id} style={tw`mb-1 flex-row`}>
                    <MyText style={tw`text-sm`}>• {spec.name}</MyText>
                    {spec.description && (
                      <MyText style={tw`text-xs text-gray-500 ml-1`}>
                        ({spec.description})
                      </MyText>
                    )}
                  </View>
                ))
              ) : (
                <MyText style={tw`text-sm text-gray-500`}>No specializations listed</MyText>
              )}
            </View>
          </View>
          
          <View style={tw`flex-row justify-between`}>
            <View>
              <MyText style={tw`text-sm font-medium`}>Consultation Fee</MyText>
              <MyText style={tw`text-sm`}>₹{consultationFee}</MyText>
            </View>
            
            <View>
              <MyText style={tw`text-sm font-medium`}>Daily Tokens</MyText>
              <MyText style={tw`text-sm`}>{dailyTokenCount} per day</MyText>
            </View>
          </View>
          
          {/* Render either availability management section (for admins) or token booking section (for regular users) */}
          {(isHospitalAdmin || isAdmin) ? (
            <DoctorAvailabilitySection 
              doctorId={doctorId} 
              defaultTokenCount={dailyTokenCount}
            />
          ) : (
            <TokenBookingSection 
              doctorId={doctorId}
              userId={useCurrentUserId() || undefined}
            />
          )}
        </ThemedView>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  }
});

export default DoctorDetails;

// Doctor Availability Section Component - only visible to hospital admins
interface DoctorAvailabilitySectionProps {
  doctorId: number;
  defaultTokenCount?: number;
}

const DoctorAvailabilitySection: React.FC<DoctorAvailabilitySectionProps> = ({
  doctorId,
  defaultTokenCount = 0
}) => {
  const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState('0');
  const [isStopped, setIsStopped] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Local state for optimistic updates
  const [localAvailabilities, setLocalAvailabilities] = useState<any[]>([]);
  
  // Fetch doctor availability for the next 3 days
  const { 
    data: availabilityData,
    isLoading: isLoadingAvailability,
    isError: isAvailabilityError,
    error: availabilityError,
    refetch
  } = useGetDoctorAvailabilityForNextDays(doctorId);
  
  // Update local state when server data changes
  useEffect(() => {
    if (availabilityData) {
      setLocalAvailabilities(availabilityData.availabilities);
    }
  }, [availabilityData]);
  
  // Setup mutation for updating availability
  const updateAvailabilityMutation = useUpdateDoctorAvailability();
  
  // Function to open dialog for updating availability
  const openUpdateDialog = (date: string, currentAvailability?: {
    totalTokenCount: number;
    isStopped: boolean;
  } | null) => {
    setSelectedDate(date);
    setTokenCount(currentAvailability ? currentAvailability.totalTokenCount.toString() : defaultTokenCount?.toString() || '0');
    setIsStopped(currentAvailability ? currentAvailability.isStopped : false);
    setDialogOpen(true);
  };
  
  // Function to close dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedDate(null);
  };
  
  // Function to update availability
  const updateAvailability = () => {
    if (!selectedDate) return;
    
    const newTokenCount = parseInt(tokenCount, 10) || 0;
    
    // Update local state first for immediate UI feedback
    setLocalAvailabilities(current => 
      current.map(item => {
        if (item.date === selectedDate) {
          // Calculate new available tokens
          const filledCount = item.availability ? item.availability.filledTokenCount : 0;
          const availableTokens = Math.max(0, newTokenCount - filledCount);
          
          // Create a new availability object with updated values
          const updatedAvailability = item.availability ? {
            ...item.availability,
            totalTokenCount: newTokenCount,
            isStopped: isStopped,
            availableTokens
          } : {
            id: 0, // Temporary ID, will be replaced after server response
            doctorId,
            date: selectedDate,
            totalTokenCount: newTokenCount,
            filledTokenCount: 0,
            consultationsDone: 0,
            isStopped: isStopped,
            availableTokens: newTokenCount
          };
          
          return {
            ...item,
            availability: updatedAvailability
          };
        }
        return item;
      })
    );
    
    // Close dialog immediately for better UX
    closeDialog();
    
    // Set success message
    setSuccessMessage('Updating availability...');
    
    // Get the current item from local state
    const currentItem = localAvailabilities.find(item => item.date === selectedDate);
    
    // Now send the update to the server
    const update = {
      doctorId,
      date: selectedDate,
      tokenCount: newTokenCount,
      isStopped,
      consultationsDone: currentItem?.availability ? currentItem.availability.consultationsDone : 0
    };
    
    updateAvailabilityMutation.mutate([update], {
      onSuccess: () => {
        setSuccessMessage('Availability updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        console.error('Error updating availability:', error);
        Alert.alert('Update Failed', 'Failed to update doctor availability. Please try again.');
        // Revert to server data on error
        refetch();
      }
    });
  };
  
  // Function to toggle stop status
  const toggleStopStatus = (date: string, availability: any) => {
    const newIsStopped = !availability.isStopped;
    
    // Update local state first for immediate UI feedback
    setLocalAvailabilities(current => 
      current.map(item => {
        if (item.date === date && item.availability) {
          // Create a new availability object with updated isStopped
          const updatedAvailability = {
            ...item.availability,
            isStopped: newIsStopped
          };
          
          return {
            ...item,
            availability: updatedAvailability
          };
        }
        return item;
      })
    );
    
    // Set success message immediately for user feedback
    setSuccessMessage(`${newIsStopped ? 'Stopping' : 'Starting'} token booking...`);
    
    // Now send the update to the server
    const update = {
      doctorId,
      date,
      tokenCount: availability.totalTokenCount,
      isStopped: newIsStopped,
      consultationsDone: availability.consultationsDone
    };
    
    updateAvailabilityMutation.mutate([update], {
      onSuccess: () => {
        setSuccessMessage(`Token booking ${newIsStopped ? 'stopped' : 'started'} successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        console.error('Error updating availability:', error);
        Alert.alert('Update Failed', 'Failed to update doctor availability. Please try again.');
        // Revert to server data on error
        refetch();
      }
    });
  };
  
  // Function to adjust consultations done count
  const adjustConsultationsDone = (date: string, availability: any, increment: boolean) => {
    // Calculate new consultations done count
    let newConsultationsDone = availability.consultationsDone + (increment ? 1 : -1);
    
    // Ensure consultations done count doesn't go below 0
    if (newConsultationsDone < 0) newConsultationsDone = 0;
    
    // If nothing changed, exit early
    if (newConsultationsDone === availability.consultationsDone) return;
    
    // Update local state first for immediate UI feedback
    setLocalAvailabilities(current => 
      current.map(item => {
        if (item.date === date && item.availability) {
          // Create a new availability object with updated consultationsDone
          const updatedAvailability = {
            ...item.availability,
            consultationsDone: newConsultationsDone
          };
          
          return {
            ...item,
            availability: updatedAvailability
          };
        }
        return item;
      })
    );
    
    // Set success message immediately for user feedback
    setSuccessMessage('Updating consultations done count...');
    
    // Now send the update to the server
    const update = {
      doctorId,
      date,
      tokenCount: availability.totalTokenCount,
      filledTokenCount: availability.filledTokenCount,
      consultationsDone: newConsultationsDone,
      isStopped: availability.isStopped
    };
    
    updateAvailabilityMutation.mutate([update], {
      onSuccess: () => {
        setSuccessMessage('Consultations done count updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        console.error('Error updating consultations done count:', error);
        Alert.alert('Update Failed', 'Failed to update consultations done count. Please try again.');
        // Revert to server data on error
        refetch();
      }
    });
  };
  
  // Function to adjust filled token count
  const adjustFilledTokens = (date: string, availability: any, increment: boolean) => {
    // Calculate new filled token count
    let newFilledCount = availability.filledTokenCount + (increment ? 1 : -1);
    
    // Ensure filled count doesn't go below 0 or above total
    if (newFilledCount < 0) newFilledCount = 0;
    if (newFilledCount > availability.totalTokenCount) newFilledCount = availability.totalTokenCount;
    
    // If nothing changed, exit early
    if (newFilledCount === availability.filledTokenCount) return;
    
    // Update local state first for immediate UI feedback
    setLocalAvailabilities(current => 
      current.map(item => {
        if (item.date === date && item.availability) {
          // Create a new availability object with updated filledTokenCount
          const updatedAvailability = {
            ...item.availability,
            filledTokenCount: newFilledCount,
            // Recalculate available tokens
            availableTokens: item.availability.totalTokenCount - newFilledCount
          };
          
          return {
            ...item,
            availability: updatedAvailability
          };
        }
        return item;
      })
    );
    
    // Set success message immediately for user feedback
    setSuccessMessage('Updating filled token count...');
    
    // Now send the update to the server
    const update = {
      doctorId,
      date,
      tokenCount: availability.totalTokenCount,
      filledTokenCount: newFilledCount,
      isStopped: availability.isStopped
    };
    
    updateAvailabilityMutation.mutate([update], {
      onSuccess: () => {
        setSuccessMessage('Filled token count updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        console.error('Error updating filled token count:', error);
        Alert.alert('Update Failed', 'Failed to update filled token count. Please try again.');
        // Revert to server data on error
        refetch();
      }
    });
  };
  
  return (
    <>
      {/* Availability Section */}
      <View style={tw`mt-4`}>
        <MyText style={tw`text-sm font-medium mb-2`}>Availability Management</MyText>
        
        {isLoadingAvailability ? (
          <View style={tw`items-center py-2`}>
            <ActivityIndicator size="small" color={accentColor} />
            <MyText style={tw`mt-1 text-sm`}>Loading availability...</MyText>
          </View>
        ) : isAvailabilityError ? (
          <MyText style={tw`text-red-500 text-sm`}>
            Failed to load availability information.
          </MyText>
        ) : (
          <View>
            {localAvailabilities.map((item, index) => (
              <View key={index} style={tw`mb-3 border-b border-gray-200 pb-2`}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <MyText style={tw`font-medium`}>
                    {new Date(item.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </MyText>
                  
                  <TouchableOpacity
                    style={tw`bg-blue-500 px-3 py-1 rounded-md`}
                    onPress={() => openUpdateDialog(
                      item.date,
                      item.availability ? {
                        totalTokenCount: item.availability.totalTokenCount,
                        isStopped: item.availability.isStopped
                      } : null
                    )}
                  >
                    <MyText style={tw`text-white font-medium text-sm`}>
                      Update
                    </MyText>
                  </TouchableOpacity>
                </View>
                
                {item.availability ? (
                  <View>
                    <View style={tw`flex-row justify-between mb-2`}>
                      <View style={tw`flex-row`}>
                        <MyText style={tw`text-sm mr-4`}>
                          Total: {item.availability.totalTokenCount}
                        </MyText>
                        <MyText style={tw`text-sm`}>
                          Available: {item.availability.availableTokens}
                        </MyText>
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => toggleStopStatus(item.date, item.availability)}
                        style={[
                          tw`px-2 py-1 rounded-md`,
                          item.availability.isStopped ? tw`bg-green-500` : tw`bg-red-500`
                        ]}
                      >
                        <MyText style={tw`text-white text-xs font-medium`}>
                          {item.availability.isStopped ? 'Start' : 'Stop'}
                        </MyText>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Filled Token Count with adjustment buttons */}
                    <View style={tw`flex-row items-center mb-2`}>
                      <MyText style={tw`text-sm mr-2`}>Filled:</MyText>
                      <TouchableOpacity
                        onPress={() => adjustFilledTokens(item.date, item.availability, false)}
                        style={tw`bg-gray-300 w-7 h-7 rounded-full items-center justify-center mr-2`}
                      >
                        <MyText style={tw`text-lg font-bold`}>-</MyText>
                      </TouchableOpacity>
                      
                      <MyText style={tw`text-sm mx-2 font-medium`}>
                        {item.availability.filledTokenCount}
                      </MyText>
                      
                      <TouchableOpacity
                        onPress={() => adjustFilledTokens(item.date, item.availability, true)}
                        style={tw`bg-gray-300 w-7 h-7 rounded-full items-center justify-center ml-2`}
                      >
                        <MyText style={tw`text-lg font-bold`}>+</MyText>
                      </TouchableOpacity>
                      
                      <MyText style={tw`text-xs text-gray-500 ml-4`}>
                        (Adjust for offline registrations)
                      </MyText>
                    </View>
                    
                    {/* Consultations Done Count with adjustment buttons */}
                    <View style={tw`flex-row items-center mb-2`}>
                      <MyText style={tw`text-sm mr-2`}>Consultations:</MyText>
                      <TouchableOpacity
                        onPress={() => adjustConsultationsDone(item.date, item.availability, false)}
                        style={tw`bg-gray-300 w-7 h-7 rounded-full items-center justify-center mr-2`}
                      >
                        <MyText style={tw`text-lg font-bold`}>-</MyText>
                      </TouchableOpacity>
                      
                      <MyText style={tw`text-sm mx-2 font-medium`}>
                        {item.availability.consultationsDone}
                      </MyText>
                      
                      <TouchableOpacity
                        onPress={() => adjustConsultationsDone(item.date, item.availability, true)}
                        style={tw`bg-gray-300 w-7 h-7 rounded-full items-center justify-center ml-2`}
                      >
                        <MyText style={tw`text-lg font-bold`}>+</MyText>
                      </TouchableOpacity>
                      
                      <MyText style={tw`text-xs text-gray-500 ml-4`}>
                        (Track completed consultations)
                      </MyText>
                    </View>
                    
                    {item.availability.isStopped && (
                      <View style={tw`mt-1`}>
                        <MyText style={tw`text-red-500 text-sm`}>
                          Tokens are currently stopped for this day
                        </MyText>
                      </View>
                    )}
                  </View>
                ) : (
                  <MyText style={tw`text-red-500 text-sm`}>
                    Not Available
                  </MyText>
                )}
              </View>
            ))}
            
            {successMessage ? (
              <MyText style={tw`text-green-500 text-sm text-center mt-2`}>
                {successMessage}
              </MyText>
            ) : null}
          </View>
        )}
      </View>
      
      {/* Availability Update Dialog */}
      <BottomDialog open={dialogOpen} onClose={closeDialog}>
        <View style={tw`p-4`}>
          <MyText style={tw`text-lg font-bold mb-4 text-center`}>
            Update Availability
          </MyText>
          
          {selectedDate && (
            <MyText style={tw`mb-4 text-center`}>
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </MyText>
          )}
          
          <View style={tw`mb-4`}>
            <MyText style={tw`mb-2`}>Token Count:</MyText>
            <TextInput
              style={tw`border rounded-md px-3 py-2 mb-2`}
              value={tokenCount}
              onChangeText={setTokenCount}
              keyboardType="number-pad"
              maxLength={3}
            />
            
            <TouchableOpacity 
              style={tw`flex-row items-center mt-2`}
              onPress={() => setIsStopped(!isStopped)}
            >
              <View style={[
                tw`w-5 h-5 rounded border mr-2 items-center justify-center`,
                isStopped ? tw`bg-blue-500 border-blue-500` : tw`border-gray-400`
              ]}>
                {isStopped && (
                  <MyText style={tw`text-white text-xs font-bold`}>✓</MyText>
                )}
              </View>
              <MyText>Stop tokens for this day</MyText>
            </TouchableOpacity>
          </View>
          
          <View style={tw`flex-row justify-between`}>
            <Button
              style={[tw`flex-1 mr-2`, { backgroundColor: '#9ca3af' }]}
              onPress={closeDialog}
            >
              Cancel
            </Button>
            <Button
              style={tw`flex-1 ml-2`}
              onPress={updateAvailability}
              disabled={updateAvailabilityMutation.isPending}
            >
              {updateAvailabilityMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </View>
        </View>
      </BottomDialog>
    </>
  );
};

// Token Booking Section for regular users
interface TokenBookingSectionProps {
  doctorId: number;
  userId?: number;
}

const TokenBookingSection: React.FC<TokenBookingSectionProps> = ({
  doctorId,
  userId
}) => {
  const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expectedQueueNumber, setExpectedQueueNumber] = useState<number>(0);
  
  // Fetch doctor availability for the next 3 days
  const { 
    data: availabilityData,
    isLoading: isLoadingAvailability,
    isError: isAvailabilityError,
    error: availabilityError,
    refetch: refetchAvailability
  } = useGetDoctorAvailabilityForNextDays(doctorId);
  
  // Setup mutation for booking token
  const { 
    mutate: submitTokenBooking,
    isPending: isBookingToken,
    isError: isBookingError,
    error: bookingError
  } = useBookToken();
  
  // Function to open dialog for booking token
  const openBookingDialog = (date: string, nextQueueNumber: number) => {
    setSelectedDate(date);
    setDescription('');
    setDialogOpen(true);
    
    // Store the expected queue number in state to display in the dialog
    setExpectedQueueNumber(nextQueueNumber);
  };
  
  // Function to close dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedDate(null);
  };
  
  // Function to book token
  const handleTokenBooking = () => {
    if (!selectedDate || !userId) return;
    
    const booking = {
      doctorId,
      userId,
      tokenDate: selectedDate,
      description: description || undefined
    };
    
    submitTokenBooking(booking, {
      onSuccess: (data) => {
        setSuccessMessage(`Token booked successfully! Your queue number is ${data.token.queueNum}`);
        setTimeout(() => setSuccessMessage(''), 5000);
        closeDialog();
        refetchAvailability();
      },
      onError: (error: any) => {
        console.error('Error booking token:', error);
        Alert.alert('Booking Failed', error.response?.data?.message || 'Failed to book token. Please try again.');
      }
    });
  };
  
  return (
    <>
      {/* Availability Section */}
      <View style={tw`mt-4`}>
        <MyText style={tw`text-sm font-medium mb-2`}>Book Appointment</MyText>
        
        {isLoadingAvailability ? (
          <View style={tw`items-center py-2`}>
            <ActivityIndicator size="small" color={accentColor} />
            <MyText style={tw`mt-1 text-sm`}>Loading availability...</MyText>
          </View>
        ) : isAvailabilityError ? (
          <MyText style={tw`text-red-500 text-sm`}>
            Failed to load availability information.
          </MyText>
        ) : (
          <View>
            {availabilityData?.availabilities.map((item, index) => (
              <View key={index} style={tw`mb-3 border-b border-gray-200 pb-2`}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <MyText style={tw`font-medium`}>
                    {new Date(item.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </MyText>
                  
                  {item.availability && item.availability.availableTokens > 0 && !item.availability.isStopped ? (
                    <TouchableOpacity
                      style={tw`bg-green-500 px-3 py-1 rounded-md`}
                      onPress={() => openBookingDialog(
                        item.date, 
                        item.availability ? item.availability.filledTokenCount + 1 : 1
                      )}
                      disabled={!userId}
                    >
                      <MyText style={tw`text-white font-medium text-sm`}>
                        Book Token
                      </MyText>
                    </TouchableOpacity>
                  ) : (
                    <View style={tw`bg-gray-400 px-3 py-1 rounded-md`}>
                      <MyText style={tw`text-white font-medium text-sm`}>
                        Unavailable
                      </MyText>
                    </View>
                  )}
                </View>
                
                {item.availability ? (
                  <View>
                    <View style={tw`flex-row flex-wrap`}>
                      <MyText style={tw`text-sm mr-4`}>
                        Available: {item.availability.availableTokens}/{item.availability.totalTokenCount}
                      </MyText>
                      <MyText style={tw`text-sm`}>
                        Current token: #{item.availability.filledTokenCount}
                      </MyText>
                    </View>
                    
                    <View style={tw`flex-row flex-wrap mt-1`}>
                      <MyText style={tw`text-sm`}>
                        Consultations completed: {item.availability.consultationsDone}
                      </MyText>
                    </View>
                    
                    {item.availability.isStopped && (
                      <View style={tw`mt-1`}>
                        <MyText style={tw`text-red-500 text-sm`}>
                          Tokens are currently stopped for this day
                        </MyText>
                      </View>
                    )}
                    
                    {item.availability.availableTokens === 0 && !item.availability.isStopped && (
                      <View style={tw`mt-1`}>
                        <MyText style={tw`text-red-500 text-sm`}>
                          No more tokens available for this day
                        </MyText>
                      </View>
                    )}
                  </View>
                ) : (
                  <MyText style={tw`text-red-500 text-sm`}>
                    Not Available
                  </MyText>
                )}
              </View>
            ))}
            
            {!userId && (
              <MyText style={tw`text-red-500 text-sm text-center mt-2`}>
                Please login to book a token
              </MyText>
            )}
            
            {successMessage ? (
              <MyText style={tw`text-green-500 text-sm text-center mt-2`}>
                {successMessage}
              </MyText>
            ) : null}
          </View>
        )}
      </View>
      
      {/* Token Booking Dialog */}
      <BottomDialog open={dialogOpen} onClose={closeDialog}>
        <View style={tw`p-4`}>
          <MyText style={tw`text-lg font-bold mb-4 text-center`}>
            Book Appointment
          </MyText>
          
          {selectedDate && (
            <MyText style={tw`mb-4 text-center`}>
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </MyText>
          )}
          
          <View style={tw`mb-4`}>
            <View style={tw`flex-row justify-center mb-3 bg-blue-50 py-2 rounded-md`}>
              <MyText style={tw`text-blue-800 font-medium`}>
                Your queue number will be: #{expectedQueueNumber}
              </MyText>
            </View>
            
            <MyText style={tw`mb-2`}>Description (optional):</MyText>
            <TextInput
              style={tw`border rounded-md px-3 py-2 mb-2 min-h-[80px]`}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your symptoms or reason for visit"
              multiline
              textAlignVertical="top"
            />
          </View>
          
          <View style={tw`flex-row justify-between`}>
            <Button
              style={[tw`flex-1 mr-2`, { backgroundColor: '#9ca3af' }]}
              onPress={closeDialog}
            >
              Cancel
            </Button>
            <Button
              style={tw`flex-1 ml-2`}
              onPress={handleTokenBooking}
              disabled={isBookingToken || !userId}
            >
              {isBookingToken ? 'Booking...' : 'Book Token'}
            </Button>
          </View>
        </View>
      </BottomDialog>
    </>
  );
};
