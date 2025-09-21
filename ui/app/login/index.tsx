import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import * as SecureStore from "expo-secure-store";

import { useLogin, LoginResponse } from "@/api-hooks/auth.api";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Link } from "expo-router";
import MyButton from "@/components/button";
import MyText from "@/components/text";
import Checkbox from "@/components/checkbox";
import { StorageService } from "@/lib/StorageService";

interface LoginFormInputs {
  login: string;
  password: string;
  useUsername?: boolean;
}

import { useEffect } from "react";
import { useState } from "react";
import tw from "@/app/tailwind";
import { SESSION_EXPIRED_MSG } from "@/lib/const-strs";
// import { useNotification } from "@/notif-setup/notif-context";
import { getJWT, JWT_KEY, saveJWT, saveRoles } from "@/hooks/useJWT";
import { useAuth } from "@/components/context/auth-context";
import MyTextInput from "@/components/textinput";
import { useTheme } from "@/app/hooks/theme.context";
import BottomDialog from "@/components/dialog";
import useHideDrawerHeader from "@/hooks/useHideDrawerHeader";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import DecorativeGraphics from "@/components/decorative-graphics";

function Login() {

  const { message } = useLocalSearchParams();
  const isSessionExpired = message === SESSION_EXPIRED_MSG;
  //   const { expoPushToken } = useNotification();
  useHideDrawerHeader();
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [useUsername, setUseUsername] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormInputs>({
    defaultValues: { login: "", password: "" },
  });

  const isLoggingIn = false;
  // router is already defined above
  const {loginFunc} = useAuth();

  const onSubmit = async (data: LoginFormInputs) => {
    clearErrors();
    if (!data.login || !data.password) {
      setError("login", {
        type: "manual",
        message: useUsername
          ? "Username is required"
          : "Mobile number is required",
      });
      setError("password", { type: "manual", message: "Password is required" });
      return;
    }

    loginFunc({...data, useUsername})

  };

  // if (checkingAuth) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.blue3 }]}>
      <DecorativeGraphics />
      <Animated.View style={{ opacity: fadeAnim, width: '100%', maxWidth: 500, alignSelf: 'center' }}>
        <View style={tw`mb-8 mt-4`}>
          <MyText
            weight="bold"
            color="blue1"
            style={tw`text-3xl mb-2 text-center`}
          >
            Welcome Back
          </MyText>
          <MyText color="gray4" style={tw`text-base text-center`}>
            Sign in to continue your journey
          </MyText>
        </View>
        
        <View style={tw`bg-white rounded-xl p-6 shadow-md mb-6`}>
          {isSessionExpired && (
            <MyText color="red1" style={tw`my-2 text-center mb-4`}>
              Your session has expired. Please log in again.
            </MyText>
          )}

          {/* Username checkbox */}
          <View style={tw`flex-row items-center mb-6`}>
            <Checkbox
              checked={useUsername}
              onPress={() => setUseUsername(!useUsername)}
              style={tw`mr-3`}
            />
            <MyText
              onPress={() => setUseUsername(!useUsername)}
              style={tw`text-base`}
            >
              Login with Username
            </MyText>
          </View>

          <Controller
            control={control}
            name="login"
            rules={{
              required: useUsername
                ? "Username is required"
                : "Mobile number is required",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-5`}>
                <MyTextInput
                  topLabel={useUsername ? "Username" : "Mobile Number"}
                  placeholder={
                    useUsername ? "Enter your username" : "Enter your mobile number"
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType={useUsername ? "default" : "phone-pad"}
                  style={tw`bg-gray-50`}
                  maxLength={useUsername ? undefined : 10}
                  error={!!errors.login}
                  cursorColor="blue1"
                />
              </View>
            )}
          />
          {errors.login && <Text style={styles.error}>{errors.login.message}</Text>}
          
          <Controller
            control={control}
            name="password"
            rules={{ required: "Password is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tw`mb-4`}>
                <MyTextInput
                  topLabel="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  style={tw`bg-gray-50`}
                  error={!!errors.password}
                />
              </View>
            )}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}
          
          <View
            style={tw`flex-row justify-end mb-6`}
          >
            <MyText
              weight="semibold"
              color="blue1"
              onPress={() => setDialogOpen(true)}
            >
              Forgot Password?
            </MyText>
          </View>
          
          <MyButton
            onPress={handleSubmit(onSubmit)}
            fillColor="blue1"
            textColor="white1"
            fullWidth
            disabled={isLoggingIn}
            style={tw`py-1 rounded-lg`}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </MyButton>
          
          <MyButton
            style={tw`mt-4 py-1 rounded-lg`}
            fullWidth
            fillColor="white1"
            textColor="blue1"
            borderColor="blue1"
            onPress={() => router.push("/login-otp" as any)}
          >
            Login With OTP
          </MyButton>
        </View>
        
        <View style={tw`flex-row justify-center mt-2 mb-8`}>
          <MyText style={tw`text-base`} color="gray4">Don't have an account? </MyText>
          <Link href="/signup" style={tw`ml-1`}>
            <MyText weight="semibold" color="blue1">
              Sign up
            </MyText>
          </Link>
        </View>
      </Animated.View>
      
      <BottomDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <View style={{ padding: 24, alignItems: "center" }}>
          <MyText weight="medium" style={tw`text-base text-center`}>
            To reset your password, login with otp and then reset your password
            from user profile.
          </MyText>
        </View>
      </BottomDialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
});

export default Login;
