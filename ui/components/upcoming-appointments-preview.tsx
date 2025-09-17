import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';
import AppointmentCard from '@/components/appointment-card';
import { useUserUpcomingAppointments } from '@/api-hooks/user.api';

interface UpcomingAppointmentsPreviewProps {
  onSeeAllPress: () => void;
  onAppointmentPress: (appointmentId: number) => void;
}

const UpcomingAppointmentsPreview: React.FC<UpcomingAppointmentsPreviewProps> = ({ 
  onSeeAllPress,
  onAppointmentPress
}) => {
  const { data: appointments, isLoading, isError } = useUserUpcomingAppointments();

  if (isLoading) {
    return (
      <View style={tw`flex-row justify-center py-4`}>
        <ActivityIndicator size="small" color="#4f46e5" />
        <MyText style={tw`ml-2`}>Loading appointments...</MyText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={tw`bg-red-50 dark:bg-red-900 p-4 rounded-2xl mb-4`}>
        <MyText style={tw`text-red-600 dark:text-red-200 text-center`}>
          Failed to load appointments
        </MyText>
      </View>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <View style={tw`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 border border-gray-200 dark:border-gray-700 mb-4`}>
        <MyText style={tw`text-center text-gray-500 dark:text-gray-400`}>
          No upcoming appointments
        </MyText>
      </View>
    );
  }

  // Show only the first appointment in the preview
  const appointment = appointments[0];

  // Format the date and time
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });


  return (
    <View>
      <View style={tw`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 border border-gray-200 dark:border-gray-700`}>
        <View style={tw`flex-row items-center`}>
          {appointment.doctorImageUrl ? (
            <View style={tw`w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 overflow-hidden`}>
              {/* In a real implementation, you would use an Image component here */}
              {/* <Image source={{ uri: appointment.doctorImageUrl }} style={tw`w-full h-full`} /> */}
            </View>
          ) : (
            <View style={tw`w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3`}>
              <Ionicons name="person" size={24} color="#3b82f6" />
            </View>
          )}
          <View style={tw`flex-1`}>
            <MyText style={tw`font-semibold`}>{appointment.doctorName}</MyText>
            <View style={tw`flex-row items-center mt-1`}>
              <Ionicons name="calendar" size={14} color="#6b7280" />
              <MyText style={tw`text-gray-500 text-sm ml-1`}>
                {formattedDate}
              </MyText>
            </View>
            <View style={tw`flex-row items-center mt-1`}>
              <Ionicons name="location" size={14} color="#6b7280" />
              <MyText style={tw`text-gray-500 text-sm ml-1`}>{appointment.hospital}</MyText>
            </View>
            <View style={tw`flex-row items-center mt-1`}>
              <Ionicons name="ticket" size={14} color="#6b7280" />
              <MyText style={tw`text-gray-500 text-sm ml-1`}>Token #{appointment.queueNumber}</MyText>
            </View>
          </View>
          <TouchableOpacity 
            style={tw`bg-blue-500 px-3 py-1 rounded-full`}
            onPress={() => onAppointmentPress(appointment.id)}
          >
            <MyText style={tw`text-white text-xs font-medium`}>Details</MyText>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={tw`mt-3 items-center`}
        onPress={onSeeAllPress}
      >
        <MyText style={tw`text-blue-500 dark:text-blue-400 font-medium`}>
          View All Appointments →
        </MyText>
      </TouchableOpacity>
    </View>
  );
};

export default UpcomingAppointmentsPreview;