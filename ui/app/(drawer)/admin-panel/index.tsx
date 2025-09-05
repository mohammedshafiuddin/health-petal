import MyText from "@/components/text";
import MyButton from "@/components/button";
import React from "react";
import { ScrollView, View } from "react-native";
import tw from "@/app/tailwind";
import { useRouter } from "expo-router";

interface Props {}

function Index(props: Props) {
  const {} = props;
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={tw`flex-grow p-5`} style={tw`bg-white`}>
      <View style={tw`flex-col gap-4`}>
        <MyText style={tw`text-2xl font-bold mb-2`}>Admin Panel</MyText>

        <MyButton
          mode="contained"
          textContent="Manage Hospitals"
          onPress={() => {
            router.push("/(drawer)/admin-panel/manage-hospitals" as any);
          }}
          style={tw`mt-4`}
        />

        <MyButton
          mode="contained"
          textContent="Manage Business Users"
          onPress={() => {
            router.push("/(drawer)/admin-panel/manage-business-users" as any);
          }}
          style={tw`mt-4`}
        />
      </View>
    </ScrollView>
  );
}

export default Index;
