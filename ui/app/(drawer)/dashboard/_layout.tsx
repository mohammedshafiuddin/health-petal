import { Stack } from 'expo-router'
import React, { useEffect } from 'react'
import { useAuth } from '@/components/context/auth-context'

function DashboardLayout() {
    const { isLoggedIn, refreshResponsibilities, responsibilities } = useAuth();
    console.log({responsibilities})
    
    
    // Refresh responsibilities when dashboard is loaded
    useEffect(() => {
        if (isLoggedIn) {
            refreshResponsibilities();
        }
    }, [isLoggedIn]);

    return (
        <Stack screenOptions={{ headerShown: false }} />
    )
}

export default DashboardLayout
