import tw from '@/app/tailwind'
import React from 'react'
import { KeyboardAvoidingView, ScrollView, View } from 'react-native'

interface Props {
    children: React.ReactNode
}

function AppContainer(props: Props) {
    const { children } = props

    return (
        <ScrollView style={tw`flex-1 bg-white p-4`}>
            <KeyboardAvoidingView behavior='padding'>

            {children}
            </KeyboardAvoidingView>

            <View style={tw`h-16`}></View>
        </ScrollView>
    )
}

export default AppContainer
