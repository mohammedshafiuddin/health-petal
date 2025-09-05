import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Menu } from "react-native-paper";

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  label: string;
  value: string | number;
  options: Option[];
  onValueChange: (value: string | number) => void;
  error?: boolean;
  style?: any;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onValueChange,
  error,
  style,
  disabled,
}) => {
  const [visible, setVisible] = React.useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  // NOTE: The parent View of this Select should have position: 'relative' for Menu to work properly.
  return (
    <View style={[styles.menuContainer, style, { borderWidth: 1, borderColor: 'red', backgroundColor: '#fff' }]}> 
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TextInput
            label={label}
            value={selectedLabel}
            style={styles.input}
            error={error}
            editable={false}
            disabled={disabled}
            onPressIn={() => setVisible(true)}
            right={<TextInput.Icon icon={visible ? "menu-up" : "menu-down"} />}
          />
        }
      >
        {(options.length === 0) ? (
          <Menu.Item title="No options" disabled />
        ) : (
          options.map(option => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                onValueChange(option.value);
                setVisible(false);
              }}
              title={option.label}
            />
          ))
        )}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    // You can add more styling here if needed
  },
});

// TEMP: Test render for debugging
// Remove or comment out after testing

import { SafeAreaView } from 'react-native';
export default function TestSelect() {
  const [val, setVal] = React.useState('1');
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Select
        label="Test Dropdown"
        value={val}
        options={[
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ]}
        onValueChange={v => setVal(String(v))}
      />
    </SafeAreaView>
  );
}
