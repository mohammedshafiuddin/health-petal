import MyText from "@/components/text";
import MyButton from "@/components/button";
import React from "react";
import { ScrollView, View, ActivityIndicator, Alert } from "react-native";
import tw from "@/app/tailwind";
import { useRouter } from "expo-router";
import { useGetHospitals, useDeleteHospital } from "@/api-hooks/hospital.api";
import { Hospital } from "shared-types";

interface HospitalCardProps {
  hospital: Hospital;
  onDelete: () => void;
  onEdit: () => void;
}

/**
 * HospitalCard component to display individual hospital information
 */
const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, onDelete, onEdit }) => {
  return (
    <View style={tw`p-4 border border-gray-200 rounded-lg mb-3 bg-white shadow-sm`}>
      <View style={tw`flex-row justify-between items-start`}>
        <View style={tw`flex-1`}>
          <MyText style={tw`text-lg font-bold text-blue-900`}>{hospital.name}</MyText>
          
          {hospital.description && (
            <MyText style={tw`text-gray-600 mt-1`}>{hospital.description}</MyText>
          )}
          
          <View style={tw`mt-2 bg-gray-50 p-2 rounded-md`}>
            <MyText style={tw`text-gray-700`}>
              <MyText style={tw`font-semibold`}>Address: </MyText>
              {hospital.address}
            </MyText>
          </View>
        </View>
      </View>
      
      <View style={tw`flex-row mt-3 justify-end`}>
        <MyButton
          mode="outlined"
          textContent="Edit"
          onPress={onEdit}
          style={tw`mr-2`}
        />
        <MyButton
          mode="outlined"
          textContent="Delete"
        //   style={tw`bg-red-50`}
          onPress={onDelete}
        />
      </View>
    </View>
  );
};

function ManageHospitals() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetHospitals();
  const deleteHospitalMutation = useDeleteHospital();

  return (
    <ScrollView contentContainerStyle={tw`flex-grow p-5`} style={tw`bg-white`}>
      <View style={tw`flex-col gap-6`}>
        <View style={tw`flex-row justify-between items-center mb-2 border-b border-gray-200 pb-4`}>
          <View>
            <MyText style={tw`text-2xl font-bold text-blue-900`}>Manage Hospitals</MyText>
            <MyText style={tw`text-gray-600 mt-1`}>
              {data?.hospitals?.length || 0} {data?.hospitals?.length === 1 ? 'hospital' : 'hospitals'} found
            </MyText>
          </View>
          <MyButton
            mode="contained"
            textContent="Add Hospital"
            onPress={() => {
              router.push("/(drawer)/admin-panel/manage-hospitals/add-hospital" as any);
            }}
          />
        </View>

        {isLoading ? (
          <View style={tw`items-center py-10 bg-gray-50 rounded-lg`}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <MyText style={tw`mt-4 text-gray-600 font-medium`}>Loading hospitals...</MyText>
          </View>
        ) : isError ? (
          <View style={tw`p-6 bg-red-50 rounded-lg items-center`}>
            <MyText style={tw`text-red-700 font-medium text-center mb-2`}>
              Failed to load hospitals
            </MyText>
            <MyButton
              mode="outlined"
              textContent="Try Again"
              onPress={() => refetch()}
              style={tw`mt-2`}
            />
          </View>
        ) : data?.hospitals && data.hospitals.length > 0 ? (
          <View>
            {data.hospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onEdit={() => {
                  // Navigate to edit hospital page
                  router.push(`/(drawer)/admin-panel/manage-hospitals/edit-hospital/${hospital.id}`);
                }}
                onDelete={() => {
                  Alert.alert(
                    "Delete Hospital",
                    `Are you sure you want to delete ${hospital.name}?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel"
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await deleteHospitalMutation.mutateAsync(hospital.id);
                            Alert.alert("Success", "Hospital deleted successfully");
                            refetch();
                          } catch (error: any) {
                            Alert.alert(
                              "Error",
                              error.message || "Failed to delete hospital"
                            );
                          }
                        }
                      }
                    ]
                  );
                }}
              />
            ))}
          </View>
        ) : (
          <View style={tw`items-center py-12 bg-gray-50 rounded-lg`}>
            <MyText style={tw`text-gray-600 text-lg mb-4`}>No hospitals found</MyText>
            <MyButton
              mode="contained"
              textContent="Add Your First Hospital"
              onPress={() => {
                router.push("/(drawer)/admin-panel/manage-hospitals/add-hospital" as any);
              }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default ManageHospitals;
