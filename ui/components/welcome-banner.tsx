import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MyText from '@/components/text';
import tw from '@/app/tailwind';

interface WelcomeBannerProps {
  userName: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
  userName 
}) => {
  return (
    <LinearGradient 
      colors={['#2563eb', '#7e22ce']} 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 0 }}
      style={tw`rounded-b-3xl p-6 mb-6 mx-4 shadow-lg`}
    >
      <MyText style={tw`text-2xl font-bold text-white mb-2`}>
        Welcome Back, {userName.split(' ')[0]}!
      </MyText>
      <MyText style={tw`text-white text-opacity-90`}>Your health is our priority</MyText>
    </LinearGradient>
  );
};

export default WelcomeBanner;