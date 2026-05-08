import { ScrollView, View } from 'react-native';
import { Text } from '../components/Typography';
import { Card } from '../components/Card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { Button } from '../components/Button';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text variant="h2">Hello, Traveler 👋</Text>
            <Text variant="secondary">Your upcoming trips</Text>
          </View>
          <Button icon={Plus} title="" className="w-12 h-12 p-0" onPress={() => {}} />
        </View>

        <Card variant="glass" className="mb-6">
          <Text variant="h3">Paris Getaway</Text>
          <Text variant="secondary" className="mt-1">May 20 - May 28, 2026</Text>
        </Card>
        
        <Card className="mb-6">
          <Text variant="h3">Goa Roadtrip</Text>
          <Text variant="secondary" className="mt-1">Dec 10 - Dec 15, 2026</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
