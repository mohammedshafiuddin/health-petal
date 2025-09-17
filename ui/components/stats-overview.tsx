import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MyText from '@/components/text';
import tw from '@/app/tailwind';

interface StatsOverviewProps {
  upcomingCount: number;
  monthlyCount: number;
  totalCount: number;
  onStatsPress?: () => void;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  upcomingCount, 
  monthlyCount, 
  totalCount,
  onStatsPress 
}) => {
  return (
    <View style={tw`flex-row justify-between`}>
      <TouchableOpacity 
        style={tw`bg-white bg-opacity-20 rounded-xl p-3 flex-1 mr-2`}
        onPress={onStatsPress}
      >
        <MyText style={tw`text-white text-xs opacity-80`}>Upcoming</MyText>
        <MyText style={tw`text-white text-xl font-bold`}>{upcomingCount}</MyText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={tw`bg-white bg-opacity-20 rounded-xl p-3 flex-1 mx-1`}
        onPress={onStatsPress}
      >
        <MyText style={tw`text-white text-xs opacity-80`}>This Month</MyText>
        <MyText style={tw`text-white text-xl font-bold`}>{monthlyCount}</MyText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={tw`bg-white bg-opacity-20 rounded-xl p-3 flex-1 ml-2`}
        onPress={onStatsPress}
      >
        <MyText style={tw`text-white text-xs opacity-80`}>Total</MyText>
        <MyText style={tw`text-white text-xl font-bold`}>{totalCount}</MyText>
      </TouchableOpacity>
    </View>
  );
};

export default StatsOverview;