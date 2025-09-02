import tw from '@/app/tailwind'
import MyText from '@/components/text'
import React from 'react'

interface Props {}

function Index(props: Props) {
    const {} = props

    return (
        <MyText style={tw`text-violet-500`}>
            Dashboard Home
        </MyText>
    )
}

export default Index
