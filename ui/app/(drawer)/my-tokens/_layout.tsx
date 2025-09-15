import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme-colors';

export default function MyTokensLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.blue1,
        tabBarInactiveTintColor: colors.gray1,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Tokens',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: false,
          href: null, // Hide this tab from the tab bar but keep the screen
        }}
      />
      <Tabs.Screen
        name="upcoming/index"
        options={{
          title: 'Upcoming',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          headerTitle: 'Upcoming Tokens',
        }}
      />
      <Tabs.Screen
        name="past/index"
        options={{
          title: 'Past',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
          headerTitle: 'Past Tokens',
        }}
      />
    </Tabs>
  );
}
