import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Specialization {
  id: number;
  name: string;
  description?: string;
}

interface Employee {
  id: number;
  name: string;
  designation: string;
}

interface HospitalDetailsProps {
  hospital: {
    id: number;
    name: string;
    address: string;
    description?: string;
    specializations?: Specialization[];
    employees?: Employee[];
    imageUrl?: string;
  };
  onPress?: () => void;
  showFullDetails?: boolean;
}

const HospitalDetails: React.FC<HospitalDetailsProps> = ({ 
  hospital, 
  onPress, 
  showFullDetails = false 
}) => {
  const backgroundColor = useThemeColor({ light: 'white', dark: '#1f2937' }, 'background');
  const textColor = useThemeColor({ light: '#333', dark: '#f3f4f6' }, 'text');
  const secondaryColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'tabIconDefault');
  
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[
        tw`rounded-lg mb-4 overflow-hidden shadow-sm`,
        { backgroundColor },
        styles.container,
        { borderColor: '#e5e7eb' }
      ]} 
      onPress={onPress}
    >
      <View style={tw`p-4`}>
        <View style={tw`flex-row items-center mb-2`}>
          {hospital.imageUrl ? (
            <Image 
              source={{ uri: hospital.imageUrl }} 
              style={tw`h-14 w-14 rounded mr-3`}
            />
          ) : (
            <View style={[tw`h-14 w-14 rounded mr-3 items-center justify-center bg-blue-100`]}>
              <MyText style={tw`text-blue-800 text-lg font-bold`}>
                {hospital.name.charAt(0).toUpperCase()}
              </MyText>
            </View>
          )}
          
          <View style={tw`flex-1`}>
            <MyText style={[tw`text-lg font-bold`, { color: textColor }]}>
              {hospital.name}
            </MyText>
            
            {hospital.specializations && hospital.specializations.length > 0 && (
              <MyText style={[tw`text-sm`, { color: secondaryColor }]}>
                {hospital.specializations.map(spec => spec.name).slice(0, 3).join(', ')}
                {hospital.specializations.length > 3 && ' +' + (hospital.specializations.length - 3) + ' more'}
              </MyText>
            )}
          </View>
        </View>
        
        <MyText style={[tw`text-sm`, { color: textColor }]}>
          {hospital.address}
        </MyText>
      </View>
      
      {showFullDetails && (
        <ThemedView style={tw`px-4 pb-4 pt-0`}>
          {hospital.description && (
            <View style={tw`mb-3`}>
              <MyText style={tw`text-sm font-medium mb-1`}>About</MyText>
              <MyText style={tw`text-sm`}>{hospital.description}</MyText>
            </View>
          )}
          
          {hospital.specializations && hospital.specializations.length > 0 && (
            <View style={tw`mb-3`}>
              <MyText style={tw`text-sm font-medium mb-1`}>Specializations</MyText>
              <View style={tw`flex-row flex-wrap`}>
                {hospital.specializations.map((spec) => (
                  <View 
                    key={spec.id} 
                    style={[
                      tw`mr-2 mb-2 px-2 py-1 rounded-full bg-blue-50`, 
                      { borderWidth: 1, borderColor: '#dbeafe' }
                    ]}
                  >
                    <MyText style={tw`text-xs text-blue-700`}>{spec.name}</MyText>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {hospital.employees && hospital.employees.length > 0 && (
            <View>
              <MyText style={tw`text-sm font-medium mb-1`}>Key Staff</MyText>
              {hospital.employees.slice(0, 5).map((employee, index) => (
                <View key={employee.id || index} style={tw`flex-row justify-between mb-1`}>
                  <MyText style={tw`text-sm`}>{employee.name}</MyText>
                  <MyText style={[tw`text-sm`, { color: secondaryColor }]}>
                    {employee.designation}
                  </MyText>
                </View>
              ))}
              {hospital.employees.length > 5 && (
                <MyText style={[tw`text-sm text-right`, { color: secondaryColor }]}>
                  +{hospital.employees.length - 5} more staff
                </MyText>
              )}
            </View>
          )}
        </ThemedView>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  }
});

export default HospitalDetails;
