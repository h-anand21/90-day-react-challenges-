import React, { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, TextInput, Image, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Typography';
import { Search, MapPin, Calendar, ChevronRight, Briefcase, Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import client, { getImageUri } from '../api/client';
import { getDynamicTripStatus, getDestinationImage } from './DashboardScreen'; // Import helpers from Dashboard

const THEME = { surface: '#0d0d0d', brand: '#f97316', textMuted: '#525252', textSecondary: '#a3a3a3', border: '#2e2e2e' };

const STATUS_COLORS = {
  upcoming: { bg: '#f9731620', text: '#f97316' },
  planning: { bg: '#3b82f620', text: '#3b82f6' },
  ongoing: { bg: '#22c55e20', text: '#22c55e' },
  completed: { bg: '#a3a3a320', text: '#a3a3a3' },
  cancelled: { bg: '#ef444420', text: '#ef4444' },
};

const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ExploreScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTrips = async () => {
    try {
      const { data } = await client.get('/trips?limit=100');
      if (data.success) {
        // Sort trips by start date (newest first, or upcoming first)
        const sorted = (data.trips || []).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setTrips(sorted);
      }
    } catch (error) {
      console.log('Error fetching trips in explore:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  // Filter trips based on search query and status filter
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'All') return true;

    const dynamicStatus = getDynamicTripStatus(trip.startDate, trip.endDate);
    return dynamicStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: THEME.surface }}>
        <ActivityIndicator size="large" color={THEME.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: THEME.surface }} edges={['top']}>
      {/* Dynamic Top Banner */}
      <View className="px-6 pt-3 pb-6 border-b" style={{ borderColor: '#222222' }}>
        <Text className="text-3xl font-black text-white" style={{ letterSpacing: -0.5 }}>Explore</Text>
        <Text className="text-sm font-semibold mt-1" style={{ color: '#737373' }}>
          Discover your journey archive
        </Text>
      </View>

      {/* Search & Filters */}
      <View className="px-6 pt-5 pb-2">
        <View className="w-full flex-row items-center border rounded-2xl px-4 mb-4" style={{ backgroundColor: '#141414', borderColor: '#222222', height: 48 }}>
          <Search size={18} color="#525252" />
          <TextInput
            className="flex-1 text-white text-sm ml-3 font-semibold"
            placeholder="Search trip archive..."
            placeholderTextColor="#525252"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Horizontal Status Filter Capsules */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
          {['All', 'planning', 'ongoing', 'completed'].map((status) => {
            const isActive = statusFilter.toLowerCase() === status.toLowerCase();
            return (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                className="px-4 py-2 rounded-full mr-2.5 border"
                style={{
                  backgroundColor: isActive ? 'rgba(249,115,22,0.06)' : '#111111',
                  borderColor: isActive ? '#f97316' : '#222222'
                }}
              >
                <View className="flex-row items-center">
                  {status !== 'All' && (
                    <View 
                      style={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: 3, 
                        backgroundColor: status === 'planning' ? '#3b82f6' : status === 'ongoing' ? '#f97316' : '#22c55e',
                        marginRight: 6
                      }} 
                    />
                  )}
                  <Text className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                    {status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List */}
      <ScrollView
        className="flex-1 px-6 pt-2"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.brand} />}
      >
        {filteredTrips.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Search size={40} color="#525252" />
            <Text className="text-white font-extrabold text-sm mt-3">No matching trips found</Text>
            <Text className="text-xs text-neutral-500 mt-1 mb-6 text-center">Try modifying your query or filters, or create a new trip!</Text>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateTrip')}
              activeOpacity={0.9}
              className="flex-row items-center justify-center px-6"
              style={{ 
                height: 48,
                backgroundColor: '#f97316',
                borderRadius: 999,
              }}
            >
              <Text className="text-white font-bold text-[13px] uppercase tracking-wider mr-2">
                Create New Trip
              </Text>
              <Plus size={16} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center mb-3">
              <Text className="text-xs font-semibold" style={{ color: '#737373' }}>Showing </Text>
              <Text className="text-xs font-bold" style={{ color: '#f97316' }}>{filteredTrips.length}</Text>
              <Text className="text-xs font-semibold" style={{ color: '#737373' }}> trips</Text>
            </View>
            
            {filteredTrips.map((trip) => {
              const dynamicStatus = getDynamicTripStatus(trip.startDate, trip.endDate);
              const statusStyle = STATUS_COLORS[dynamicStatus] || STATUS_COLORS.planning;
              return (
                <TouchableOpacity
                  key={trip._id + '_all_modal'}
                  onPress={() => navigation.navigate('TripDetail', { tripId: trip._id })}
                  activeOpacity={0.88}
                  className="mb-3.5 rounded-[24px] border p-3 flex-row items-center justify-between"
                  style={{ backgroundColor: '#111111', borderColor: '#222222' }}
                >
                  {/* Left: Perfect Circle Cover Image */}
                  <View className="mr-3.5">
                    <Image
                      source={{ uri: getImageUri(trip.coverImage || getDestinationImage(trip.destination)) }}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        borderWidth: 1.5,
                        borderColor: '#2e2e2e'
                      }}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Center: Details */}
                  <View className="flex-1 mr-2">
                    <Text className="text-[15px] font-black text-white mb-1.5" numberOfLines={1}>
                      {trip.title}
                    </Text>
                    
                    <View className="flex-row items-center mb-1">
                      <MapPin size={10} color="#a3a3a3" />
                      <Text className="text-neutral-400 text-[11px] font-bold ml-1" numberOfLines={1}>
                        {trip.destination}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Calendar size={10} color="#737373" />
                      <Text className="text-neutral-500 text-[10px] font-semibold ml-1">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </Text>
                    </View>
                  </View>

                  {/* Right: Status, Budget, and Arrow Column */}
                  <View className="flex-row items-center">
                    <View className="items-end justify-center">
                      <View 
                        className="px-2 py-0.5 rounded-full border mb-1.5" 
                        style={{ 
                          backgroundColor: 'rgba(15,15,15,0.7)', 
                          borderColor: statusStyle.text + '30' 
                        }}
                      >
                        <Text className="text-[8px] font-black uppercase tracking-wider" style={{ color: statusStyle.text }}>
                          {dynamicStatus}
                        </Text>
                      </View>

                      <Text className="text-[14px] font-black text-emerald-500 leading-none">
                        ₹{(trip.totalBudget || 0).toLocaleString('en-IN')}
                      </Text>
                      <Text className="text-[8px] text-neutral-500 font-bold mt-0.5">Total Budget</Text>
                    </View>

                    <View className="w-8 h-8 rounded-full items-center justify-center border ml-3" style={{ backgroundColor: '#141414', borderColor: '#222222' }}>
                      <ChevronRight size={12} color="#a3a3a3" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View className="items-center justify-center py-6 mt-2 mb-6">
              <View className="w-12 h-12 rounded-2xl items-center justify-center border mb-2" style={{ backgroundColor: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.15)' }}>
                <Briefcase size={18} color="#f97316" />
              </View>
              <Text className="text-white font-extrabold text-sm text-center">No more trips here</Text>
              <Text className="text-xs text-neutral-500 text-center mt-1">Start planning your next adventure!</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
