import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text } from '../components/Typography';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';

export default function CreateTripScreen({ navigation }) {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Upcoming'
  });
  const [loading, setLoading] = useState(false);

  const statuses = ['Upcoming', 'Planning', 'Completed', 'Cancelled'];

  const handleCreate = async () => {
    if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Destination, Dates)');
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/trips', formData);
      if (res.data.success) {
        Alert.alert('Success', 'Trip created successfully!');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          <Input 
            label="Trip Title"
            placeholder="e.g. Summer Vacation 2026"
            value={formData.title}
            onChangeText={(val) => setFormData({...formData, title: val})}
          />
          <Input 
            label="Destination"
            placeholder="e.g. Paris, France"
            value={formData.destination}
            onChangeText={(val) => setFormData({...formData, destination: val})}
          />
          
          <View className="mb-6">
            <Text variant="secondary" className="mb-2 font-medium">Trip Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFormData({...formData, status})}
                  className={`px-4 py-2 rounded-full border ${
                    formData.status === status 
                      ? 'bg-brand-500 border-brand-500' 
                      : 'bg-surface-200 border-border'
                  }`}
                >
                  <Text className={`text-xs font-bold ${
                    formData.status === status ? 'text-white' : 'text-text-secondary'
                  }`}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row gap-x-4">
            <View className="flex-1">
              <Input 
                label="Start Date"
                placeholder="YYYY-MM-DD"
                value={formData.startDate}
                onChangeText={(val) => setFormData({...formData, startDate: val})}
              />
            </View>
            <View className="flex-1">
              <Input 
                label="End Date"
                placeholder="YYYY-MM-DD"
                value={formData.endDate}
                onChangeText={(val) => setFormData({...formData, endDate: val})}
              />
            </View>
          </View>
          <Input 
            label="Description (Optional)"
            placeholder="What's the plan?"
            multiline
            className="h-24"
            value={formData.description}
            onChangeText={(val) => setFormData({...formData, description: val})}
          />

          <Button 
            title="Create Trip" 
            onPress={handleCreate} 
            loading={loading}
            className="mt-6 mb-12"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
