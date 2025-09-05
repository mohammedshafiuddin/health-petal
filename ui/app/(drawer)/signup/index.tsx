import MyText from "@/components/text";
import React from "react";
import { View, ScrollView, Alert } from "react-native";
import MyTextInput from "@/components/textinput";
import MyButton from "@/components/button";
import { useTheme } from "@/app/hooks/theme.context";
import {
  CreateUserPayload,
  useCreateUser,
  CreateUserResponse,
} from "@/api-hooks/user.api";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import tw from "@/app/tailwind";

interface Props {}

// Define validation schema using Yup
const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  mobile: Yup.string()
    .matches(/^\d{10}$/, "Mobile number should have 10 digits")
    .required("Mobile number is required"),
  address: Yup.string().required("Address is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

function Index(props: Props) {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    mutate: createUser,
    isPending: isCreatingUser,
    error: createUserError,
  } = useCreateUser();

  const initialValues: CreateUserPayload & { confirmPassword: string } = {
    name: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const { confirmPassword, ...userData } = values;

      createUser(userData, {
        onSuccess: (data: CreateUserResponse) => {
          Alert.alert(
            "Success",
            "Account created successfully! Please login.",
            [
              {
                text: "OK",
                onPress: () => router.push("/(drawer)/login"),
              },
            ]
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error.message || "Failed to create account. Please try again."
          );
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later."
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={tw`flex-grow p-5 bg-white`}
      keyboardShouldPersistTaps="handled"
    >
      <View style={tw`w-full max-w-[500px] self-center`}>
        <MyText style={tw`text-2xl mb-2 text-center font-bold`}>
          Create an Account
        </MyText>
        <MyText style={tw`text-base mb-6 text-center text-gray-600`}>
          Please fill in the details below to sign up
        </MyText>

        <Formik
          initialValues={initialValues}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View>
              <View style={tw`mb-4`}>
                <MyTextInput
                  topLabel="Full Name"
                  placeholder="Enter your full name"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  autoCapitalize="words"
                />
                {touched.name && errors.name && (
                  <MyText style={tw`text-red-500 text-xs mt-1`}>
                    {errors.name}
                  </MyText>
                )}
              </View>

              <View style={tw`mb-4`}>
                <MyTextInput
                  topLabel="Email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <MyText style={tw`text-red-500 text-xs mt-1`}>
                    {errors.email}
                  </MyText>
                )}
              </View>

              <View style={tw`mb-4`}>
                <MyTextInput
                  topLabel="Mobile Number"
                  placeholder="Enter your mobile number"
                  value={values.mobile}
                  onChangeText={handleChange("mobile")}
                  onBlur={handleBlur("mobile")}
                  keyboardType="phone-pad"
                />
                {touched.mobile && errors.mobile && (
                  <MyText style={tw`text-red-500 text-xs mt-1`}>
                    {errors.mobile}
                  </MyText>
                )}
              </View>

              <View style={tw`mb-4`}>
                <MyTextInput
                  topLabel="Address"
                  placeholder="Enter your address"
                  value={values.address}
                  onChangeText={handleChange("address")}
                  onBlur={handleBlur("address")}
                  multiline
                  numberOfLines={3}
                />
                {touched.address && errors.address && (
                  <MyText style={tw`text-red-500 text-xs mt-1`}>
                    {errors.address}
                  </MyText>
                )}
              </View>

              <View style={tw`mb-4`}>
                <MyTextInput
                  topLabel="Password"
                  placeholder="Create a password"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry
                />
                {touched.password && errors.password && (
                  <MyText style={tw`text-red-500 text-xs mt-1`}>
                    {errors.password}
                  </MyText>
                )}
              </View>

              <View style={tw`mb-4`}>
                <MyTextInput
                  topLabel="Confirm Password"
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  secureTextEntry
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <MyText style={tw`text-red-500 text-xs mt-1`}>
                    {errors.confirmPassword}
                  </MyText>
                )}
              </View>

              <MyButton
                mode="contained"
                fullWidth
                onPress={handleSubmit as any}
                loading={isCreatingUser}
                disabled={isCreatingUser}
                textContent="Sign Up"
                style={tw`mt-2`}
              />
            </View>
          )}
        </Formik>

        <View style={tw`flex-row justify-center mt-6`}>
          <MyText>Already have an account? </MyText>
          <MyText
            weight="bold"
            style={{ color: theme.colors.blue1 }}
            onPress={() => router.push("/(drawer)/login")}
          >
            Login
          </MyText>
        </View>
      </View>
    </ScrollView>
  );
}

export default Index;
