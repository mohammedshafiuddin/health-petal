import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface HospitalCardProps {
  id: number;
  name: string;
  address: string;
  description?: string;
  employeeCount?: number;
  rating?: number;
  onPress: () => void;
}

const HospitalCard: React.FC<HospitalCardProps> = ({ 
  id, 
  name, 
  address, 
  description, 
  employeeCount, 
  rating = 4.5,
  onPress 
}) => {
  const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
  
  return (
    <TouchableOpacity 
      style={tw`bg-white dark:bg-gray-800 rounded-2xl shadow-md mb-4 border border-gray-200 dark:border-gray-700 overflow-hidden`}
      onPress={onPress}
    >
      {/* Hospital Header with Accent */}
      <View style={tw`flex-row`}>
        <View style={tw`w-2 bg-blue-500`} />
        <View style={tw`flex-1 p-5`}>
          {/* Hospital Name and Rating */}
          <View style={tw`flex-row justify-between items-start mb-2`}>
            <MyText style={tw`text-xl font-bold text-gray-800 dark:text-white flex-1 mr-2`}>
              {name}
            </MyText>
            <View style={tw`flex-row items-center bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full`}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <MyText style={tw`text-yellow-800 dark:text-yellow-200 text-sm font-bold ml-1`}>
                {rating}
              </MyText>
            </View>
          </View>
          
          {/* Address */}
          <View style={tw`flex-row items-center mt-2`}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <MyText style={tw`text-gray-600 dark:text-gray-400 text-sm ml-2`} numberOfLines={1}>
              {address}
            </MyText>
          </View>
          
          {/* Description */}
          {description && (
            <MyText 
              style={tw`text-gray-600 dark:text-gray-400 text-sm mt-3`} 
              numberOfLines={2}
            >
              {description}
            </MyText>
          )}
          
          {/* Stats */}
          <View style={tw`flex-row justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="people" size={16} color="#6b7280" />
              <MyText style={tw`text-gray-600 dark:text-gray-400 text-sm ml-2`}>
                {employeeCount || 0} specialists
              </MyText>
            </View>
            
            <View style={tw`flex-row`}>
              <View style={tw`w-2 h-2 bg-green-500 rounded-full mr-1`}></View>
              <View style={tw`w-2 h-2 bg-green-500 rounded-full mr-1`}></View>
              <View style={tw`w-2 h-2 bg-gray-300 rounded-full mr-1`}></View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HospitalCard;