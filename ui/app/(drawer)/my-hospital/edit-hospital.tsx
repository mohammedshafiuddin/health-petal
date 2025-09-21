import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/app/tailwind';
import { ThemedView } from '@/components/ThemedView';
import MyText from '@/components/text';
import useHideDrawerHeader from '@/hooks/useHideDrawerHeader';
import { useAuth } from '@/components/context/auth-context';
import AppContainer from '@/components/app-container';
import HospitalForm, { initialHospitalValues } from '@/components/hospital-form';

export default function EditHospitalScreen() {
  const router = useRouter();
  const { responsibilities } = useAuth();
  const hospitalId = responsibilities?.hospitalAdminFor || undefined;

  return (
    <AppContainer>

        <HospitalForm
          initialValues={{...initialHospitalValues,id:hospitalId}}
          submitButtonText='Save Changes'
          />
    </AppContainer>
  );
}