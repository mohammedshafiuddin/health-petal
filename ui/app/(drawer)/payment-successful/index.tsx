import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useHideDrawerHeader from '@/hooks/useHideDrawerHeader';
import tw from '@/app/tailwind';

export default function PaymentSuccessful() {

    useHideDrawerHeader();
    const router = useRouter();
  return (
    <View style={tw`flex-1 items-center justify-center bg-green-50 `}>
      <View style={tw`bg-white rounded-full p-6 shadow mb-6`}>
        <Ionicons name="checkmark-circle" size={72} color="#22c55e" />
      </View>
      <Text style={tw`text-2xl font-bold text-green-700`}>Payment Successful!</Text>
      <Text style={tw`mt-2 text-lg text-green-600 text-center px-6`}>Your payment was processed successfully.</Text>
      <TouchableOpacity
        style={tw`mt-8 bg-green-600 px-6 py-3 rounded-full shadow`}
        onPress={() => router.push('/(drawer)/dashboard')}
      >
        <Text style={tw`text-white text-lg font-semibold`}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}
