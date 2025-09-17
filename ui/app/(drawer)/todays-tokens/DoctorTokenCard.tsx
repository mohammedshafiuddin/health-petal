import React, { useState } from 'react';
import { View, Alert, TextInput } from 'react-native';
import MyText from '@/components/text';
import { DoctorTodayToken } from 'shared-types';
import tw from '@/app/tailwind';
import { Ionicons } from '@expo/vector-icons';
import { useUpdateTokenStatus } from '@/api-hooks/token.api';

interface DoctorTokenCardProps {
  token: DoctorTodayToken;
  onMarkNoShow?: (tokenId: number) => void;
  onAddNotes?: (tokenId: number, notes: string) => void;
}

const DoctorTokenCard: React.FC<DoctorTokenCardProps> = ({ token, onMarkNoShow, onAddNotes }) => {
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

  // Check for special indicators
  const isPriority = token.description?.toLowerCase().includes('urgent') || 
                    token.description?.toLowerCase().includes('emergency') ||
                    token.description?.toLowerCase().includes('asap');
  
  const isFollowUp = token.description?.toLowerCase().includes('follow-up') || 
                     token.description?.toLowerCase().includes('follow up') ||
                     token.description?.toLowerCase().includes('followup');

  // State for notes input
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notesInput, setNotesInput] = useState(token.consultationNotes || '');
  
  // Use the update token status hook
  const { mutate: updateTokenStatus } = useUpdateTokenStatus();

  // Handle marking as no show
  const handleMarkNoShow = () => {
    Alert.alert(
      'Mark as No Show',
      'Are you sure you want to mark this patient as no show?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            updateTokenStatus({ 
              tokenId: token.id, 
              status: 'MISSED'
            });
          }
        }
      ]
    );
  };

  // Handle adding notes
  const handleAddNotes = () => {
    setShowNotesInput(true);
  };

  // Save notes
  const saveNotes = () => {
    updateTokenStatus({ 
      tokenId: token.id, 
      consultationNotes: notesInput
    });
    setShowNotesInput(false);
  };

  // Cancel notes input
  const cancelNotes = () => {
    setNotesInput(token.consultationNotes || '');
    setShowNotesInput(false);
  };

  return (
    <View style={tw`bg-white p-4 rounded-xl shadow-sm mb-4 border-l-4 ${
      token.status === 'COMPLETED' ? 'border-green-500' : 
      token.status === 'IN_PROGRESS' ? 'border-orange-500' : 
      token.status === 'UPCOMING' ? 'border-blue-500' : 
      token.status === 'MISSED' ? 'border-red-500' : 'border-gray-500'
    }`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center`}>
            <MyText style={tw`text-lg font-bold`}>Token #{token.queueNumber}</MyText>
            {isPriority && (
              <View style={tw`ml-2 bg-red-500 px-2 py-1 rounded-full flex-row items-center`}>
                <Ionicons name="alert-circle" size={12} color="white" />
                <MyText style={tw`text-white text-xs font-bold ml-1`}>URGENT</MyText>
              </View>
            )}
            {isFollowUp && (
              <View style={tw`ml-2 bg-purple-500 px-2 py-1 rounded-full`}>
                <MyText style={tw`text-white text-xs font-bold`}>FOLLOW-UP</MyText>
              </View>
            )}
          </View>
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
      {showNotesInput ? (
        <View style={tw`mt-2 p-2 bg-blue-50 rounded`}>
          <TextInput
            style={tw`border border-gray-300 rounded p-2 mb-2`}
            value={notesInput}
            onChangeText={setNotesInput}
            placeholder="Enter consultation notes"
            multiline
          />
          <View style={tw`flex-row justify-end`}>
            <MyText 
              style={tw`text-gray-600 mr-4`}
              onPress={cancelNotes}
            >
              Cancel
            </MyText>
            <MyText 
              style={tw`text-blue-600 font-medium`}
              onPress={saveNotes}
            >
              Save
            </MyText>
          </View>
        </View>
      ) : token.consultationNotes ? (
        <View style={tw`mt-2 p-2 bg-blue-50 rounded`}>
          <MyText style={tw`text-blue-800 text-sm`}>
            <MyText style={tw`font-medium`}>Notes: </MyText>
            {token.consultationNotes}
          </MyText>
        </View>
      ) : null}
      {/* Action buttons for doctors */}
      {token.status === 'UPCOMING' && (
        <View style={tw`flex-row mt-3`}>
          <View style={tw`flex-1`}>
            <MyText 
              style={tw`text-red-500 text-center text-sm underline`}
              onPress={handleMarkNoShow}
            >
              Mark as No Show
            </MyText>
          </View>
          <View style={tw`flex-1`}>
            <MyText 
              style={tw`text-blue-500 text-center text-sm underline`}
              onPress={handleAddNotes}
            >
              Add Notes
            </MyText>
          </View>
        </View>
      )}
      {token.status === 'IN_PROGRESS' && (
        <View style={tw`flex-row mt-3`}>
          <View style={tw`flex-1`}>
            <MyText 
              style={tw`text-green-500 text-center text-sm underline`}
              onPress={() => updateTokenStatus({ tokenId: token.id, status: 'COMPLETED' })}
            >
              Mark as Completed
            </MyText>
          </View>
          <View style={tw`flex-1`}>
            <MyText 
              style={tw`text-blue-500 text-center text-sm underline`}
              onPress={handleAddNotes}
            >
              Add Notes
            </MyText>
          </View>
        </View>
      )}
    </View>
  );
};

export default DoctorTokenCard;
