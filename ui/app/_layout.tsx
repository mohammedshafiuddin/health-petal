import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/utils/queryClient";
import { AuthProvider } from "@/components/context/auth-context";
import { RolesProvider } from "@/components/context/roles-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RolesProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </RolesProvider>
          </AuthProvider>
        </QueryClientProvider>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
