import MyText from "@/components/text";
import MyButton from "@/components/button";
import React from "react";
import { ScrollView, View, ActivityIndicator, Alert } from "react-native";
import tw from "@/app/tailwind";
import { useRouter } from "expo-router";
import { useGetBusinessUsers, BusinessUser } from "@/api-hooks/user.api";

interface BusinessUserCardProps {
  user: BusinessUser;
  onViewDetails: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}

/**
 * BusinessUserCard component to display individual business user information
 */
const BusinessUserCard: React.FC<BusinessUserCardProps> = ({ user, onViewDetails, onEdit, onDeactivate }) => {
  return (
    <View style={tw`p-4 border border-gray-200 rounded-lg mb-3 bg-white shadow-sm`}>
      <View style={tw`flex-row justify-between items-start`}>
        <View style={tw`flex-1`}>
          <MyText style={tw`text-lg font-bold text-blue-900`}>{user.name}</MyText>
          
          <View style={tw`mt-2`}>
            <MyText style={tw`text-gray-700`}>
              <MyText style={tw`font-semibold`}>Username: </MyText>
              {user.username}
            </MyText>
            <MyText style={tw`text-gray-700 mt-1`}>
              <MyText style={tw`font-semibold`}>Role: </MyText>
              {user.role}
            </MyText>
          </View>
        </View>
      </View>
      
      <View style={tw`flex-row mt-3 justify-end`}>
        <MyButton
          mode="outlined"
          textContent="View Details"
          onPress={onViewDetails}
          style={tw`mr-2`}
        />
        <MyButton
          mode="outlined"
          textContent="Edit"
          onPress={onEdit}
          style={tw`mr-2`}
        />
        <MyButton
          mode="outlined"
          textContent="Deactivate"
          onPress={onDeactivate}
        />
      </View>
    </View>
  );
};

function ManageBusinessUsers() {
  const router = useRouter();
  const { data: businessUsers, isLoading, isError, refetch } = useGetBusinessUsers();

  return (
    <ScrollView contentContainerStyle={tw`flex-grow p-5`} style={tw`bg-white`}>
      <View style={tw`flex-col gap-6`}>
        <View style={tw`flex-row justify-between items-center mb-2 border-b border-gray-200 pb-4`}>
          <View>
            <MyText style={tw`text-2xl font-bold text-blue-900`}>Manage Business Users</MyText>
            <MyText style={tw`text-gray-600 mt-1`}>
              {businessUsers?.length || 0} {businessUsers?.length === 1 ? 'user' : 'users'} found
            </MyText>
          </View>
          <MyButton
            mode="contained"
            textContent="Add Business User"
            onPress={() => {
              router.push("/(drawer)/admin-panel/manage-business-users/add-business-user" as any);
            }}
          />
        </View>

        {isLoading ? (
          <View style={tw`items-center py-10 bg-gray-50 rounded-lg`}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <MyText style={tw`mt-4 text-gray-600 font-medium`}>Loading business users...</MyText>
          </View>
        ) : isError ? (
          <View style={tw`p-6 bg-red-50 rounded-lg items-center`}>
            <MyText style={tw`text-red-700 font-medium text-center mb-2`}>
              Failed to load business users
            </MyText>
            <MyButton
              mode="outlined"
              textContent="Try Again"
              onPress={() => refetch()}
              style={tw`mt-2`}
            />
          </View>
        ) : businessUsers && businessUsers.length > 0 ? (
          <View>
            {businessUsers.map((user) => (
              <BusinessUserCard
                key={user.id}
                user={user}
                onViewDetails={() => {
                  // Navigate to user details page (to be implemented)
                  Alert.alert("View Details", `Details for user: ${user.name}`);
                }}
                onEdit={() => {
                  // Navigate to edit user page
                  router.push(`/(drawer)/admin-panel/manage-business-users/edit-business-user/${user.id}`);
                }}
                onDeactivate={() => {
                  Alert.alert(
                    "Deactivate User",
                    `Are you sure you want to deactivate ${user.name}?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel"
                      },
                      {
                        text: "Deactivate",
                        style: "destructive",
                        onPress: () => {
                          // Implement user deactivation logic
                          Alert.alert("Success", `User ${user.name} has been deactivated`);
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
            <MyText style={tw`text-gray-600 text-lg mb-4`}>No business users found</MyText>
            <MyButton
              mode="contained"
              textContent="Add Your First Business User"
              onPress={() => {
                router.push("/(drawer)/admin-panel/manage-business-users/add-business-user" as any);
              }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default ManageBusinessUsers;
