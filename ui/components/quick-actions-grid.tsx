import React from 'react';
import { View } from 'react-native';
import tw from '@/app/tailwind';
import QuickActionButton from '@/components/quick-action-button';

interface QuickActionsGridProps {
  onAppointmentsPress: () => void;
  onBookAppointmentPress: () => void;
  onMedicalRecordsPress: () => void;
  onConsultationsPress: () => void;
  onPaymentsPress: () => void;
  onHealthTipsPress: () => void;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ 
  onAppointmentsPress,
  onBookAppointmentPress,
  onMedicalRecordsPress,
  onConsultationsPress,
  onPaymentsPress,
  onHealthTipsPress
}) => {
  return (
    <View style={tw`flex-row flex-wrap justify-between`}>
      <View style={tw`flex-row w-full mb-3`}>
        <QuickActionButton
          title="My Appointments"
          subtitle="View & manage"
          icon="calendar"
          iconColor="#4f46e5"
          bgColor="#dbeafe"
          onPress={onAppointmentsPress}
          style={tw`flex-1 mr-2`}
        />
        
        <QuickActionButton
          title="Book Appointment"
          subtitle="Find doctors"
          icon="add"
          iconColor="#10b981"
          bgColor="#dcfce7"
          onPress={onBookAppointmentPress}
          style={tw`flex-1 ml-2`}
        />
      </View>
      
      <View style={tw`flex-row w-full`}>
        <QuickActionButton
          title="Medical Records"
          subtitle="View history"
          icon="document-text"
          iconColor="#8b5cf6"
          bgColor="#f3e8ff"
          onPress={onMedicalRecordsPress}
          style={tw`flex-1 mr-2`}
        />
        
        <QuickActionButton
          title="Consultations"
          subtitle="History"
          icon="chatbubbles"
          iconColor="#f59e0b"
          bgColor="#fffbeb"
          onPress={onConsultationsPress}
          style={tw`flex-1 ml-2`}
        />
      </View>
      
      <View style={tw`flex-row w-full mt-3`}>
        <QuickActionButton
          title="Payments"
          subtitle="Billing"
          icon="card"
          iconColor="#ef4444"
          bgColor="#fee2e2"
          onPress={onPaymentsPress}
          style={tw`flex-1 mr-2`}
        />
        
        <QuickActionButton
          title="Health Tips"
          subtitle="Wellness"
          icon="heart"
          iconColor="#10b981"
          bgColor="#dcfce7"
          onPress={onHealthTipsPress}
          style={tw`flex-1 ml-2`}
        />
      </View>
    </View>
  );
};

export default QuickActionsGrid;