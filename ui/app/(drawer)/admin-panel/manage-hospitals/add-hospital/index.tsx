import MyText from '@/components/text';
import React from 'react';
import { ScrollView, View } from 'react-native';
import tw from '@/app/tailwind';
import HospitalForm from '@/components/hospital-form';
import AppContainer from '@/components/app-container';

function AddHospital() {
  return (
    <AppContainer> 

        <MyText style={tw`text-2xl font-bold mb-4`}>Add New Hospital</MyText>
        <HospitalForm submitButtonText="Add Hospital" />

    </AppContainer>
  );
}

export default AddHospital;
