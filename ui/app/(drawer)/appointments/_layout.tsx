import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/lib/theme-colors';

export default function AppointmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: colors.blue1,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Find Doctors',
          headerShown: false
        }} 
      />
    </Stack>
  );
}