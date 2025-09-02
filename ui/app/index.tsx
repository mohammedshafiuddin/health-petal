import { Redirect } from 'expo-router'
import React from 'react'

interface Props {}

function Index(props: Props) {
    const {} = props

    return (
        <Redirect href={`/(drawer)/dashboard`} />
    )
}

export default Index
