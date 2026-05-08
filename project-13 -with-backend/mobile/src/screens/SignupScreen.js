import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from '../components/Typography';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react-native';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await register(name, email, password);
    
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="mb-10 items-center">
            <View className="w-16 h-16 bg-brand-500 rounded-2xl items-center justify-center mb-4">
              <UserPlus color="white" size={32} />
            </View>
            <Text variant="h1">Create Account</Text>
            <Text variant="secondary">Join the TripSync community</Text>
          </View>

          <View className="mb-6">
            <Input 
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
            />
            <Input 
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input 
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={error}
            />
          </View>

          <Button 
            title="Create Account" 
            onPress={handleSignup} 
            loading={loading}
            className="mb-6"
          />
          
          <View className="flex-row justify-center">
            <Text variant="secondary">Already have an account? </Text>
            <Text 
              variant="brand" 
              onPress={() => navigation.navigate('Login')}
            >Login</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
