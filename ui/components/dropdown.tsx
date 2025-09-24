import tw from "@/app/tailwind";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface Props {
  label: string;
  value: string | number;
  options: DropdownOption[];
  onValueChange: (value: string | number) => void;
  error?: boolean;
  style?: any;
  placeholder?: string;
  disabled?: boolean;
}

const CustomDropdown: React.FC<Props> = ({
  label,
  value,
  options,
  onValueChange,
  error,
  style,
  placeholder,
  disabled,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Dropdown
        data={options}
        labelField="label"
        valueField="value"
        value={value}
        onChange={(item) => onValueChange(item.value)}
        placeholder={placeholder || label}
        placeholderStyle={[tw`text-gray-500`, disabled && tw`text-gray-400`]}
        style={[styles.dropdown, error && styles.error, disabled && styles.disabled]}
        disable={disabled}
        renderItem={(item: DropdownOption) => {
          const isSelected = value === item.value;
          return (
            <View style={[styles.item, isSelected && styles.selectedItem]}>
              <Text
                style={[
                  isSelected ? styles.selectedTextStyle : styles.itemTextStyle,
                  disabled && tw`text-gray-400`
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        }}
        selectedTextStyle={disabled ? tw`text-gray-400` : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  disabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#d3d3d3",
  },
  error: {
    borderColor: "red",
  },
    item: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: '#e0f0ff', // Light blue for selected
  },
    selectedTextStyle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemTextStyle: {
    color: '#333',
    fontSize: 16,
  },
});

export default CustomDropdown;
