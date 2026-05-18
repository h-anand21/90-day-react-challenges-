import React from 'react';
import { View } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center" style={{ backgroundColor: '#111111' }}>
      <View className="items-center">
        <View className="w-20 h-20 bg-brand-500/10 rounded-full items-center justify-center mb-6">
          <Bell size={40} color="#f97316" />
        </View>
        <Text className="text-2xl font-bold text-white mb-2">Notifications</Text>
        <Text className="text-text-muted text-sm text-center px-10">
          Trip updates and alerts will appear here.{'\n'}Coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}
