import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl, ActivityIndicator } from 'react-native';
import { Text } from '../components/Typography';
import { Card } from '../components/Card';
import { TripCard } from '../components/TripCard';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Plane, AlertCircle } from 'lucide-react-native';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchTrips = async () => {
    try {
      setError(null);
      const res = await client.get('/trips');
      if (res.data.success) {
        setTrips(res.data.trips || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    
    // Refresh when navigating back from CreateTrip
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTrips();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="flex-row justify-between items-center px-6 py-4">
        <View>
          <Text variant="h2">Hi, {user?.name?.split(' ')[0] || 'Traveler'} 👋</Text>
          <Text variant="secondary">Where to next?</Text>
        </View>
        <Button 
          icon={Plus} 
          title="" 
          className="w-12 h-12 p-0 rounded-full" 
          onPress={() => navigation.navigate('CreateTrip')} 
        />
      </View>

      {error && (
        <View className="px-6 mb-4">
          <Card className="bg-danger/10 border-danger/20 flex-row items-center p-3">
            <AlertCircle size={18} color="#ef4444" />
            <Text className="text-danger ml-2 flex-1 text-xs">{error}</Text>
          </Card>
        </View>
      )}

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
        }
      >
        <Text variant="h3" className="mb-4 mt-2">Your Journeys</Text>

        {trips.length === 0 ? (
          <Card className="items-center py-12 mt-4">
            <View className="w-16 h-16 bg-surface-200 rounded-full items-center justify-center mb-4">
              <Plane size={32} color="#525252" />
            </View>
            <Text variant="h3" className="mb-1">No trips yet</Text>
            <Text variant="secondary" className="text-center mb-6">
              Start planning your first adventure!
            </Text>
            <Button 
              title="Create New Trip" 
              variant="ghost" 
              onPress={() => navigation.navigate('CreateTrip')} 
            />
          </Card>
        ) : (
          trips.map((trip) => (
            <TripCard 
              key={trip._id} 
              trip={trip} 
              onPress={() => navigation.navigate('TripDetail', { tripId: trip._id })} 
            />
          ))
        )}
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
