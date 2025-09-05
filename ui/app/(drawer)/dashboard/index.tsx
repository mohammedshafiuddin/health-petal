import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import tw from '@/app/tailwind'
import UserDashboard from '@/components/user-dashboard'
import { useThemeColor } from '@/hooks/useThemeColor'
import MyText from '@/components/text'
import { ThemedView } from '@/components/ThemedView'
import { useRoles } from '@/components/context/roles-context'
import { ROLE_NAMES } from '@/lib/constants'
import useHideDrawerHeader from '@/hooks/useHideDrawerHeader'
import HospitalAdminDashboard from '@/components/hospital-admin-dashboard'

function Index() {
    const { roles } = useRoles()
    const accentColor = useThemeColor({ light: '#4f46e5', dark: '#818cf8' }, 'tint')
    
    // Use the hook to hide the drawer header if needed

    // If roles are still loading, show a loading indicator
    if (!roles) {
        return (
            <ThemedView style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color={accentColor} />
                <MyText style={tw`mt-4`}>Loading dashboard...</MyText>
            </ThemedView>
        )
    }

    // Logic to determine which dashboard to show based on roles
    if (roles.includes(ROLE_NAMES.HOSPITAL_ADMIN)) {
        return <HospitalAdminDashboard />
    } else if (roles.includes(ROLE_NAMES.DOCTOR)) {
        // TODO: Add DoctorDashboard component
        return (
            <ThemedView style={tw`flex-1 justify-center items-center`}>
                <MyText style={tw`text-xl font-semibold`}>Doctor Dashboard</MyText>
                <MyText style={tw`mt-2`}>Coming soon...</MyText>
            </ThemedView>
        )
    } else if (roles.includes(ROLE_NAMES.DOCTOR_SECRETARY)) {
        // TODO: Add SecretaryDashboard component
        return (
            <ThemedView style={tw`flex-1 justify-center items-center`}>
                <MyText style={tw`text-xl font-semibold`}>Secretary Dashboard</MyText>
                <MyText style={tw`mt-2`}>Coming soon...</MyText>
            </ThemedView>
        )
    } else {
        // Default to the regular user dashboard
        return <UserDashboard />
    }
}

export default Index
