import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';
import { AppointmentScreenDoctor } from '@/api-hooks/dashboard.api';

interface DoctorCardProps {
  doctor: AppointmentScreenDoctor;
  onPress: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress }) => {
  return (
    <TouchableOpacity 
      style={tw`bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-4 border border-gray-200 dark:border-gray-700 overflow-hidden`}
      onPress={onPress}
    >
      <View style={tw`flex-row p-4`}>
        {/* Doctor Image */}
        <View style={tw`mr-4`}>
          {doctor.profilePicUrl ? (
            <Image
              source={{ uri: doctor.profilePicUrl }}
              style={tw`w-16 h-16 rounded-full border-2 border-blue-500`}
            />
          ) : (
            <View style={tw`w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center border-2 border-blue-500`}>
              <Ionicons name="person" size={24} color="#4f46e5" />
            </View>
          )}
        </View>
        
        {/* Doctor Info */}
        <View style={tw`flex-1`}>
          <View style={tw`flex-row justify-between items-start mb-1`}>
            <MyText style={tw`text-lg font-bold text-gray-800 dark:text-white`} numberOfLines={1}>
              Dr. {doctor.name}
            </MyText>
            
            {/* Consultation Fee */}
            <View style={tw`flex-row items-center bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full`}>
              <Ionicons name="cash" size={12} color="#10b981" />
              <MyText style={tw`text-green-700 dark:text-green-300 text-xs font-bold ml-1`}>
                ₹{doctor.consultationFee}
              </MyText>
            </View>
          </View>
          
          {/* Qualifications */}
          {doctor.qualifications && (
            <MyText style={tw`text-gray-600 dark:text-gray-400 text-sm mb-2`} numberOfLines={1}>
              {doctor.qualifications}
            </MyText>
          )}
          
          {/* Specializations */}
          {doctor.specializations && doctor.specializations.length > 0 && (
            <View style={tw`flex-row flex-wrap mb-2`}>
              {doctor.specializations.slice(0, 3).map((spec) => (
                <View 
                  key={spec.id} 
                  style={tw`bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full mr-2 mb-1`}
                >
                  <MyText style={tw`text-blue-700 dark:text-blue-300 text-xs`}>
                    {spec.name}
                  </MyText>
                </View>
              ))}
              {doctor.specializations.length > 3 && (
                <View style={tw`bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full mr-2 mb-1`}>
                  <MyText style={tw`text-gray-700 dark:text-gray-300 text-xs`}>
                    +{doctor.specializations.length - 3} more
                  </MyText>
                </View>
              )}
            </View>
          )}
          
          {/* Hospital */}
          {doctor.hospital && (
            <View style={tw`flex-row items-center mt-1`}>
              <Ionicons name="business" size={14} color="#6b7280" />
              <MyText style={tw`text-gray-600 dark:text-gray-400 text-sm ml-1`} numberOfLines={1}>
                {doctor.hospital.name}
              </MyText>
            </View>
          )}
        </View>
      </View>
      
      {/* Action Button */}
      <View style={tw`px-4 pb-4`}>
        <TouchableOpacity 
          style={tw`bg-blue-500 py-2 rounded-lg items-center`}
          onPress={onPress}
        >
          <MyText style={tw`text-white font-medium`}>View Profile</MyText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default DoctorCard;