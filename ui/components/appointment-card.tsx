import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';

interface AppointmentCardProps {
  doctorName: string;
  date: string;
  time: string;
  hospital: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  onPress: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  doctorName, 
  date, 
  time, 
  hospital,
  status,
  onPress 
}) => {
  // Status colors and labels
  const statusConfig = {
    upcoming: { 
      bgColor: 'bg-blue-500', 
      textColor: 'text-blue-500', 
      label: 'Upcoming',
      dotColor: 'bg-blue-500'
    },
    completed: { 
      bgColor: 'bg-green-500', 
      textColor: 'text-green-500', 
      label: 'Completed',
      dotColor: 'bg-green-500'
    },
    cancelled: { 
      bgColor: 'bg-red-500', 
      textColor: 'text-red-500', 
      label: 'Cancelled',
      dotColor: 'bg-red-500'
    },
    rescheduled: { 
      bgColor: 'bg-yellow-500', 
      textColor: 'text-yellow-500', 
      label: 'Rescheduled',
      dotColor: 'bg-yellow-500'
    }
  };

  const config = statusConfig[status];

  return (
    <TouchableOpacity 
      style={tw`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 border border-gray-200 dark:border-gray-700 mb-4`}
      onPress={onPress}
    >
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <MyText style={tw`text-lg font-bold text-gray-800 dark:text-white`}>
          {doctorName}
        </MyText>
        <View style={tw`flex-row items-center`}>
          <View style={[tw`w-2 h-2 rounded-full mr-2`, { backgroundColor: config.dotColor.replace('bg-', '') }]}></View>
          <MyText style={[tw`text-sm font-medium`, { color: config.textColor.replace('text-', '') }]}>
            {config.label}
          </MyText>
        </View>
      </View>
      
      <View style={tw`flex-row items-center mb-3`}>
        <Ionicons name="calendar" size={16} color="#6b7280" />
        <MyText style={tw`text-gray-600 dark:text-gray-400 text-sm ml-2`}>
          {date} at {time}
        </MyText>
      </View>
      
      <View style={tw`flex-row items-center mb-4`}>
        <Ionicons name="location" size={16} color="#6b7280" />
        <MyText style={tw`text-gray-600 dark:text-gray-400 text-sm ml-2`}>
          {hospital}
        </MyText>
      </View>
      
      <View style={tw`flex-row justify-between items-center`}>
        <TouchableOpacity 
          style={tw`flex-row items-center px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600`}
          onPress={onPress}
        >
          <Ionicons name="information-circle" size={16} color="#6b7280" />
          <MyText style={tw`text-gray-600 dark:text-gray-400 text-sm ml-1`}>Details</MyText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[tw`px-4 py-2 rounded-full`, { backgroundColor: config.bgColor.replace('bg-', '') }]}
          onPress={onPress}
        >
          <MyText style={tw`text-white font-medium text-sm`}>Manage</MyText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default AppointmentCard;