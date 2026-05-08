import { View } from 'react-native';
import { Text } from '../components/Typography';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-surface p-6">
      <View className="items-center mb-12 mt-8">
        <View className="w-24 h-24 bg-surface-200 rounded-full items-center justify-center border border-border mb-4">
          <User size={40} color="#a3a3a3" />
        </View>
        <Text variant="h2">{user?.name || 'User'}</Text>
        <Text variant="secondary">{user?.email}</Text>
      </View>

      <Button 
        title="Logout" 
        variant="danger" 
        icon={LogOut}
        onPress={logout} 
      />
    </SafeAreaView>
  );
}
