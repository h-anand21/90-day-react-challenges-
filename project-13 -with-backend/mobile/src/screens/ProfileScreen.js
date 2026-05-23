import { View, Image } from 'react-native';
import { Text } from '../components/Typography';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, Edit3 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getAvatarSource } from '../utils/avatars';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 p-6" style={{ backgroundColor: '#0d0d0d' }}>
      <View className="items-center mb-12 mt-8">
        <View className="w-28 h-28 bg-[#1a1a1a] rounded-full items-center justify-center border-2 border-brand-500 mb-4 overflow-hidden shadow-lg">
          {user?.avatar ? (
            <Image source={getAvatarSource(user.avatar)} style={{ width: '100%', height: '100%' }} />
          ) : (
            <User size={48} color="#a3a3a3" />
          )}
        </View>
        <Text className="text-2xl font-black text-white mb-1">{user?.name || 'User'}</Text>
        <Text className="text-sm font-medium text-text-secondary">{user?.email}</Text>
        {user?.gender && (
          <View className="bg-brand-500/20 px-3 py-1 rounded-full mt-3 border border-brand-500/30">
            <Text className="text-xs font-bold text-brand-500 uppercase tracking-widest">{user.gender}</Text>
          </View>
        )}
      </View>

      <View className="flex-1 space-y-4">
        <Button 
          title="Edit Profile" 
          variant="primary" 
          icon={Edit3}
          onPress={() => navigation.navigate('ProfileSetup')} 
        />
        
        <Button 
          title="Logout" 
          variant="danger" 
          icon={LogOut}
          onPress={logout} 
        />
      </View>
    </SafeAreaView>
  );
}
