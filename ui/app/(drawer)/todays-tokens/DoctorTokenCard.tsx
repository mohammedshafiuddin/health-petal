import React from 'react';
import { View } from 'react-native';
import MyText from '@/components/text';
import { DoctorTodayToken } from 'shared-types';
import tw from '@/app/tailwind';

interface DoctorTokenCardProps {
  token: DoctorTodayToken;
}

const DoctorTokenCard: React.FC<DoctorTokenCardProps> = ({ token }) => {
  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'MISSED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusColorClass = getStatusColor(token.status ?? '');

  return (
    <View style={tw`bg-white p-4 rounded-xl shadow-sm mb-4 border-l-4 ${
      token.status === 'COMPLETED' ? 'border-green-500' : 
      token.status === 'IN_PROGRESS' ? 'border-orange-500' : 
      token.status === 'UPCOMING' ? 'border-blue-500' : 
      token.status === 'MISSED' ? 'border-red-500' : 'border-gray-500'
    }`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <View style={tw`flex-1`}>
          <MyText style={tw`text-lg font-bold`}>Token #{token.queueNumber}</MyText>
          <MyText style={tw`text-gray-600`}>{token.patientName}</MyText>
          <MyText style={tw`text-gray-500 text-sm`}>{token.patientMobile}</MyText>
        </View>
        <View style={tw`${statusColorClass.split(' ')[0]} px-3 py-1 rounded-full`}>
          <MyText style={tw`${statusColorClass.split(' ')[1]} text-xs font-medium`}>
            {token.status ?? 'N/A'}
          </MyText>
        </View>
      </View>
      {token.description && (
        <View style={tw`mt-2 p-2 bg-gray-50 rounded`}>
          <MyText style={tw`text-gray-700 text-sm`}>
            <MyText style={tw`font-medium`}>Description: </MyText>
            {token.description}
          </MyText>
        </View>
      )}
      {token.consultationNotes && (
        <View style={tw`mt-2 p-2 bg-blue-50 rounded`}>
          <MyText style={tw`text-blue-800 text-sm`}>
            <MyText style={tw`font-medium`}>Notes: </MyText>
            {token.consultationNotes}
          </MyText>
        </View>
      )}
    </View>
  );
};

export default DoctorTokenCard;
