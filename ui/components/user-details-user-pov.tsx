import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/app/tailwind';
import DoctorDetails from '@/components/doctor-details';
import { ThemedView } from '@/components/ThemedView';
import MyText from '@/components/text';
import MyButton from '@/components/button';
import Button from '@/components/button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGetDoctorAvailabilityForNextDays, useBookToken } from "@/api-hooks/token.api";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { BottomDialog } from "@/components/dialog";
import AppContainer from './app-container';
import { useInitiateTokenPayment, useMarkPaymentSuccess, useMarkPaymentFailure } from '@/api-hooks/payment.api';
import { usePhonepeSdk } from '@/hooks/usePhonepeSdk';

interface UserDoctorDetailsProps {
  doctorId: number;
}

// Token Booking Section for regular users
interface TokenBookingSectionProps {
  doctorId: number;
  userId?: number | null;
}

const TokenBookingSection: React.FC<TokenBookingSectionProps> = ({
  doctorId,
  userId,
}) => {
  const accentColor = useThemeColor(
    { light: "#4f46e5", dark: "#818cf8" },
    "tint"
  );

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expectedQueueNumber, setExpectedQueueNumber] = useState<number>(0);

  // Fetch doctor availability for the next 3 days
  const {
    data: availabilityData,
    isLoading: isLoadingAvailability,
    isError: isAvailabilityError,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useGetDoctorAvailabilityForNextDays(doctorId);

  // Setup mutation for booking token
  const {
    mutate: submitTokenBooking,
    isPending: isBookingToken,
    isError: isBookingError,
    error: bookingError,
  } = useBookToken();

  const { 
    mutate: initiateTokenPayment, 
    data: paymentData,
    isPending: isInitiatingPayment,
    isError: isPaymentError,
    error: paymentError,
  } = useInitiateTokenPayment();

  const { startTransaction, isLoading: isPhonepeLoading, isError: isPhonepeError, creds } = usePhonepeSdk();
  const router = useRouter();
  const { mutate: markSuccess } = useMarkPaymentSuccess();
  const { mutate: markFailure } = useMarkPaymentFailure();

  // Function to initiate PhonePe transaction
  const handlePhonepeTransaction = async (orderId: string, token: string, paymentId: string | number) => {
    try {
      const response = await startTransaction(orderId, token);

      // If transaction is successful, call markSuccess
      if (response && response.status === 'SUCCESS') {
        markSuccess(paymentId, {
          onSuccess: () => {
            router.push('/(drawer)/payment-successful');
          }
        });
      } else {
        markFailure(paymentId, {
          onSuccess: () => {
            router.push('/(drawer)/payment-failed');
          }
        });
      }

    } catch (error) {
      // On error, call markFailure
      if (paymentId) {
        markFailure(paymentId, {
          onSuccess: () => {
            router.push('/(drawer)/payment-failed');
          }
        });
      }
      console.error('PhonePe transaction error:', error);
    }
  };
  

  // Function to open dialog for booking token
  const openBookingDialog = (date: string, nextQueueNumber: number) => {
    setSelectedDate(date);
    setDescription("");
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
      date: selectedDate,
      description: description || undefined,
    };

    // submitTokenBooking(booking, {
    initiateTokenPayment(booking, {
      onSuccess: (data) => {
        handlePhonepeTransaction(data.orderId, data.token, data.merchantOrderId);
        
        setSuccessMessage(
          `Token booked successfully! Your queue number is`
        );
        setTimeout(() => setSuccessMessage(""), 5000);
        closeDialog();
        refetchAvailability();
      },
      onError: (error: any) => {
        console.error("Error booking token:", error);
        Alert.alert(
          "Booking Failed",
          error.response?.data?.message ||
            "Failed to book token. Please try again."
        );
      },
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
              <View key={index} style={tw`mb-4 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <MyText style={tw`font-bold text-lg text-indigo-700 dark:text-indigo-300`}>
                    {new Date(item.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </MyText>

                  {item.availability &&
                  item.availability.availableTokens > 0 &&
                  !item.availability.isStopped ? (
                    <TouchableOpacity
                      style={tw`bg-green-500 px-4 py-2 rounded-xl shadow`}
                      onPress={() =>
                        openBookingDialog(
                          item.date,
                          item.availability
                            ? item.availability.filledTokenCount + 1
                            : 1
                        )
                      }
                      disabled={!userId}
                    >
                      <MyText style={tw`text-white font-bold text-base`}>
                        Book Token
                      </MyText>
                    </TouchableOpacity>
                  ) : (
                    <View style={tw`bg-gray-400 px-4 py-2 rounded-xl`}>
                      <MyText style={tw`text-white font-bold text-base`}>
                        Unavailable
                      </MyText>
                    </View>
                  )}
                </View>

                {item.availability ? (
                  <View>
                    <View style={tw`flex-row flex-wrap items-center mb-2`}>
                      <View style={tw`bg-indigo-100 dark:bg-indigo-900 px-4 py-2 rounded-xl shadow mr-4 flex-row items-center`}>
                        <MyText style={tw`text-indigo-700 dark:text-indigo-300 font-bold text-base mr-2`}>
                          Current Token #
                        </MyText>
                        <MyText style={tw`text-indigo-900 dark:text-indigo-100 font-extrabold text-2xl`}>
                          {item.availability.filledTokenCount}
                        </MyText>
                      </View>
                    </View>
                    <View style={tw`flex-row flex-wrap items-center mb-2`}>
                      <MyText style={tw`text-sm text-gray-700 dark:text-gray-300 mr-4`}>
                        Available: {item.availability.availableTokens}/{item.availability.totalTokenCount}
                      </MyText>
                    </View>

                    <View style={tw`flex-row flex-wrap mt-1`}>
                      <MyText style={tw`text-sm text-gray-700 dark:text-gray-300`}>
                        Consultations completed: {item.availability.consultationsDone}
                      </MyText>
                    </View>

                    {item.availability.isStopped && (
                      <View style={tw`mt-2`}>
                        <MyText style={tw`text-red-500 text-base font-semibold`}>
                          Tokens are currently stopped for this day
                        </MyText>
                      </View>
                    )}

                    {item.availability.availableTokens === 0 &&
                      !item.availability.isStopped && (
                        <View style={tw`mt-2`}>
                          <MyText style={tw`text-red-500 text-base font-semibold`}>
                            No more tokens available for this day
                          </MyText>
                        </View>
                      )}
                  </View>
                ) : (
                  <MyText style={tw`text-red-500 text-base font-semibold`}>
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
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </MyText>
          )}

          <View style={tw`mb-4`}>
            <View
              style={tw`flex-row justify-center mb-3 bg-blue-50 py-2 rounded-md`}
            >
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
              style={[tw`flex-1 mr-2`, { backgroundColor: "#9ca3af" }]}
              onPress={closeDialog}
            >
              Cancel
            </Button>
            <Button
              style={tw`flex-1 ml-2`}
              onPress={handleTokenBooking}
              disabled={isBookingToken || !userId}
            >
              {isBookingToken ? "Booking..." : "Book Token"}
            </Button>
          </View>
        </View>
      </BottomDialog>
    </>
  );
};

export default function UserDetailsUserPov({ doctorId }: UserDoctorDetailsProps) {
  const router = useRouter();
  const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
  const {userId} = useCurrentUserId();
  
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
    <AppContainer>
      <DoctorDetails 
        doctorId={doctorId}
        showFullDetails={true}
      />
      
      <TokenBookingSection 
        doctorId={doctorId}
        userId={userId}
      />
    </AppContainer>
  );
}