import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Text,
} from "react-native";
import tw from "@/app/tailwind";
import MyText from "@/components/text";
import { BottomDialog } from "./dialog";
import  CustomDropdown from "./dropdown";
import dayjs from "dayjs";
import { DashboardDoctor } from "shared-types";
import { useCreateOfflineToken } from "@/api-hooks/token.api";
import { ErrorToast, SuccessToast } from "@/services/toaster";

interface OfflineTokenDialogProps {
  open: boolean;
  onClose: () => void;
  doctorId: number;
  doctorName: string;
  onSuccess?: () => void;
}

const OfflineTokenDialog: React.FC<OfflineTokenDialogProps> = ({
  open,
  onClose,
  doctorId,
  doctorName,
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState("");
  const [patientMobile, setPatientMobile] = useState("");
  const [symptoms, setSymptoms] = useState("");
  // Date for the token (default to current date)
  const [tokenDate, setTokenDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Setup mutation for creating offline token
  const { 
    mutate: createOfflineToken, 
    isPending: isCreatingToken 
  } = useCreateOfflineToken();

  const handleCreateOfflineToken = () => {
    if (!patientName.trim() || !patientMobile.trim()) {
      // Check for required fields
      if (!patientName.trim() && !patientMobile.trim()) {
        alert("Please fill in both patient name and mobile number");
        return;
      } else if (!patientName.trim()) {
        alert("Please fill in patient name");
        return;
      } else if (!patientMobile.trim()) {
        alert("Please fill in patient mobile number");
        return;
      }
    }

    createOfflineToken(
      {
        doctorId: doctorId,
        patientName: patientName.trim(),
        patientMobile: patientMobile.trim(),
        symptoms: symptoms.trim(), // Include symptoms
        date: tokenDate, // Include the selected date
      },
      {
        onSuccess: () => {
          SuccessToast("Token issued successfully");
          setPatientName("");
          setPatientMobile("");
          setSymptoms(""); // Clear symptoms
          setTokenDate(dayjs().format('YYYY-MM-DD')); // Reset to current date
          if (onSuccess) {
            onSuccess();
          }
          onClose(); // Close the dialog
        },
        onError: (error: Error) => {
          console.error("Error creating offline token:", error);
          ErrorToast(`Failed to issue token: ${error.message}`);
        },
      }
    );
  };

  const handleClose = () => {
    setPatientName("");
    setPatientMobile("");
    setSymptoms("");
    setTokenDate(dayjs().format('YYYY-MM-DD')); // Reset to current date
    onClose();
  };

  return (
    <BottomDialog open={open} onClose={handleClose}>
      <View style={tw`p-5`}>
        <MyText
          style={tw`text-xl font-bold mb-4 text-gray-800 dark:text-gray-200`}
        >
          Issue New Token
        </MyText>

        <MyText
          style={tw`text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300`}
        >
          Doctor: {doctorName}
        </MyText>

        <View style={tw`mb-4`}>
          <CustomDropdown
            label="Date"
            value={tokenDate}
            options={[{ label: dayjs(tokenDate).format('DD MMM YYYY'), value: tokenDate }]}
            onValueChange={() => {}} // No change allowed, just display current date
            disabled={true}
            placeholder="Select Date"
          />
        </View>

        <View style={tw`mb-4`}>
          <MyText style={tw`text-sm mb-1 text-gray-600 dark:text-gray-400`}>
            Patient Name
          </MyText>
          <TextInput
            style={tw`border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white`}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Enter patient name"
          />
        </View>

        <View style={tw`mb-4`}>
          <MyText style={tw`text-sm mb-1 text-gray-600 dark:text-gray-400`}>
            Patient Mobile
          </MyText>
          <TextInput
            style={tw`border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white`}
            value={patientMobile}
            onChangeText={setPatientMobile}
            placeholder="Enter patient mobile number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={tw`mb-6`}>
          <MyText style={tw`text-sm mb-1 text-gray-600 dark:text-gray-400`}>
            Symptoms
          </MyText>
          <TextInput
            style={tw`border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-24`}
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="Enter patient symptoms"
            multiline={true}
            textAlignVertical="top"
          />
        </View>

        <View style={tw`flex-row justify-between`}>
          <TouchableOpacity
            style={tw`flex-1 mr-2 bg-gray-300 dark:bg-gray-600 p-3 rounded-lg items-center`}
            onPress={handleClose}
          >
            <MyText style={tw`text-gray-800 dark:text-white font-bold`}>
              Cancel
            </MyText>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-1 ml-2 bg-blue-500 p-3 rounded-lg items-center`}
            onPress={handleCreateOfflineToken}
            disabled={isCreatingToken}
          >
            <MyText style={tw`text-white font-bold`}>
              {isCreatingToken ? "Issuing..." : "Issue Token"}
            </MyText>
          </TouchableOpacity>
        </View>
      </View>
    </BottomDialog>
  );
};

export default OfflineTokenDialog;