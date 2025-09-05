import MyText from '@/components/text';
import React from 'react';
import { ScrollView, View } from 'react-native';
import tw from '@/app/tailwind';
import { useRouter } from 'expo-router';
import AddBusinessUserForm from '@/components/add-business-user-form';

function AddBusinessUser() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={tw`flex-grow p-5`} style={tw`bg-white`}>
      <View style={tw`flex-col gap-4`}>
        <MyText style={tw`text-2xl font-bold mb-4 text-blue-900`}>Add New Business User</MyText>
        <AddBusinessUserForm onSuccess={() => router.push("/(drawer)/admin-panel/manage-business-users")} />
      </View>
    </ScrollView>
  );
}

export default AddBusinessUser;
