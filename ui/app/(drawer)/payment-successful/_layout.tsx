import { Stack } from 'expo-router';

export default function PaymentSuccessfulLayout() {
  return <Stack 
    screenOptions={{ headerShown: true }}
  >
    <Stack.Screen name='index'
      options={{ title: 'Payment Successful' }}
    />
    </Stack>
}
