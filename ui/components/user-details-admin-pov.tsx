import DateTimePickerMod from '@/components/date-time-picker';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import TextInput from '@/components/textinput';
import { useRouter } from 'expo-router';
import tw from '@/app/tailwind';
import DoctorDetails from '@/components/doctor-details';
import { ThemedView } from '@/components/ThemedView';
import MyText from '@/components/text';
import MyButton from '@/components/button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGetDoctorAvailabilityForNextDays, useUpdateDoctorAvailability } from "@/api-hooks/token.api";
import { useGetUserById, useUpdateBusinessUser } from "@/api-hooks/user.api";
import { BottomDialog } from "@/components/dialog";
import { User } from 'shared-types';
import AppContainer from './app-container';
import DatePicker from '@/components/date-picker';
import { useMarkDoctorLeave, useGetDoctorUpcomingLeaves } from '@/api-hooks/doctor.api';
import Checkbox from './checkbox';
import { useUpdateDoctorInning } from '@/api-hooks/doctor.api';

// Extended type for doctor
interface DoctorUser extends User {
  qualifications?: string;
  // specializations?: Array<{id: number, name: string, description?: string}>;
  consultationFee?: number;
  dailyTokenCount?: number;
  doctorId?: number;
  role?: string;
  hospital?: string;
}

interface AdminDoctorDetailsProps {
  doctorId: number;
}


// Doctor Availability Section Component - only visible to hospital admins
interface DoctorAvailabilitySectionProps {
  doctorId: number;
  defaultTokenCount?: number;
}

