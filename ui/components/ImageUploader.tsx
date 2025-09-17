import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import MyText from "./text";
import tw from "../app/tailwind";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";

interface ImageUploaderProps {
  images: { uri?: string }[];
  onAddImage: () => void;
  onRemoveImage: (uri: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onAddImage,
  onRemoveImage,
}) => {
  return (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row flex-wrap -mx-1`}>
        {images.map((image, index) => (
          <View key={index} style={tw`w-1/3 px-1 mb-2 relative`}>
            <Image
              source={{ uri: image.uri }}
              style={tw`w-full aspect-square rounded`}
            />
            <TouchableOpacity
              onPress={() => onRemoveImage(image.uri!)}
              style={tw`absolute top-0 right-0 bg-red-500 rounded-full p-1`}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={onAddImage} style={tw`w-1/3 px-1 mb-2`}>
          <View
            style={tw`w-full aspect-square bg-gray-200 rounded justify-center items-center opacity-75`}
          >
            <MaterialIcons name="add" size={32} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImageUploader;