import AppContainer from '@/components/app-container'
import MyText from '@/components/text'
import React, { useState } from 'react'
import { View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useHospitalTodaysTokens, useDoctorTodaysTokens } from '@/api-hooks/token.api'
import { getJWT } from '@/hooks/useJWT'
import tw from '@/app/tailwind';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { DoctorTokenSummary, DoctorTodayToken } from 'shared-types';
import { Ionicons } from '@expo/vector-icons';
import { ErrorToast } from '@/services/toaster';
import DoctorTokenCard from './DoctorTokenCard';

interface Props {}

function Index(props: Props) {
    const {} = props
    const jwt = getJWT();
    const router = useRouter();
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // Using the hospital today API to fetch top tokens of doctors
    const { 
        data: hospitalTokensData, 
        isLoading: isLoadingHospital, 
        error: hospitalError,
        isError: isHospitalError,
        refetch: refetchHospital 
    } = useHospitalTodaysTokens();
    
    // Fetch selected doctor's tokens if a doctor is selected
    const {
        data: doctorTokensData,
        isLoading: isLoadingDoctor,
        error: doctorError,
        isError: isDoctorError,
        refetch: refetchDoctor
    } = useDoctorTodaysTokens(selectedDoctorId || 0);
    
    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetchHospital();
            if (selectedDoctorId) {
                await refetchDoctor();
            }
        } catch (err) {
            ErrorToast('Failed to refresh tokens');
        } finally {
            setRefreshing(false);
        }
    };
    
    // Format date to be more readable
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };
    
    const handleBackToSummary = () => {
        setSelectedDoctorId(null);
    };
    
    const handleSelectDoctor = (doctorId: number) => {
        setSelectedDoctorId(doctorId);
    };

    return (
        <AppContainer>
            <ScrollView
                style={tw`flex-1`}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={tw`p-4`}>
                    {/* Header with back button if doctor is selected */}
                    {selectedDoctorId ? (
                        <View style={tw`mb-4`}>
                            <TouchableOpacity 
                                style={tw`flex-row items-center`}
                                onPress={handleBackToSummary}
                            >
                                <Ionicons name="arrow-back" size={24} color="#4361ee" />
                                <MyText style={tw`ml-2 text-blue-600`}>Back to all doctors</MyText>
                            </TouchableOpacity>
                            <MyText style={tw`text-2xl font-bold mt-2`}>
                                {doctorTokensData?.doctorName}'s Tokens
                            </MyText>
                            <MyText style={tw`text-gray-500`}>
                                {doctorTokensData?.date ? formatDate(doctorTokensData.date) : 'Today'}
                            </MyText>
                        </View>
                    ) : (
                        <View style={tw`mb-4`}>
                            <MyText style={tw`text-2xl font-bold`}>Today's Tokens</MyText>
                            <MyText style={tw`text-gray-500`}>
                                {hospitalTokensData?.hospitalName || 'Your Hospital'} - {hospitalTokensData?.date ? formatDate(hospitalTokensData.date) : 'Today'}
                            </MyText>
                        </View>
                    )}
                    
                    {/* Loading state */}
                    {(isLoadingHospital && !hospitalTokensData) || (selectedDoctorId && isLoadingDoctor && !doctorTokensData) ? (
                        <View style={tw`items-center justify-center py-8`}>
                            <ActivityIndicator size="large" color="#4361ee" />
                            <MyText style={tw`mt-4 text-gray-500`}>Loading tokens...</MyText>
                        </View>
                    ) : isHospitalError && !selectedDoctorId ? (
                        <View style={tw`bg-red-50 p-4 rounded-lg mb-4`}>
                            <MyText style={tw`text-red-600`}>
                                Error loading tokens: {hospitalError instanceof Error ? hospitalError.message : 'Unknown error'}
                            </MyText>
                            <TouchableOpacity 
                                style={tw`bg-blue-500 px-4 py-2 rounded-lg mt-4 self-start`}
                                onPress={onRefresh}
                            >
                                <MyText style={tw`text-white font-medium`}>Retry</MyText>
                            </TouchableOpacity>
                        </View>
                    ) : isDoctorError && selectedDoctorId ? (
                        <View style={tw`bg-red-50 p-4 rounded-lg mb-4`}>
                            <MyText style={tw`text-red-600`}>
                                Error loading doctor's tokens: {doctorError instanceof Error ? doctorError.message : 'Unknown error'}
                            </MyText>
                            <TouchableOpacity 
                                style={tw`bg-blue-500 px-4 py-2 rounded-lg mt-4 self-start`}
                                onPress={onRefresh}
                            >
                                <MyText style={tw`text-white font-medium`}>Retry</MyText>
                            </TouchableOpacity>
                        </View>
                    ) : selectedDoctorId ? (
                        // Doctor detail view
                        <View>
                            {/* Current token indicator */}
                            {doctorTokensData?.currentTokenNumber && (
                                <View style={tw`bg-blue-100 p-4 rounded-lg mb-4 flex-row justify-between items-center`}>
                                    <View>
                                        <MyText style={tw`text-blue-800 font-bold`}>
                                            Current Token: #{doctorTokensData.currentTokenNumber}
                                        </MyText>
                                        <MyText style={tw`text-blue-700 text-sm`}>
                                            {doctorTokensData.completedTokens} of {doctorTokensData.totalTokens} completed
                                        </MyText>
                                    </View>
                                    <View style={tw`bg-blue-500 px-3 py-1 rounded-full`}>
                                        <MyText style={tw`text-white font-bold`}>
                                            IN PROGRESS
                                        </MyText>
                                    </View>
                                </View>
                            )}
                            
                            {/* Doctor's tokens list */}
                            {doctorTokensData?.tokens && doctorTokensData.tokens.length > 0 ? (
                                doctorTokensData.tokens.map((token) => (
                                    <DoctorTokenCard key={token.id} token={token} />
                                ))
                            ) : (
                                <View style={tw`bg-gray-100 p-6 rounded-lg items-center`}>
                                    <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
                                    <MyText style={tw`text-center text-gray-500 mt-2`}>
                                        No tokens available for this doctor today.
                                    </MyText>
                                </View>
                            )}
                        </View>
                    ) : (
                        // Hospital summary view - doctors list
                        <View>
                            {hospitalTokensData?.doctors && hospitalTokensData.doctors.length > 0 ? (
                                hospitalTokensData.doctors.map((doctor) => (
                                    <View key={doctor.id} style={tw`mb-8`}>
                                      <View style={tw`flex-row items-center mb-2`}>
                                        <MyText style={tw`text-lg font-bold mr-2`}>{doctor.name}</MyText>
                                        <TouchableOpacity
                                          style={tw`bg-blue-500 px-3 py-1 rounded-full`}
                                          onPress={() => router.push('/(drawer)/todays-tokens/' + doctor.id as any)}
                                        >
                                          <MyText style={tw`text-white text-xs font-medium`}>Show All</MyText>
                                        </TouchableOpacity>
                                      </View>
                                      {doctor.tokens && doctor.tokens.length > 0 ? (
                                        doctor.tokens.map((token) => (
                                          <DoctorTokenCard key={token.id} token={token} />
                                        ))
                                      ) : (
                                        <MyText style={tw`text-gray-500 mb-4`}>No tokens for this doctor today.</MyText>
                                      )}
                                    </View>
                                ))
                            ) : (
                                <View style={tw`bg-gray-100 p-6 rounded-lg items-center`}>
                                    <Ionicons name="medkit-outline" size={48} color="#9ca3af" />
                                    <MyText style={tw`text-center text-gray-500 mt-2`}>
                                        No doctors with tokens available today.
                                    </MyText>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </AppContainer>
    )
}

// Doctor Summary Card Component
interface DoctorSummaryCardProps {
    doctor: DoctorTokenSummary;
    onPress: () => void;
}

const DoctorSummaryCard: React.FC<DoctorSummaryCardProps> = ({ doctor, onPress }) => {
    return (
        <TouchableOpacity 
            style={tw`bg-white p-4 rounded-xl shadow-sm mb-4 border-l-4 border-blue-500`}
            onPress={onPress}
        >
            <View style={tw`flex-row justify-between items-start mb-2`}>
                <View style={tw`flex-1`}>
                    <MyText style={tw`text-lg font-bold`}>{doctor.name}</MyText>
                    {doctor.specializations && doctor.specializations.length > 0 && (
                        <MyText style={tw`text-gray-600 text-sm`}>
                            {doctor.specializations.join(', ')}
                        </MyText>
                    )}
                </View>
                {doctor.currentTokenNumber && (
                    <View style={tw`bg-blue-100 px-3 py-1 rounded-full`}>
                        <MyText style={tw`text-blue-800 text-xs font-medium`}>
                            Current: #{doctor.currentTokenNumber}
                        </MyText>
                    </View>
                )}
            </View>
            
            {/* Token statistics */}
            <View style={tw`flex-row justify-between mt-3`}>
                <View style={tw`items-center`}>
                    <MyText style={tw`text-gray-500 text-xs`}>Total</MyText>
                    <MyText style={tw`text-blue-600 font-bold`}>{doctor.totalTokens}</MyText>
                </View>
                <View style={tw`items-center`}>
                    <MyText style={tw`text-gray-500 text-xs`}>Completed</MyText>
                    <MyText style={tw`text-green-600 font-bold`}>{doctor.completedTokens}</MyText>
                </View>
                <View style={tw`items-center`}>
                    <MyText style={tw`text-gray-500 text-xs`}>In Progress</MyText>
                    <MyText style={tw`text-orange-500 font-bold`}>{doctor.inProgressTokens}</MyText>
                </View>
                <View style={tw`items-center`}>
                    <MyText style={tw`text-gray-500 text-xs`}>Upcoming</MyText>
                    <MyText style={tw`text-indigo-600 font-bold`}>{doctor.upcomingTokens}</MyText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default Index
