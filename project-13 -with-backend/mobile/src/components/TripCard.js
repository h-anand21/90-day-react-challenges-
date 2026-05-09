import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Typography';
import { Card } from './Card';
import { Calendar, MapPin, ChevronRight } from 'lucide-react-native';

export const TripCard = ({ trip, onPress }) => {
  const statusColors = {
    Upcoming: 'bg-brand-500/20 text-brand-500',
    Planning: 'bg-blue-500/20 text-blue-500',
    Completed: 'bg-success/20 text-success',
    Cancelled: 'bg-danger/20 text-danger',
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mb-4">
      <Card className="flex-row items-center p-4">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className={`px-2 py-0.5 rounded-full ${statusColors[trip.status] || 'bg-surface-200 text-text-secondary'}`}>
              <Text className="text-[10px] font-bold uppercase tracking-wider">
                {trip.status || 'Planned'}
              </Text>
            </View>
          </View>
          
          <Text variant="h3" className="mb-1">{trip.title}</Text>
          
          <View className="flex-row items-center">
            <MapPin size={12} color="#a3a3a3" />
            <Text variant="secondary" className="ml-1 mr-4">{trip.destination}</Text>
            
            <Calendar size={12} color="#a3a3a3" />
            <Text variant="secondary" className="ml-1">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
          </View>
        </View>
        
        <ChevronRight size={20} color="#525252" />
      </Card>
    </TouchableOpacity>
  );
};
