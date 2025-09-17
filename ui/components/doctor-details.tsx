import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MyText from "@/components/text";
import tw from "@/app/tailwind";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetUserById } from "@/api-hooks/user.api";

import { User } from "shared-types";
import { useRoles } from "./context/roles-context";
import { useRouter } from "expo-router";

interface Specialization {
  id: number;
  name: string;
  description?: string;
}

// Extended user type with doctor-specific fields
interface DoctorUser extends User {
  qualifications?: string;
  // specializations: Specialization[];
  consultationFee?: number;
  dailyTokenCount?: number;
  doctorId?: number;
  role?: string;
  hospital?:string;
}

interface DoctorDetailsProps {
  doctorId: number;
  onPress?: () => void;
  showFullDetails?: boolean;
  isHospitalAdmin?: boolean;
  isAdminPoV?: boolean;
}

const DoctorDetails: React.FC<DoctorDetailsProps> = ({
  doctorId,
  onPress,
  showFullDetails = false,
  isAdminPoV = false,
}) => {
  const backgroundColor = useThemeColor(
    { light: "white", dark: "#1f2937" },
    "background"
  );
  const textColor = useThemeColor({ light: "#333", dark: "#f3f4f6" }, "text");
  const accentColor = useThemeColor(
    { light: "#4f46e5", dark: "#818cf8" },
    "tint"
  );
  const secondaryColor = useThemeColor(
    { light: "#6b7280", dark: "#9ca3af" },
    "tabIconDefault"
  );
  
  const router = useRouter();

  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useGetUserById(doctorId);

  console.log({doctorId})
  

  // Cast the User data to our DoctorUser type
  const doctorData = userData as DoctorUser | undefined;

  const Container = onPress ? TouchableOpacity : View;
  const roles = useRoles();

  // Handle loading state
  if (isLoading) {
    return (
      <View
        style={[
          tw`rounded-lg mb-4 p-4 items-center justify-center`,
          { backgroundColor },
          styles.container,
          { borderColor: "#e5e7eb" },
        ]}
      >
        <ActivityIndicator size="large" color={accentColor} />
        <MyText style={[tw`mt-2`, { color: textColor }]}>
          Loading doctor details...
        </MyText>
      </View>
    );
  }

  // Handle error state
  if (isError || !doctorData) {
    return (
      <View
        style={[
          tw`rounded-lg mb-4 p-4`,
          { backgroundColor },
          styles.container,
          { borderColor: "#e5e7eb" },
        ]}
      >
        <MyText style={[tw`text-center`, { color: "red" }]}>
          {error?.message || "Failed to load doctor details"}
        </MyText>
      </View>
    );
  }

  // Extract relevant data
  const {
    name = "",
    profilePicUrl,
    qualifications = "",
    specializations = [],
    consultationFee = 0,
    dailyTokenCount = 0,
  } = doctorData || {};

  return (
    <Container
      style={[
        tw`rounded-lg mb-4 overflow-hidden shadow-sm`,
        { backgroundColor },
        styles.container,
        { borderColor: "#e5e7eb" },
      ]}
      onPress={onPress}
    >
      <View style={tw`flex-row p-4`}>
        {profilePicUrl ? (
          <Image
            source={{ uri: profilePicUrl }}
            style={tw`h-16 w-16 rounded-full mr-3`}
          />
        ) : (
          <View
            style={[
              tw`h-16 w-16 rounded-full mr-3 items-center justify-center`,
              { backgroundColor: accentColor },
            ]}
          >
            <MyText style={tw`text-white text-lg font-bold`}>
              {name.charAt(0).toUpperCase()}
            </MyText>
          </View>
        )}

        <View style={tw`flex-1 justify-center`}>
          <View style={tw`flex-row items-center`}>
            <MyText style={[tw`text-lg font-bold`, { color: textColor }]}>
              Dr. {name}
            </MyText>
            {isAdminPoV && (
              <TouchableOpacity
                onPress={() => router.push(`/(drawer)/dashboard/edit-business-user/${doctorId}`)}
                style={tw`ml-2 bg-blue-500 rounded-full p-1`}
              >
                <MyText style={tw`text-white text-xs`}>✎</MyText>
              </TouchableOpacity>
            )}
          </View>

          {specializations && specializations.length > 0 && (
            <MyText style={[tw`text-sm`, { color: secondaryColor }]}>
              {specializations
                .map((spec) => spec.name)
                .join(", ")}
            </MyText>
          )}

          <MyText style={[tw`text-sm mt-1`, { color: textColor }]}>
            Consultation Fee: ₹{consultationFee}
          </MyText>
        </View>
      </View>

      {showFullDetails && (
        <ThemedView style={tw`px-4 pb-4 pt-0`}>
          {qualifications && (
            <View style={tw`mb-3`}>
              <MyText style={tw`text-sm font-medium mb-1`}>
                Qualifications
              </MyText>
              <MyText style={tw`text-sm`}>{qualifications}</MyText>
            </View>
          )}

          <View style={tw`mb-3`}>
            <MyText style={tw`text-sm font-medium mb-1`}>
              Specializations
            </MyText>
            <View>
              {specializations && specializations.length > 0 ? (
                specializations.map((spec) => (
                  <View key={spec.id} style={tw`mb-1 flex-row`}>
                    <MyText style={tw`text-sm`}>• {spec.name}</MyText>
                    {spec.description && (
                      <MyText style={tw`text-xs text-gray-500 ml-1`}>
                        ({spec.description})
                      </MyText>
                    )}
                  </View>
                ))
              ) : (
                <MyText style={tw`text-sm text-gray-500`}>
                  No specializations listed
                </MyText>
              )}
            </View>
          </View>

          <View style={tw`flex-row justify-between`}>
            <View>
              <MyText style={tw`text-sm font-medium`}>Consultation Fee</MyText>
              <MyText style={tw`text-sm`}>₹{consultationFee}</MyText>
            </View>

            <View>
              <MyText style={tw`text-sm font-medium`}>Daily Tokens</MyText>
              <MyText style={tw`text-sm`}>{dailyTokenCount} per day</MyText>
            </View>
          </View>


        </ThemedView>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
});

export default DoctorDetails;

