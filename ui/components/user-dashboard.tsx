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
import { Ionicons } from '@expo/vector-icons'
import QuickActionButton from '@/components/quick-action-button'
import HospitalCard from '@/components/hospital-card'
import WelcomeBanner from '@/components/welcome-banner'
import HealthTipCard from '@/components/health-tip-card'
import SectionHeader from '@/components/section-header'
import UpcomingAppointmentsPreview from '@/components/upcoming-appointments-preview'
import FeaturedDoctorsPreview from '@/components/featured-doctors-preview'
import useHideDrawerHeader from '@/hooks/useHideDrawerHeader'

interface UserDashboardProps {
  userName: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userName }) => {
    const router = useRouter()
    const textColor = useThemeColor({ light: '#333', dark: '#f3f4f6' }, 'text')
    const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint')
    const backgroundColor = useThemeColor({ light: '#f9fafb', dark: '#111827' }, 'background')
    
    const { data: featuredDoctors, isLoading: isLoadingDoctors, error: doctorsError } = useFeaturedDoctors(3)
    const { data: featuredHospitals, isLoading: isLoadingHospitals, error: hospitalsError } = useFeaturedHospitals(3)

    return (
        <AppContainer>
            <ScrollView style={tw`flex-1 bg-gray-50 dark:bg-gray-900`} contentContainerStyle={tw`pb-8`}>
                {/* Welcome Banner */}
                <WelcomeBanner 
                  userName={userName} 
                />

                {/* Quick Actions Section */}
                <View style={tw`mb-6 px-4`}>
                    <SectionHeader 
                      title="Quick Actions" 
                      showViewAll={false}
                    />
                    <View style={tw`flex-row`}>
                        <QuickActionButton
                          title="My Appointments"
                          subtitle="View & manage"
                          icon="calendar"
                          iconColor="#4f46e5"
                          bgColor="#dbeafe"
                          onPress={() => router.push('/(drawer)/my-tokens' as any)}
                          style={tw`flex-1 mr-2`}
                        />
                        
                        <QuickActionButton
                          title="Book Appointment"
                          subtitle="Find doctors"
                          icon="add"
                          iconColor="#10b981"
                          bgColor="#dcfce7"
                          onPress={() => router.push('/(drawer)/appointments' as any)}
                          style={tw`flex-1 mx-1`}
                        />
                        
                        <QuickActionButton
                          title="Medical Records"
                          subtitle="View history"
                          icon="document-text"
                          iconColor="#8b5cf6"
                          bgColor="#f3e8ff"
                          onPress={() => router.push('/(drawer)/medical-records' as any)}
                          style={tw`flex-1 ml-2`}
                        />
                    </View>
                </View>

                {/* Upcoming Appointments Preview */}
                <View style={tw`mb-6 px-4`}>
                    <SectionHeader 
                      title="Upcoming Appointments" 
                      onViewAllPress={() => router.push("/(drawer)/my-tokens" as any)}
                    />
                    
                    <UpcomingAppointmentsPreview 
                      onSeeAllPress={() => router.push("/(drawer)/my-tokens" as any)}
                      onAppointmentPress={() => router.push('/(drawer)/my-tokens' as any)}
                    />
                </View>


                <View style={tw`mb-6 px-4`}>
                    <SectionHeader 
                      title="Featured Doctors" 
                      onViewAllPress={() => router.push("/(drawer)/appointments" as any)}
                    />
                    
                    <FeaturedDoctorsPreview 
                      doctors={featuredDoctors || []}
                      isLoading={isLoadingDoctors}
                      isError={!!doctorsError}
                      error={doctorsError}
                      onViewAllPress={() => router.push("/(drawer)/appointments" as any)}
                      onDoctorPress={(doctorId) => router.push(`/(drawer)/dashboard/doctor-details/${doctorId}` as any)}
                    />
                </View>
                
                {/* Health Tips Section */}
                <View style={tw`mb-6 px-4`}>
                    <SectionHeader 
                      title="Health Tips" 
                      showViewAll={false}
                    />
                    <HealthTipCard
                      title="Stay Hydrated"
                      description="Drink at least 8 glasses of water daily to maintain optimal hydration and support your body's functions."
                      icon="water"
                      onPress={() => router.push('/(drawer)/health-tips/hydration' as any)}
                    />
                </View>
                
                {/* Featured Hospitals Section */}
                <View style={tw`px-4`}>
                    <SectionHeader 
                      title="Top Hospitals" 
                      onViewAllPress={() => router.push("/(drawer)/hospitals" as any)}
                    />
                    
                    {isLoadingHospitals ? (
                        <ThemedView style={tw`p-8 items-center bg-white dark:bg-gray-800 rounded-2xl shadow-md`}>
                            <ActivityIndicator size="large" color={accentColor} />
                            <MyText style={tw`mt-4 text-center text-gray-500 dark:text-gray-400`}>Loading top hospitals...</MyText>
                        </ThemedView>
                    ) : hospitalsError ? (
                        <ThemedView style={tw`p-6 bg-red-50 dark:bg-red-900 rounded-2xl`}>
                            <MyText style={tw`text-red-600 dark:text-red-200 text-center`}>
                                Failed to load top hospitals
                            </MyText>
                            <TouchableOpacity 
                                style={tw`mt-3 bg-red-500 px-4 py-2 rounded-lg self-center`}
                                onPress={() => window.location.reload()}
                            >
                                <MyText style={tw`text-white`}>Retry</MyText>
                            </TouchableOpacity>
                        </ThemedView>
                    ) : featuredHospitals && featuredHospitals.length > 0 ? (
                        <View>
                            {featuredHospitals.map(hospital => (
                                <HospitalCard
                                  key={hospital.id}
                                  id={hospital.id}
                                  name={hospital.name}
                                  address={hospital.address}
                                  description={hospital.description}
                                  employeeCount={hospital.employeeCount}
                                  onPress={() => router.push(`/(drawer)/dashboard/hospital-details/${hospital.id}` as any)}
                                />
                            ))}
                        </View>
                    ) : (
                        <ThemedView style={tw`p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md items-center`}>
                            <Ionicons name="business-outline" size={48} color="#d1d5db" />
                            <MyText style={tw`mt-2 text-center text-gray-500 dark:text-gray-400`}>No top hospitals available</MyText>
                            <TouchableOpacity 
                                style={tw`mt-3 bg-blue-500 px-4 py-2 rounded-lg`}
                                onPress={() => router.push("/(drawer)/hospitals" as any)}
                            >
                                <MyText style={tw`text-white`}>Explore Hospitals</MyText>
                            </TouchableOpacity>
                        </ThemedView>
                    )}
                </View>
            </ScrollView>
        </AppContainer>
    )
}

export default UserDashboard