import { View, Text } from 'react-native';
import useHideDrawerHeader from '@/hooks/useHideDrawerHeader';

export default function PaymentSuccessful() {

    useHideDrawerHeader();
  return (
    <View className="flex-1 items-center justify-center bg-green-50">
      <Text className="text-2xl font-bold text-green-700">Payment Successful!</Text>
      <Text className="mt-2 text-lg text-green-600">Your payment was processed successfully.</Text>
    </View>
  );
}
