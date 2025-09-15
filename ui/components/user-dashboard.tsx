import tw from '@/app/tailwind'
import MyText from '@/components/text'
import React from 'react'
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useFeaturedDoctors, useFeaturedHospitals } from '@/api-hooks/dashboard.api'
import DoctorDetails from '@/components/doctor-details'
import { useRouter } from 'expo-router'
import { ThemedView } from '@/components/ThemedView'
import { useThemeColor } from '@/hooks/useThemeColor'
import AppContainer from '@/components/app-container'

interface UserDashboardProps {
  // Add any props you might need to pass to the dashboard
}

const UserDashboard: React.FC<UserDashboardProps> = (props) => {
    const router = useRouter()
    const textColor = useThemeColor({ light: '#333', dark: '#f3f4f6' }, 'text')
    const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint')
    
    const { data: featuredDoctors, isLoading: isLoadingDoctors, error: doctorsError } = useFeaturedDoctors(3)
    const { data: featuredHospitals, isLoading: isLoadingHospitals, error: hospitalsError } = useFeaturedHospitals(3)

    
    return (
        <AppContainer>

            {/* Featured Doctors Section */}
            <View style={tw`mb-8`}>
                <View style={tw`flex-row justify-between items-center mb-4`}>
                    <MyText style={tw`text-xl font-semibold`}>Featured Doctors</MyText>
                    <TouchableOpacity onPress={() => router.push("/(drawer)/doctors" as any)}>
                        <MyText style={[tw`text-sm`, { color: accentColor }]}>View All</MyText>
                    </TouchableOpacity>
                </View>
                
                {isLoadingDoctors ? (
                    <ThemedView style={tw`p-4 items-center`}>
                        <ActivityIndicator size="large" color={accentColor} />
                        <MyText style={tw`mt-2 text-center`}>Loading featured doctors...</MyText>
                    </ThemedView>
                ) : doctorsError ? (
                    <ThemedView style={tw`p-4`}>
                        <MyText style={tw`text-red-500 text-center`}>
                            Failed to load featured doctors
                        </MyText>
                    </ThemedView>
                ) : featuredDoctors && featuredDoctors.length > 0 ? (
                    <View>
                        {featuredDoctors.map(doctor => (
                            <DoctorDetails 
                                key={doctor.id}
                                doctorId={doctor.id}
                                onPress={() => router.push(`/(drawer)/dashboard/doctor-details/${doctor.id}` as any)}
                            />
                        ))}
                    </View>
                ) : (
                    <ThemedView style={tw`p-4`}>
                        <MyText style={tw`text-center`}>No featured doctors available</MyText>
                    </ThemedView>
                )}
            </View>
            
            {/* Featured Hospitals Section */}
            <View>
                <View style={tw`flex-row justify-between items-center mb-4`}>
                    <MyText style={tw`text-xl font-semibold`}>Top Hospitals</MyText>
                    <TouchableOpacity onPress={() => router.push("/(drawer)/hospitals" as any)}>
                        <MyText style={[tw`text-sm`, { color: accentColor }]}>View All</MyText>
                    </TouchableOpacity>
                </View>
                
                {isLoadingHospitals ? (
                    <ThemedView style={tw`p-4 items-center`}>
                        <ActivityIndicator size="large" color={accentColor} />
                        <MyText style={tw`mt-2 text-center`}>Loading top hospitals...</MyText>
                    </ThemedView>
                ) : hospitalsError ? (
                    <ThemedView style={tw`p-4`}>
                        <MyText style={tw`text-red-500 text-center`}>
                            Failed to load top hospitals
                        </MyText>
                    </ThemedView>
                ) : featuredHospitals && featuredHospitals.length > 0 ? (
                    <View>
                        {featuredHospitals.map(hospital => (
                            <TouchableOpacity 
                                key={hospital.id}
                                style={tw`bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 shadow-sm border border-gray-200 dark:border-gray-700`}
                                onPress={() => router.push(`/(drawer)/dashboard/hospital-details/${hospital.id}` as any)}
                            >
                                <MyText style={tw`text-lg font-semibold`}>{hospital.name}</MyText>
                                <MyText style={tw`text-sm text-gray-500 mt-1`}>{hospital.address}</MyText>
                                {hospital.description && (
                                    <MyText 
                                        style={tw`text-sm mt-2`} 
                                        numberOfLines={2}
                                    >
                                        {hospital.description}
                                    </MyText>
                                )}
                                {hospital.employeeCount !== undefined && (
                                    <MyText style={tw`text-xs text-gray-500 mt-1`}>
                                        {hospital.employeeCount} medical professionals
                                    </MyText>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <ThemedView style={tw`p-4`}>
                        <MyText style={tw`text-center`}>No top hospitals available</MyText>
                    </ThemedView>
                )}
            </View>
        </AppContainer>
    )
}

export default UserDashboard
