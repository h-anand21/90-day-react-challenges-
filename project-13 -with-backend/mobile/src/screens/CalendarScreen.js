import React from 'react';
import { View } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';

export default function CalendarScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center" style={{ backgroundColor: '#111111' }}>
      <View className="items-center">
        <View className="w-20 h-20 bg-brand-500/10 rounded-full items-center justify-center mb-6">
          <Calendar size={40} color="#f97316" />
        </View>
        <Text className="text-2xl font-bold text-white mb-2">Calendar</Text>
        <Text className="text-text-muted text-sm text-center px-10">
          Your trip calendar will appear here.{'\n'}Coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}
