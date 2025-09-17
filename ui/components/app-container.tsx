import tw from "@/app/tailwind";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

interface Props {
  children: React.ReactNode;
}

function AppContainer(props: Props) {
  const { children } = props;

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 dark:bg-gray-900 p-4`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
        keyboardVerticalOffset={80}
      >
        {children}
      </KeyboardAvoidingView>

      <View style={tw`h-16`}></View>
    </ScrollView>
  );
}

export default AppContainer;
