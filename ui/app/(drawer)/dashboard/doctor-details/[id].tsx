import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import tw from '@/app/tailwind';
import { ThemedView } from '@/components/ThemedView';
import MyText from '@/components/text';
import { useRouter } from 'expo-router';
import useHideDrawerHeader from '@/hooks/useHideDrawerHeader';
import { useRoles } from '@/components/context/roles-context';
import { ROLE_NAMES } from '@/lib/constants';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useIsHospitalAdmin } from '@/components/context/auth-context';
import UserDetailsAdminPov from '@/components/user-details-admin-pov';
import UserDetailsUserPov from '@/components/user-details-user-pov';

export default function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const doctorId = parseInt(id as string);
  const router = useRouter();
  useHideDrawerHeader();
  const roles = useRoles();
  const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint');
  
  // Check for admin privileges
  const isAdmin = roles?.includes(ROLE_NAMES.ADMIN);
  const isHospitalAdmin = roles?.includes(ROLE_NAMES.HOSPITAL_ADMIN);
  
  // If roles are still loading, show a loading indicator
  if (!roles) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color={accentColor} />
        <MyText style={tw`mt-4`}>Loading...</MyText>
      </ThemedView>
    );
  }

  // Determine which component to render based on user role
  if (isAdmin || isHospitalAdmin) {
    return <UserDetailsAdminPov doctorId={doctorId} />;
  } else {
    return <UserDetailsUserPov doctorId={doctorId} />;
  }
}
