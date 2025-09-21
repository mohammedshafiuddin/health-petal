import { Redirect } from 'expo-router';
import React from 'react';

interface Props {}

function Index(props: Props) {
    const {} = props;

    // Redirect to the main dashboard page
    return <Redirect href="/(drawer)/dashboard" />;
}

export default Index;