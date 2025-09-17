
import { useGetUserById } from '@/api-hooks/user.api';
import { useEffect } from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MyText from '@/components/text';
import tw from '@/app/tailwind';

export default function MyProfile() {
  // Placeholder userId - replace with your actual user ID, or get it dynamically
  const userId = 1;

  const { data: user, isLoading, isError } = useGetUserById(userId);

  useEffect(() => {
    if (user) {
      console.log('User data:', user);
    }

    if (isError) {
      console.error('Error fetching user data');
    }
  }, [user, isError]);

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <View style={tw`absolute top-0 left-0 right-0 bottom-0`}>
        <View style={tw`flex-1 bg-green-100`} />
        <View style={tw`flex-1 bg-white opacity-60`} />
      </View>
      <View style={tw`bg-white rounded-2xl shadow-lg p-8 w-80 items-center`}>
        {isLoading && <MyText style={tw`text-center`}>Loading user data...</MyText>}
        {isError && <MyText style={tw`text-center text-red-500`}>Error loading user data.</MyText>}
        {user && (
          <View style={tw`items-center`}>
            <View style={tw`mb-4 relative`}>
              <Image
                style={tw`h-32 w-32 rounded-full border-4 border-green-300`}
                source={{
                  uri: user.profilePicUrl || 'https://via.placeholder.com/100',
                }}
              />
              <View style={tw`absolute right-0 bottom-0 bg-green-500 rounded-full p-2`}> 
                <Ionicons name="person" size={24} color="#fff" />
              </View>
            </View>
            <MyText style={tw`text-2xl font-extrabold mb-1 text-green-700`}>{user.name}</MyText>
            <MyText style={tw`text-base text-gray-500 mb-4`}>{user.email}</MyText>
            <View style={tw`w-full bg-gray-50 rounded-xl p-4 mt-2 shadow`}> 
              <MyText style={tw`text-gray-700 mb-2`}>
                <Ionicons name="call" size={16} color="#22c55e" /> <MyText style={tw`font-semibold`}>Mobile:</MyText> {user.mobile}
              </MyText>
              <MyText style={tw`text-gray-700 mb-2`}>
                <Ionicons name="id-card" size={16} color="#22c55e" /> <MyText style={tw`font-semibold`}>ID:</MyText> {user.id}
              </MyText>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}