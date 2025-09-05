import MyText from "@/components/text";
import MyButton from "@/components/button";
import MyTextInput from "@/components/textinput";
import React, { useEffect } from "react";
import { View, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import CustomDropdown from "@/components/dropdown";
import MultiSelectDropdown from "@/components/multi-select";
import tw from "@/app/tailwind";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { useCreateBusinessUser, useUpdateBusinessUser } from "@/api-hooks/user.api";
import { useSpecializations } from "@/api-hooks/common.api";
import { ROLE_NAMES, BUSINESS_ROLE_OPTIONS } from "@/lib/constants";

// Define validation schema using Yup
const getBusinessUserSchema = (isEditing: boolean) => {
  // Base schema for both create and edit
  const baseSchema = {
    name: Yup.string().required("Name is required"),
    role: Yup.string()
      .required("Role is required")
      .oneOf(Object.values(ROLE_NAMES), "Invalid role"),
    specializations: Yup.string().when("role", {
      is: ROLE_NAMES.DOCTOR,
      then: (schema) =>
        schema
          .required("At least one specialization is required for doctors")
          .test(
            "has-specializations",
            "At least one specialization is required",
            (value) => Boolean(value && value.length > 0)
          ),
      otherwise: (schema) => schema.optional(),
    }),
    consultationFee: Yup.number().when("role", {
      is: ROLE_NAMES.DOCTOR,
      then: (schema) => 
        schema
          .required("Consultation fee is required")
          .min(0, "Consultation fee must be a positive number"),
      otherwise: (schema) => schema.optional(),
    }),
    dailyTokenCount: Yup.number().when("role", {
      is: ROLE_NAMES.DOCTOR,
      then: (schema) => 
        schema
          .required("Daily token count is required")
          .integer("Token count must be a whole number")
          .min(0, "Token count must be a positive number"),
      otherwise: (schema) => schema.optional(),
    }),
  };

  // Add validation fields for creation only
  if (!isEditing) {
    return Yup.object().shape({
      ...baseSchema,
      username: Yup.string()
        .required("Username is required")
        .min(4, "Username must be at least 4 characters"),
      password: Yup.string().required("Password is required"),
      confirmPassword: Yup.string()
        .required("Confirm password is required")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    });
  }

  // For editing, password fields are optional
  return Yup.object().shape({
    ...baseSchema,
    username: Yup.string()
      .required("Username is required")
      .min(4, "Username must be at least 4 characters"),
    password: Yup.string().optional(),
    confirmPassword: Yup.string().when("password", {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema
        .required("Confirm password is required")
        .oneOf([Yup.ref("password")], "Passwords must match"),
      otherwise: (schema) => schema.optional(),
    }),
  });
};

// Initial form values
const getInitialValues = (userData?: any) => {
  return {
    name: userData?.name || "",
    username: userData?.username || "",
    password: "",
    confirmPassword: "",
    role: userData?.role || ROLE_NAMES.HOSPITAL_ADMIN,
    specializations: userData?.specializationIds ? userData.specializationIds.join(",") : "",
    consultationFee: userData?.consultationFee || "",
    dailyTokenCount: userData?.dailyTokenCount || "",
  };
};

// Using the business role options from constants
const roles = BUSINESS_ROLE_OPTIONS;

interface AddBusinessUserFormProps {
  onSuccess?: () => void;
  userData?: any;
  isEditing?: boolean;
}

function AddBusinessUserForm({ onSuccess, userData, isEditing = false }: AddBusinessUserFormProps) {
  const router = useRouter();
  const createBusinessUserMutation = useCreateBusinessUser();
  const updateBusinessUserMutation = userData?.id ? useUpdateBusinessUser(userData.id) : null;
  const { data: specializationsList, isLoading: isLoadingSpecializations } =
    useSpecializations();

  const initialValues = getInitialValues(userData);
  const validationSchema = getBusinessUserSchema(isEditing);

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: any
  ) => {
    try {
      if (isEditing && userData?.id) {
        // Update existing user
        const updatePayload = {
          name: values.name,
          ...(values.password ? { password: values.password } : {}),
          ...(values.role === ROLE_NAMES.DOCTOR && values.specializations
            ? {
                specializationIds: values.specializations
                  .split(",")
                  .map((id: string) => parseInt(id)),
                consultationFee: parseFloat(values.consultationFee),
                dailyTokenCount: parseInt(values.dailyTokenCount),
              }
            : {}),
        };

        await updateBusinessUserMutation!.mutateAsync(updatePayload);
        Alert.alert("Success", "Business user updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              } else {
                router.push("/(drawer)/admin-panel/manage-business-users");
              }
            },
          },
        ]);
      } else {
        // Create new user
        const userPayload = {
          name: values.name,
          username: values.username,
          password: values.password,
          role: values.role,
          ...(values.role === ROLE_NAMES.DOCTOR && values.specializations
            ? {
                specializationIds: values.specializations
                  .split(",")
                  .map((id: string) => parseInt(id)),
                consultationFee: parseFloat(values.consultationFee),
                dailyTokenCount: parseInt(values.dailyTokenCount),
              }
            : {}),
        };

        await createBusinessUserMutation.mutateAsync(userPayload);
        Alert.alert("Success", "Business user added successfully!", [
          {
            text: "OK",
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              } else {
                router.push("/(drawer)/admin-panel/manage-business-users");
              }
            },
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || `Failed to ${isEditing ? 'update' : 'add'} business user. Please try again.`,
        [{ text: "OK" }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1`}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        contentContainerStyle={tw`flex-grow p-2`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`flex-col gap-4 pb-10`}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
          setFieldValue,
        }) => (
          <View>
            <View style={tw`mb-4`}>
              <MyTextInput
                topLabel="Full Name"
                placeholder="Enter user's full name"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                style={tw`mb-2`}
              />
              {touched.name && errors.name && (
                <MyText style={tw`text-red-500 text-xs mt-1`}>
                  {String(errors.name)}
                </MyText>
              )}
            </View>

            <View style={tw`mb-4`}>
              <MyTextInput
                topLabel="Username"
                placeholder="Enter username"
                value={values.username}
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                style={tw`mb-2`}
                autoCapitalize="none"
                editable={!isEditing} // Username can't be edited
              />
              {touched.username && errors.username && (
                <MyText style={tw`text-red-500 text-xs mt-1`}>
                  {String(errors.username)}
                </MyText>
              )}
            </View>

            <View style={tw`mb-4`}>
              <MyTextInput
                topLabel={isEditing ? "New Password (leave blank to keep current)" : "Password"}
                placeholder={isEditing ? "Enter new password" : "Enter password"}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                style={tw`mb-2`}
                secureTextEntry
              />
              {touched.password && errors.password && (
                <MyText style={tw`text-red-500 text-xs mt-1`}>
                  {String(errors.password)}
                </MyText>
              )}
            </View>

            <View style={tw`mb-4`}>
              <MyTextInput
                topLabel={isEditing ? "Confirm New Password" : "Confirm Password"}
                placeholder="Confirm password"
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                style={tw`mb-2`}
                secureTextEntry
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <MyText style={tw`text-red-500 text-xs mt-1`}>
                  {String(errors.confirmPassword)}
                </MyText>
              )}
            </View>

            <View style={tw`mb-4`}>
              <CustomDropdown
                label="Role"
                value={values.role}
                options={roles}
                onValueChange={(value: string | number) => {
                  setFieldValue("role", value);
                  if (value !== ROLE_NAMES.DOCTOR) {
                    setFieldValue("specializations", "");
                  }
                }}
                error={touched.role && !!errors.role}
                style={tw`relative`}
                disabled={isEditing} // Role can't be changed when editing
              />
              {touched.role && errors.role && (
                <MyText style={tw`text-red-500 text-xs mt-1`}>
                  {String(errors.role)}
                </MyText>
              )}
            </View>

            {values.role === ROLE_NAMES.DOCTOR && (
              <View style={tw`mb-4`}>
                <MultiSelectDropdown
                  placeholder="Select Specializations"
                  value={
                    values.specializations
                      ? values.specializations.split(",")
                      : []
                  }
                  data={
                    specializationsList?.map((spec) => ({
                      label: spec.name,
                      value: spec.id.toString(),
                    })) || []
                  }
                  onChange={(vals: string[]) =>
                    setFieldValue(
                      "specializations",
                      Array.isArray(vals) ? vals.join(",") : ""
                    )
                  }
                  style={tw`relative`}
                  disabled={isLoadingSpecializations}
                  dropdownStyle={{
                    borderWidth: 2,
                    borderColor:
                      touched.specializations && errors.specializations
                        ? "#ef4444"
                        : "#d1d5db",
                  }}
                />
                {touched.specializations && errors.specializations && (
                  <MyText style={tw`text-red-500 text-xs mt-1`}>
                    {String(errors.specializations)}
                  </MyText>
                )}
                {isLoadingSpecializations && (
                  <MyText style={tw`text-gray-500 text-xs mt-1`}>
                    Loading specializations...
                  </MyText>
                )}
                
                <View style={tw`mt-4`}>
                  <MyTextInput
                    topLabel="Consultation Fee"
                    placeholder="Enter consultation fee"
                    value={values.consultationFee.toString()}
                    onChangeText={handleChange("consultationFee")}
                    onBlur={handleBlur("consultationFee")}
                    style={tw`mb-2`}
                    keyboardType="numeric"
                  />
                  {touched.consultationFee && errors.consultationFee && (
                    <MyText style={tw`text-red-500 text-xs mt-1`}>
                      {String(errors.consultationFee)}
                    </MyText>
                  )}
                </View>

                <View style={tw`mt-4`}>
                  <MyTextInput
                    topLabel="Daily Token Count"
                    placeholder="Enter daily token count"
                    value={values.dailyTokenCount.toString()}
                    onChangeText={handleChange("dailyTokenCount")}
                    onBlur={handleBlur("dailyTokenCount")}
                    style={tw`mb-2`}
                    keyboardType="numeric"
                  />
                  {touched.dailyTokenCount && errors.dailyTokenCount && (
                    <MyText style={tw`text-red-500 text-xs mt-1`}>
                      {String(errors.dailyTokenCount)}
                    </MyText>
                  )}
                </View>
              </View>
            )}

            <View style={tw`flex-row justify-between mt-6`}>
              <MyButton
                mode="outlined"
                textContent="Cancel"
                onPress={() => router.back()}
                style={tw`flex-1 mr-2`}
              />

              <MyButton
                mode="contained"
                textContent={isSubmitting 
                  ? (isEditing ? "Updating..." : "Adding...") 
                  : (isEditing ? "Update User" : "Add User")}
                onPress={handleSubmit as any}
                disabled={isSubmitting}
                style={tw`flex-1 ml-2`}
              />
            </View>
          </View>
        )}
      </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default AddBusinessUserForm;
