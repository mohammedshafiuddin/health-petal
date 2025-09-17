import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';

interface HealthTipCardProps {
  title: string;
  description: string;
  icon: string;
  onPress?: () => void;
}

const HealthTipCard: React.FC<HealthTipCardProps> = ({ 
  title, 
  description, 
  icon,
  onPress 
}) => {
  return (
    <LinearGradient 
      colors={['#10b981', '#0d9488']} 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 0 }}
      style={tw`rounded-2xl p-5 shadow-md mb-4`}
    >
      <View style={tw`flex-row items-start`}>
        <Ionicons name={icon as any} size={24} color="white" style={tw`mr-3 mt-1`} />
        <View style={tw`flex-1`}>
          <MyText style={tw`text-white font-bold text-lg mb-2`}>{title}</MyText>
          <MyText style={tw`text-green-50 text-opacity-90 mb-3`}>
            {description}
          </MyText>
          <TouchableOpacity onPress={onPress}>
            <MyText style={tw`text-white font-medium text-sm`}>Learn More →</MyText>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default HealthTipCard;