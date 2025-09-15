import { View, Text } from 'react-native';
import useDrawerHeader from '@/hooks/useHideDrawerHeader';

export default function PaymentFailed() {
    useDrawerHeader();
  return (
    <View className="flex-1 items-center justify-center bg-red-50">
      <Text className="text-2xl font-bold text-red-700">Payment Failed</Text>
      <Text className="mt-2 text-lg text-red-600">There was an issue processing your payment. Please try again.</Text>
    </View>
  );
}