const DoctorAvailabilitySection: React.FC<DoctorAvailabilitySectionProps> = ({
  doctorId,
  defaultTokenCount = 0,
}) => {
  const accentColor = useThemeColor(
    { light: "#4f46e5", dark: "#818cf8" },
    "tint"
  );

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState("0");
  const [isStopped, setIsStopped] = useState(false);
  const [isOnLeave, setIsOneLeave] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Local state for optimistic updates
  const [localAvailabilities, setLocalAvailabilities] = useState<any[]>([]);

  // Fetch doctor availability for the next 3 days
  const {
    data: availabilityData,
    isLoading,
    isError,
  } = useGetDoctorAvailabilityForNextDays(doctorId);

  // Update local state when data is fetched
  useEffect(() => {
    if (availabilityData && availabilityData.availabilities) {
      setLocalAvailabilities(availabilityData.availabilities);
    }
  }, [availabilityData]);

  // Setup mutation for updating availability
  const updateAvailabilityMutation = useUpdateDoctorAvailability();

  // Function to open dialog for updating availability
  const openUpdateDialog = (
    date: string,
    currentAvailability?: {
      totalTokenCount: number;
      isStopped: boolean;
      isLeave: boolean;
    } | null
  ) => {
    setSelectedDate(date);
    setTokenCount(
      currentAvailability
        ? currentAvailability.totalTokenCount.toString()
        : defaultTokenCount?.toString() || "0"
    );

    
    setIsStopped(currentAvailability ? currentAvailability.isStopped : false);
    setIsOneLeave(currentAvailability ? currentAvailability.isLeave : false);
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
    setLocalAvailabilities((current) =>
      current.map((item) => {
        if (item.date === selectedDate) {
          // Calculate new available tokens
          const filledCount = item.availability
            ? item.availability.filledTokenCount
            : 0;
          const availableTokens = Math.max(0, newTokenCount - filledCount);

          // Create a new availability object with updated values
          const updatedAvailability = item.availability
            ? {
                ...item.availability,
                totalTokenCount: newTokenCount,
                isStopped: isStopped,
                availableTokens,
                isLeave: isOnLeave,
              }
            : {
                id: 0, // Temporary ID, will be replaced after server response
                doctorId,
                date: selectedDate,
                totalTokenCount: newTokenCount,
                filledTokenCount: 0,
                consultationsDone: 0,
                isStopped: isStopped,
                availableTokens: newTokenCount,
                isLeave: isOnLeave,
              };

          return {
            ...item,
            availability: updatedAvailability,
          };
        }
        return item;
      })
    );

    // Close dialog immediately for better UX
    closeDialog();

    // Set success message
    setSuccessMessage("Updating availability...");

    // Get the current item from local state
    const currentItem = localAvailabilities.find(
      (item) => item.date === selectedDate
    );

    // Now send the update to the server
    const update = {
      doctorId,
      date: selectedDate,
      tokenCount: newTokenCount,
      isStopped,
      consultationsDone: currentItem?.availability
        ? currentItem.availability.consultationsDone
        : 0,
      isLeave: isOnLeave
    };

    updateAvailabilityMutation.mutate([update], {
      onSuccess: () => {
        setSuccessMessage("Availability updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error) => {
        console.error("Error updating availability:", error);
        Alert.alert(
          "Error",
          "Failed to update availability. Please try again."
        );
        setSuccessMessage("");
      },
    });
  };

  // Function to adjust the filled tokens count
  const adjustFilledTokens = (
    date: string,
    availability: any,
    increment: boolean
  ) => {
    if (!availability) return;

    // Calculate the new count
    const currentCount = availability.filledTokenCount;
    const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);

    // Don't exceed total tokens
    if (newCount > availability.totalTokenCount) {
      Alert.alert(
        "Limit Reached",
        "Cannot exceed the total token count. Increase total tokens first."
      );
      return;
    }

    // Update local state for immediate feedback
    setLocalAvailabilities((current) =>
      current.map((item) => {
        if (item.date === date && item.availability) {
          const updatedAvailability = {
            ...item.availability,
            filledTokenCount: newCount,
            availableTokens: item.availability.totalTokenCount - newCount,
          };

          return {
            ...item,
            availability: updatedAvailability,
          };
        }
        return item;
      })
    );

    // Set success message
    setSuccessMessage("Updating filled tokens...");

    // Send update to server
    const update = {
      doctorId,
      date: date,
      tokenCount: availability.totalTokenCount,
      isStopped: availability.isStopped,
      filledTokenCount: newCount,
      consultationsDone: availability.consultationsDone,
    };

    updateAvailabilityMutation.mutate([update], {
      onSuccess: () => {
        setSuccessMessage("Filled tokens updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error) => {
        console.error("Error updating filled tokens:", error);
        Alert.alert(
          "Error",
          "Failed to update filled tokens. Please try again."
        );
        setSuccessMessage("");
      },
    });
  };

  // Function to adjust the consultations done count
  const adjustConsultationsDone = (
    date: string,
    availability: any,
    increment: boolean
  ) => {
    if (!availability) return;

    // Calculate the new count
    const currentCount = availability.consultationsDone;
    const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);

    // Don't exceed filled tokens
    if (newCount > availability.filledTokenCount) {
      Alert.alert(
        "Limit Reached",
        "Consultations done cannot exceed filled tokens."
      );
      return;
    }

    // Update local state for immediate feedback
    setLocalAvailabilities((current) =>
      current.map((item) => {
        if (item.date === date && item.availability) {
          const updatedAvailability = {
            ...item.availability,
            consultationsDone: newCount,
          };

          return {
            ...item,
            availability: updatedAvailability,
          };
        }
        return item;
      })
    );

    // Set success message
    setSuccessMessage("Updating consultations done...");

    // Send update to server
    const update = {
      doctorId,
      date: date,
      tokenCount: availability.totalTokenCount,
      isStopped: availability.isStopped,
      filledTokenCount: availability.filledTokenCount,
      consultationsDone: newCount,
    };

    updateAvailabilityMutation.mutate([update], {
      onSuccess: () => {
        setSuccessMessage("Consultations done updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error) => {
        console.error("Error updating consultations done:", error);
        Alert.alert(
          "Error",
          "Failed to update consultations done. Please try again."
        );
        setSuccessMessage("");
      },
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Check if a date is today
  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <View style={tw`p-4 items-center`}>
        <ActivityIndicator size="large" color={accentColor} />
        <MyText style={tw`mt-2`}>Loading availability...</MyText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={tw`p-4`}>
        <MyText style={tw`text-red-500`}>
          Failed to load availability. Please try again later.
        </MyText>
      </View>
    );
  }
  

  return (
    <>
      <View style={tw`mt-4`}>
        <MyText style={tw`text-lg font-bold mb-4`}>
          Manage Availability
        </MyText>

        {localAvailabilities.map((item) => (
          <View
            key={item.date}

            style={tw`mb-4 p-3 rounded-lg ${
              isToday(item.date)
                ? "bg-yellow-50 dark:bg-yellow-900/30"
                : "bg-gray-50 dark:bg-gray-800/50"
            }`}
          >
            <View style={tw`flex-row justify-between items-start`}>
              <View>
                <MyText style={tw`font-medium`}>{formatDate(item.date)}</MyText>
                {isToday(item.date) && (
                  <MyText style={tw`text-xs text-green-600 font-medium`}>
                    Today
                  </MyText>
                )}
                {item.availability?.isLeave && (
                  <MyText style={tw`text-xs text-red-500 font-bold mt-1`}>
                    On Leave
                  </MyText>
                )}
              </View>

              <TouchableOpacity
                style={tw`bg-blue1 px-3 py-1 rounded-md`}
                onPress={() =>
                  openUpdateDialog(item.date, item.availability)
                }
              >
                <MyText style={tw`text-white text-xs font-medium`}>
                  {item.availability ? "Update" : "Add"}
                </MyText>
              </TouchableOpacity>
            </View>

            <View style={tw`mt-2`}>
              {item.availability ? (
                <View>
                  <View style={tw`flex-row justify-between mb-2`}>
                    <MyText style={tw`text-sm`}>
                      Total Tokens: {item.availability.totalTokenCount}
                    </MyText>
                    <MyText style={tw`text-sm`}>
                      Available: {item.availability.availableTokens}
                    </MyText>
                  </View>
                  {!item.availability.isLeave && (
                    <>
                      {/* Filled Tokens Count with adjustment buttons */}
                      <View style={tw`flex-row items-center mb-2`}>
                        <MyText style={tw`text-sm mr-2`}>Filled Tokens:</MyText>
                        <TouchableOpacity
                          onPress={() =>
                            adjustFilledTokens(item.date, item.availability, false)
                          }
                          style={tw`bg-gray-300 w-7 h-7 rounded-full items-center justify-center mr-2`}
                        >
                          <MyText style={tw`text-lg font-bold`}>-</MyText>
                        </TouchableOpacity>
                        <MyText style={tw`text-sm mx-2 font-medium`}>
                          {item.availability.filledTokenCount}
                        </MyText>
                        <TouchableOpacity
                          onPress={() =>
                            adjustFilledTokens(item.date, item.availability, true)
                          }
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
                          onPress={() =>
                            adjustConsultationsDone(
                              item.date,
                              item.availability,
                              false
                            )
                          }
                          style={tw`bg-gray-300 w-7 h-7 rounded-full items-center justify-center mr-2`}
                        >
                          <MyText style={tw`text-lg font-bold`}>-</MyText>
                        </TouchableOpacity>
                        <MyText style={tw`text-sm mx-2 font-medium`}>
                          {item.availability.consultationsDone}
                        </MyText>
                        <TouchableOpacity
                          onPress={() =>
                            adjustConsultationsDone(
                              item.date,
                              item.availability,
                              true
                            )
                          }
                          style={tw`bg-gray-300 w-7 h-7 rounded-full items-center justify-center ml-2`}
                        >
                          <MyText style={tw`text-lg font-bold`}>+</MyText>
                        </TouchableOpacity>
                        <MyText style={tw`text-xs text-gray-500 ml-4`}>
                          (Track completed consultations)
                        </MyText>
                      </View>
                    </>
                  )}
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
          </View>
        ))}

        {successMessage ? (
          <MyText style={tw`text-green-500 text-sm text-center mt-2`}>
            {successMessage}
          </MyText>
        ) : null}
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
                weekday: "long",
                month: "long",
                day: "numeric",
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

            <View style={tw`flex-row items-center mb-4`}>
              <Checkbox checked={isStopped} onPress={() => setIsStopped(!isStopped)} />
              <MyText>Stop accepting new tokens for this day</MyText>
            </View>
            <View style={tw`flex-row items-center mb-4`}>
              <Checkbox checked={isOnLeave} onPress={() => setIsOneLeave(!isOnLeave)} />
              <MyText>Is On Leave</MyText>
            </View>
          </View>

          <View style={tw`flex-row justify-between`}>
            <MyButton
              style={[tw`flex-1 mr-2`, { backgroundColor: "#9ca3af" }]}
              onPress={closeDialog}
              textContent="Cancel"
            />
            <MyButton
              style={tw`flex-1 ml-2`}
              onPress={updateAvailability}
              textContent="Update"
            />
          </View>
        </View>
      </BottomDialog>
    </>
  );
};

// Leave Management Section - only visible to hospital admins
interface LeaveManagementSectionProps {
  doctorId: number;
}

const LeaveManagementSection: React.FC<LeaveManagementSectionProps> = ({ doctorId }) => {
  const { data: upcomingLeaves, isLoading: isLeavesLoading, isError: isLeavesError } = useGetDoctorUpcomingLeaves(doctorId);
  const accentColor = useThemeColor(
    { light: "#4f46e5", dark: "#818cf8" },
    "tint"
  );

  // State for holiday dialog
  const { mutate: markDoctorLeave, isPending: isMarkingLeave } = useMarkDoctorLeave();
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [holidayStartDate, setHolidayStartDate] = useState<Date | null>(null);
  const [holidayEndDate, setHolidayEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Create holiday
  const createHoliday = () => {
    if (!holidayStartDate || !holidayEndDate) {
      Alert.alert("Invalid dates", "Please select both start and end dates.");
      return;
    }

    if (holidayEndDate < holidayStartDate) {
      Alert.alert("Invalid dates", "End date must be after start date.");
      return;
    }

    markDoctorLeave(
      {
        doctorId,
        startDate: holidayStartDate.toISOString().slice(0, 10),
        endDate: holidayEndDate.toISOString().slice(0, 10),
      },
      {
        onSuccess: () => {
          setSuccessMessage("Holiday created successfully");
          setTimeout(() => setSuccessMessage(""), 3000);
          setHolidayDialogOpen(false);
        },
        onError: (error: any) => {
          Alert.alert("Error", error?.message || "Failed to create holiday.");
        },
      }
    );
  };

  return (
    <>
      <View style={tw`mt-8 p-4 bg-white rounded-xl shadow-md`}>
        <MyText style={tw`text-lg font-bold mb-2`}>Manage Doctor's Leaves</MyText>
        <MyButton
          textContent="Create Holiday"
          style={tw`mb-2`}
          onPress={() => setHolidayDialogOpen(true)}
        />
        <MyText style={tw`text-base font-semibold mt-4 mb-2`}>Upcoming Leaves (Next 1 Month):</MyText>
        {isLeavesLoading && <MyText>Loading...</MyText>}
        {isLeavesError && <MyText style={tw`text-red-500`}>Failed to load leaves.</MyText>}
        {!isLeavesLoading && upcomingLeaves?.leaveRanges?.length === 0 && (
          <MyText>No upcoming leaves.</MyText>
        )}
        {!isLeavesLoading && upcomingLeaves?.leaveRanges?.length > 0 && (
          <View>
            {upcomingLeaves.leaveRanges.map((range: { startDate: string, endDate: string }, idx: number) => (
              <View key={idx} style={tw`mb-2 p-2 bg-gray-100 rounded-md`}>
                <MyText style={tw`text-sm`}>From: <MyText style={tw`font-bold`}>{range.startDate}</MyText></MyText>
                <MyText style={tw`text-sm`}>To: <MyText style={tw`font-bold`}>{range.endDate}</MyText></MyText>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Holiday Dialog */}
      <BottomDialog open={holidayDialogOpen} onClose={() => setHolidayDialogOpen(false)}>
        <View style={tw`p-4`}>
          <MyText style={tw`text-lg font-bold mb-4 text-center`}>Create Holiday</MyText>
          <View style={tw`mb-4`}>
            <MyText style={tw`mb-2`}>Start Date:</MyText>
              <View style={tw`mb-2`}>
                <MyText style={tw`mb-1`}>{holidayStartDate ? holidayStartDate.toLocaleDateString() : 'Select start date'}</MyText>
                <DatePicker
                  value={holidayStartDate || new Date()}
                  setValue={setHolidayStartDate}
                  placeholder="Select start date"
                  showLabel={false}
                />
              </View>
          </View>
          <View style={tw`mb-4`}>
            <MyText style={tw`mb-2`}>End Date:</MyText>
              <View style={tw`mb-2`}>
                <MyText style={tw`mb-1`}>{holidayEndDate ? holidayEndDate.toLocaleDateString() : 'Select end date'}</MyText>
                <DatePicker
                  value={holidayEndDate || new Date()}
                  setValue={setHolidayEndDate}
                  placeholder="Select end date"
                  showLabel={false}
                />
              </View>
          </View>
          <View style={tw`flex-row justify-between mt-4`}>
            <MyButton
              style={[tw`flex-1 mr-2`, { backgroundColor: '#9ca3af' }]}
              onPress={() => setHolidayDialogOpen(false)}
              textContent="Cancel"
            />
            <MyButton
              style={tw`flex-1 ml-2`}
              onPress={createHoliday}
              textContent={isMarkingLeave ? "Creating..." : "Create"}
            />
          </View>

          {successMessage ? (
            <MyText style={tw`text-green-500 text-sm text-center mt-2`}>
              {successMessage}
            </MyText>
          ) : null}
        </View>
      </BottomDialog>
    </>
  );
};

export default function UserDetailsAdminPov({ doctorId }: AdminDoctorDetailsProps) {
  // OfficeInningSection: Pause/Resume Consultations
  const OfficeInningSection: React.FC<{ doctorId: number }> = ({ doctorId }) => {
    const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pauseReason, setPauseReason] = useState("");
    const [pauseDate, setPauseDate] = useState<Date | null>(null);
    const { mutate: updateDoctorInning, isPending: isUpdatingInning } = useUpdateDoctorInning();
    const { data: availabilityData, isLoading: isAvailabilityLoading } = useGetDoctorAvailabilityForNextDays(doctorId);

    // Find today's availability
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAvailability = availabilityData?.availabilities?.find((a: any) => a.date === todayStr)?.availability;
    const isPaused = todayAvailability?.isPaused === true;

    const handlePause = () => {
      setDialogOpen(true);
    };
    const handleResume = () => {
      updateDoctorInning({
        doctorId,
        date: todayStr,
        isPaused: false,
      }, {
        onSuccess: () => {
          Alert.alert('Consultations Resumed', 'Doctor consultations have been resumed.');
        },
        onError: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to resume consultations.');
        },
      });
    };
    const handleDialogClose = () => {
      setDialogOpen(false);
      setPauseReason("");
      setPauseDate(null);
    };
    const handleDialogSubmit = () => {
      updateDoctorInning({
        doctorId,
        date: todayStr,
        isPaused: true,
        pauseReason,
      }, {
        onSuccess: () => {
          Alert.alert('Consultations Paused', 'Doctor consultations have been paused.');
          handleDialogClose();
        },
        onError: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to pause consultations.');
        },
      });
    };
    return (
      <View style={tw`mt-6 p-4 bg-gray-100 rounded-lg`}>
        <MyText style={tw`text-lg font-bold mb-2`}>
          {isPaused ? 'Doctor Out' : 'Doctor In'}
        </MyText>
        {isPaused && todayAvailability?.pauseReason && (
           <MyText style={tw`text-sm text-red-500 mb-2`}>Reason: {todayAvailability.pauseReason}</MyText>
         )}
        <View style={tw`flex-row justify-between gap-4`}>
          <MyButton
            style={tw`flex-1`}
            onPress={handlePause}
            textContent="Mark Pause Consultations"
            disabled={isPaused || isAvailabilityLoading}
          />
          <MyButton
            style={tw`flex-1`}
            onPress={handleResume}
            textContent="Resume Consultations"
            disabled={!isPaused || isAvailabilityLoading}
          />
        </View>
        <BottomDialog open={dialogOpen} onClose={handleDialogClose}>
          <View style={tw`p-4`}>
            <MyText style={tw`text-base font-semibold mb-2`}>Pause Consultations</MyText>
            <MyText style={tw`mb-1`}>Reason for pause:</MyText>
            <TextInput
              value={pauseReason}
              onChangeText={setPauseReason}
              placeholder="Enter reason"
              topLabel={undefined}
              fullWidth
              style={tw`mb-3`}
            />
            {/* Date & Time picker removed as per request. Only reason input remains. */}
            <View style={tw`flex-row mt-4 justify-between`}>
              <MyButton
                style={[tw`flex-1 mr-2`, { backgroundColor: '#9ca3af' }]}
                onPress={handleDialogClose}
                textContent="Cancel"
              />
              <MyButton
                style={[tw`flex-1 ml-2`, { backgroundColor: accentColor }]}
                onPress={handleDialogSubmit}
                textContent="Pause"
              />
            </View>
          </View>
        </BottomDialog>
      </View>
    );
  };
  const router = useRouter();
  const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [holidayStartDate, setHolidayStartDate] = useState<Date | null>(null);
  const [holidayEndDate, setHolidayEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  if (isNaN(doctorId)) {
    return (
      <AppContainer>
        <ThemedView style={tw`flex-1 p-4 justify-center items-center`}>
          <MyText style={tw`text-red-500 text-lg text-center mb-4`}>Invalid doctor ID</MyText>
          <MyButton
            onPress={() => router.back()}
            textContent="Go Back"
          />
        </ThemedView>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <DoctorDetails 
        doctorId={doctorId}
        showFullDetails={true}
        isAdminPoV={true}
      />
      <OfficeInningSection doctorId={doctorId} />
      <DoctorAvailabilitySection doctorId={doctorId} />
      <LeaveManagementSection doctorId={doctorId} />
      {/* Doctor's Leave Management Section */}
    </AppContainer>
  );
}
