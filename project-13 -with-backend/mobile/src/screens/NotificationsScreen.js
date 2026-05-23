import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, Check, Map, ChevronLeft, Settings } from 'lucide-react-native';
import client from '../api/client';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (e) {
      console.log('Error fetching notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async () => {
    try {
      await client.put('/notifications/read');
    } catch (e) {
      console.log('Error marking notifications as read:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      markAsRead(); // Mark as read when screen is focused
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getIconInfo = (type) => {
    switch(type) {
      case 'TRIP_START_24H': return { Icon: Map, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' };
      case 'TRIP_START_1H': return { Icon: MapPin, color: '#ec9006', bg: 'rgba(236, 144, 6,0.15)' };
      case 'TRIP_ONGOING_DAILY': return { Icon: Check, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
      default: return { Icon: Bell, color: '#a3a3a3', bg: 'rgba(163,163,163,0.15)' };
    }
  };

  const renderItem = ({ item }) => {
    const { Icon, color, bg } = getIconInfo(item.type);
    const imageUrl = item.trip?.coverImage;

    return (
      <View className="flex-row px-4">
        {/* Timeline Column */}
        <View className="w-10 items-center mr-1">
          {/* Vertical Line */}
          <View className="w-[1.5px] flex-1 bg-neutral-800" />
          
          {/* Icon Circle */}
          <View 
            className="w-10 h-10 rounded-full absolute top-6 items-center justify-center border-[3px] border-[#050505]"
            style={{ backgroundColor: bg }}
          >
            <Icon size={18} color={color} />
          </View>
        </View>

        {/* Card Column */}
        <View className="flex-1 py-3">
          <View 
            className="p-3 rounded-2xl border"
            style={{ 
              backgroundColor: item.isRead ? '#111111' : '#1a1410', 
              borderColor: item.isRead ? '#222222' : 'rgba(236, 144, 6,0.3)' 
            }}
          >
            <View className="flex-row">
              {/* Thumbnail Image */}
              {imageUrl ? (
                <Image 
                  source={{ uri: imageUrl }} 
                  className="w-14 h-14 rounded-xl mr-3 bg-neutral-800"
                />
              ) : (
                <View className="w-14 h-14 rounded-xl mr-3 bg-neutral-800 items-center justify-center">
                  <Icon size={24} color="#525252" />
                </View>
              )}
              
              {/* Text Content */}
              <View className="flex-1 justify-center">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-sm font-bold flex-1 pr-2" style={{ color: item.isRead ? '#e5e5e5' : '#ffffff' }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {/* Time and Unread dot */}
                  <View className="flex-row items-center mt-[2px]">
                    <Text className="text-[10px] font-semibold mr-1" style={{ color: color }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {!item.isRead && (
                      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    )}
                  </View>
                </View>
                <Text className="text-xs" style={{ color: '#a3a3a3', lineHeight: 18 }} numberOfLines={2}>
                  {item.message}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: '#050505' }}>
        <ActivityIndicator size="large" color="#ec9006" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#050505' }} edges={['top']}>
      {/* Stylish Header matching the design */}
      <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center"
        >
          <ChevronLeft color="#f5f5f5" size={24} />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-xl font-bold text-white">Travel Assistant</Text>
          <Text className="text-[11px] text-brand-500 font-semibold mt-0.5">Stay updated with every journey.</Text>
        </View>
        
        <TouchableOpacity className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center">
          <Settings color="#f5f5f5" size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10, paddingRight: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec9006" />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-16 h-16 bg-neutral-900 rounded-full items-center justify-center mb-4">
              <Bell size={24} color="#525252" />
            </View>
            <Text className="text-white font-bold mb-1">No Notifications Yet</Text>
            <Text className="text-xs text-neutral-500 text-center px-8">
              Trip updates, reminders, and alerts will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
