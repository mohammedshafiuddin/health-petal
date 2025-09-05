import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import * as SecureStore from "expo-secure-store";


import { useLogin, LoginResponse } from "@/api-hooks/auth.api";
import { useLocalSearchParams, useRouter } from "expo-router";

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
import { JWT_KEY, saveJWT, saveRoles } from "@/hooks/useJWT";
import { useRoles } from "@/components/context/roles-context";
import { useAuth } from "@/components/context/auth-context";
import MyTextInput from "@/components/textinput";
import { useTheme } from "@/app/hooks/theme.context";
import BottomDialog from "@/components/dialog";
import { useUserResponsibilities } from "@/api-hooks/user.api";

function Login() {
  // const { refetch: refetchResponsibilities } = useUserResponsibilities(  );
  const { message } = useLocalSearchParams();
  const isSessionExpired = message === SESSION_EXPIRED_MSG;
//   const { expoPushToken } = useNotification();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [useUsername, setUseUsername] = useState(false);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync(JWT_KEY);

      if (token) {
        // router.replace("/(drawer)/dashboard/(tabs)/to-mbnr");
      } else {
        setCheckingAuth(false);
      }
    })();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormInputs>({
    defaultValues: { login: "", password: "" },
  });

  const { mutate: login, isPending: isLoggingIn } = useLogin();
  // router is already defined above
  const { refreshRoles } = useRoles();
  const { setIsLoggedIn } = useAuth();

  const onSubmit = async (data: LoginFormInputs) => {
    clearErrors();
    if (!data.login || !data.password) {
      setError("login", {
        type: "manual",
        message: useUsername ? "Username is required" : "Mobile number is required",
      });
      setError("password", { type: "manual", message: "Password is required" });
      return;
    }
    try {
      const result = await new Promise<LoginResponse>((resolve, reject) =>
        login(
          { ...data, useUsername },
          {
            onSuccess: resolve,
            onError: reject,
          }
        )
      );

      // Handle the response
      if (result.user) {
        // Store user ID for future reference
        if (result.user.id) {
          await StorageService.setItem('userId', result.user.id.toString());
        }

        
        // Save JWT token
        await saveJWT(result.token);
        
        // Update login state in auth context
        setIsLoggedIn(true);
        
        // Handle roles if available
        if (result.user.roles) {
          await saveRoles(result.user.roles);
          await refreshRoles();
        }

        // refetchResponsibilities();
        
        // Clear the 'message' search param from the URL after login
        router.replace({
          pathname: "/(drawer)/dashboard",
          params: {},
        });
      }
    } catch (e: any) {
      setError("login", {
        type: "manual",
        message: e.message || "Login failed",
      });
    }
  };

  if (checkingAuth) return null;

  return (
    <View style={styles.container}>
      <MyText
        weight="bold"
        color="black2"
        style={{ fontSize: 32, marginBottom: 8 }}
      >
        Sign in to your account
      </MyText>
      <MyText color="gray1" style={{ fontSize: 16, marginBottom: 24 }}>
        Log in using your mobile number and password
      </MyText>
      {isSessionExpired && (
        <MyText color="red1" style={tw`my-2`}>
          Your session has expired. Please log in again.
        </MyText>
      )}
      
      {/* Username checkbox */}
      <View style={styles.checkboxContainer}>
        <Checkbox 
          checked={useUsername} 
          onPress={() => setUseUsername(!useUsername)} 
          style={styles.checkbox}
        />
        <MyText onPress={() => setUseUsername(!useUsername)} style={styles.checkboxLabel}>
          Login with Username
        </MyText>
      </View>
      
      <Controller
        control={control}
        name="login"
        rules={{ required: useUsername ? "Username is required" : "Mobile number is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <MyTextInput
            label={useUsername ? "Username" : "Mobile Number"}
            placeholder={useUsername ? "Enter your username" : "Enter your mobile number"}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={useUsername ? "default" : "phone-pad"}
            style={styles.input}
            maxLength={useUsername ? undefined : 10}
            error={!!errors.login}
            cursorColor="blue1"
          />
        )}
      />
      {errors.login && (
        <Text style={styles.error}>{errors.login.message}</Text>
      )}
      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <MyTextInput
            label="Password"
            placeholder="Enter your password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 24,
        }}
      >
        <MyText
          weight="semibold"
          color="blue1"
          onPress={() => setDialogOpen(true)}
        >
          Forgot Password?
        </MyText>
      </View>
      <BottomDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <View style={{ padding: 24, alignItems: "center" }}>
          <MyText weight="medium" style={tw`text-base`}>
            To reset your password, login with otp and then reset your password
            from user profile.
          </MyText>
        </View>
      </BottomDialog>
      <MyButton
        onPress={handleSubmit(onSubmit)}
        fillColor="blue1"
        textColor="white1"
        fullWidth
        disabled={isLoggingIn}
      >
        {isLoggingIn ? "Logging in..." : "Login"}
      </MyButton>
      <MyButton
        style={{ marginTop: 12 }}
        fullWidth
        fillColor="white1"
        textColor="blue1"
        borderColor="blue1"
        onPress={() => router.push("/login-otp" as any)}
      >
        Login With OTP
      </MyButton>
      <Link href="/(drawer)/signup" style={{ marginTop: 24, alignSelf: "center" }}>
        <MyText color="blue1" style={{ textDecorationLine: "underline" }}>
          Don't have an account? Sign up
        </MyText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
  },
});

export default Login;
