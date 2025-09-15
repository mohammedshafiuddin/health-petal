import { Redirect } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'

interface Props {}

function Index(props: Props) {
    const {} = props

    // return (
    //     <Text>Hello WOrld</Text>
    // )
    return (
        <Redirect href={`/(drawer)/login`} />
    )
}

export default Index
