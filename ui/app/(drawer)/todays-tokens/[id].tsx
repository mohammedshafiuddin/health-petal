import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import AppContainer from '@/components/app-container';
import MyText from '@/components/text';
import { useDoctorTodaysTokens } from '@/api-hooks/token.api';
import { DoctorTodayToken } from 'shared-types';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';
import DoctorTokenCard from './DoctorTokenCard';

export default function DoctorTokensPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const doctorId = typeof id === 'string' ? parseInt(id) : 0;

  const { data, isLoading, isError, error, refetch } = useDoctorTodaysTokens(doctorId);

  return (
    <AppContainer>
      <ScrollView style={tw`flex-1`}>
        <View style={tw`p-4`}>
          <MyText style={tw`text-2xl font-bold mb-2`}>
            {data?.doctorName || 'Doctor'}'s Tokens
          </MyText>
          <MyText style={tw`text-gray-500 mb-4`}>
            {data?.date}
          </MyText>

          {isLoading ? (
            <View style={tw`items-center justify-center py-8`}>
              <ActivityIndicator size="large" color="#4361ee" />
              <MyText style={tw`mt-4 text-gray-500`}>Loading tokens...</MyText>
            </View>
          ) : isError ? (
            <View style={tw`bg-red-50 p-4 rounded-lg mb-4`}>
              <MyText style={tw`text-red-600`}>
                Error loading tokens: {error instanceof Error ? error.message : 'Unknown error'}
              </MyText>
              <TouchableOpacity style={tw`bg-blue-500 px-4 py-2 rounded-lg mt-4 self-start`} onPress={() => refetch()}>
                <MyText style={tw`text-white font-medium`}>Retry</MyText>
              </TouchableOpacity>
            </View>
          ) : data?.tokens && data.tokens.length > 0 ? (
            data.tokens.map((token: DoctorTodayToken) => (
              <DoctorTokenCard key={token.id} token={token} />
            ))
          ) : (
            <View style={tw`bg-gray-100 p-6 rounded-lg items-center`}>
              <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
              <MyText style={tw`text-center text-gray-500 mt-2`}>
                No tokens available for this doctor today.
              </MyText>
            </View>
          )}
        </View>
      </ScrollView>
    </AppContainer>
  );
}
