import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  bgColor: string;
  onPress?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconColor, 
  bgColor,
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={tw`flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700 mx-1`}
      onPress={onPress}
    >
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <View style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: bgColor }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
      </View>
      
      <MyText style={tw`text-2xl font-bold text-gray-800 dark:text-white`}>
        {value}
      </MyText>
      
      <MyText style={tw`text-gray-600 dark:text-gray-400 text-sm mt-1`}>
        {title}
      </MyText>
    </TouchableOpacity>
  );
};

export default StatsCard;