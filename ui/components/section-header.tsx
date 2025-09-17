import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  rightComponent?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  showViewAll = true,
  onViewAllPress,
  rightComponent
}) => {
  const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
  
  return (
    <View style={tw`flex-row justify-between items-center mb-4`}>
      <MyText style={tw`text-xl font-bold text-gray-800 dark:text-white`}>{title}</MyText>
      {rightComponent ? (
        rightComponent
      ) : showViewAll && onViewAllPress ? (
        <TouchableOpacity 
          style={tw`flex-row items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900`}
          onPress={onViewAllPress}
        >
          <MyText style={[tw`text-sm font-medium mr-1`, { color: accentColor }]}>
            View All
          </MyText>
          <Ionicons 
            name="chevron-forward" 
            size={14} 
            color={accentColor} 
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SectionHeader;