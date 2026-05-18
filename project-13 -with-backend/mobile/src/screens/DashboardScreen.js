import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput, Image, Alert, Modal, Dimensions } from 'react-native';
import { Text } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Plane, AlertCircle, Search, MapPin, Calendar, ChevronRight, ChevronDown, SlidersHorizontal, Compass, Landmark, Building2, Trees, PalmTree, Mountain, Globe, Bell, Briefcase, Wallet, Heart, CheckSquare, Shield, Check, Bookmark, Trash2, X, Camera } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import client, { getImageUri } from '../api/client';
import { useAuth } from '../context/AuthContext';

const THEME = { surface: '#0d0d0d', brand: '#f97316', textMuted: '#525252', textSecondary: '#a3a3a3', border: '#2e2e2e' };

// Device-aware responsive dimensions for the entire Dashboard to automatically adjust on all mobile screen widths!
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_LARGE_DEVICE = SCREEN_WIDTH >= 415;

const BANNER_RESPONSIVE = {
  imageWidth: IS_SMALL_DEVICE ? 110 : (IS_LARGE_DEVICE ? 170 : 160),
  imageHeight: IS_SMALL_DEVICE ? 86 : (IS_LARGE_DEVICE ? 132 : 125),
  textLeftMargin: IS_SMALL_DEVICE ? 98 : (IS_LARGE_DEVICE ? 148 : 138),
  titleSize: IS_SMALL_DEVICE ? 12 : (IS_LARGE_DEVICE ? 15.5 : 14.5),
  descSize: IS_SMALL_DEVICE ? 9.5 : (IS_LARGE_DEVICE ? 10.5 : 10),
  btnPaddingH: IS_SMALL_DEVICE ? 12 : (IS_LARGE_DEVICE ? 22 : 20),
  btnPaddingV: IS_SMALL_DEVICE ? 8 : (IS_LARGE_DEVICE ? 13 : 11),
  btnTextSize: IS_SMALL_DEVICE ? 9.5 : (IS_LARGE_DEVICE ? 12 : 11.5),
  btnRadius: IS_SMALL_DEVICE ? 14 : (IS_LARGE_DEVICE ? 22 : 20),
  plusIconSize: IS_SMALL_DEVICE ? 7 : (IS_LARGE_DEVICE ? 9 : 8.5),
  plusCircleSize: IS_SMALL_DEVICE ? 13 : (IS_LARGE_DEVICE ? 17 : 16),
  minHeight: IS_SMALL_DEVICE ? 104 : (IS_LARGE_DEVICE ? 148 : 140),
};

export const getDynamicTripStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return 'planning';

  // Get today's local midnight timestamp
  const now = new Date();
  const todayVal = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Helper to parse date to local midnight timestamp using UTC parts to avoid timezone shifts
  const parseToLocalMidnight = (dateInput) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    
    // ISO string from MongoDB represents midnight in UTC (e.g. 2026-05-19T00:00:00.000Z).
    // Using getUTC* ensures we extract the exact calendar date matching the backend,
    // avoiding timezone shifting on devices behind UTC.
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).getTime();
  };

  const startVal = parseToLocalMidnight(startDate);
  const endVal = parseToLocalMidnight(endDate);

  if (!startVal || !endVal) return 'planning';

  if (endVal < todayVal) {
    return 'completed';
  } else if (startVal <= todayVal && endVal >= todayVal) {
    return 'ongoing';
  } else {
    return 'planning';
  }
};

const VictoriaMemorialSVG = () => (
  <Svg width="48" height="48" viewBox="0 0 64 64">
    <Path d="M 6,48 A 26,26 0 0,1 58,48 Z" fill="#e5e7eb" />
    <Path d="M 8,46 L 56,46 L 56,50 L 8,50 Z" fill="#9ca3af" />
    <Path d="M 12,42 L 52,42 L 52,46 L 12,46 Z" fill="#f3f4f6" />
    <Path d="M 18,28 L 46,28 L 46,42 L 18,42 Z" fill="#f3f4f6" />
    <Path d="M 22,28 L 24,42 M 30,28 L 30,42 M 34,28 L 34,42 M 42,28 L 40,42" stroke="#d1d5db" strokeWidth="2" />
    <Path d="M 27,42 L 27,33 A 5,5 0 0,1 37,33 L 37,42 Z" fill="#f97316" />
    <Path d="M 24,28 A 8,8 0 0,1 40,28 Z" fill="#9ca3af" />
    <Path d="M 26,28 A 6,6 0 0,1 38,28 Z" fill="#f97316" />
    <Path d="M 32,22 L 32,15" stroke="#9ca3af" strokeWidth="2" />
    <Path d="M 15,28 A 3,3 0 0,1 21,28 Z" fill="#9ca3af" />
    <Path d="M 43,28 A 3,3 0 0,1 49,28 Z" fill="#9ca3af" />
  </Svg>
);

const GatewaySVG = () => (
  <Svg width="48" height="48" viewBox="0 0 64 64">
    <Path d="M 6,48 A 26,26 0 0,1 58,48 Z" fill="#e5e7eb" />
    <Path d="M 8,46 L 56,46 L 56,50 L 8,50 Z" fill="#9ca3af" />
    <Path d="M 16,22 L 24,22 L 24,46 L 16,46 Z" fill="#f3f4f6" />
    <Path d="M 40,22 L 48,22 L 48,46 L 40,46 Z" fill="#f3f4f6" />
    <Path d="M 20,22 L 24,22 L 24,46 L 20,46 Z" fill="#d1d5db" />
    <Path d="M 40,22 L 44,22 L 44,46 L 40,46 Z" fill="#d1d5db" />
    <Path d="M 12,16 L 52,16 L 52,22 L 12,22 Z" fill="#9ca3af" />
    <Path d="M 14,12 L 50,12 L 50,16 L 14,16 Z" fill="#f97316" />
    <Path d="M 26,12 A 6,6 0 0,1 38,12 Z" fill="#f3f4f6" />
    <Path d="M 24,46 L 24,30 A 8,8 0 0,1 40,30 L 40,46 Z" fill="#ea580c" />
  </Svg>
);

const MountainsSVG = () => (
  <Svg width="48" height="48" viewBox="0 0 64 64">
    <Path d="M 6,48 A 26,26 0 0,1 58,48 Z" fill="#e5e7eb" />
    <Path d="M 22,28 A 10,10 0 1,1 42,28 Z" fill="#f97316" />
    <Path d="M 8,46 L 28,18 L 46,46 Z" fill="#9ca3af" />
    <Path d="M 22,46 L 42,12 L 58,46 Z" fill="#f3f4f6" />
    <Path d="M 38,18 L 42,12 L 46,18 L 42,22 Z" fill="#f97316" />
    <Path d="M 8,46 L 56,46 L 56,50 L 8,50 Z" fill="#9ca3af" />
  </Svg>
);

const BeachSVG = () => (
  <Svg width="48" height="48" viewBox="0 0 64 64">
    <Path d="M 6,48 A 26,26 0 0,1 58,48 Z" fill="#e5e7eb" />
    <Path d="M 18,34 A 12,12 0 1,1 42,34 Z" fill="#f97316" />
    <Path d="M 8,44 C 16,42 20,46 28,44 C 36,42 40,46 56,44 L 56,50 L 8,50 Z" fill="#9ca3af" />
    <Path d="M 8,47 C 16,45 20,49 28,47 C 36,45 40,49 56,47 L 56,50 L 8,50 Z" fill="#f3f4f6" />
    <Path d="M 46,47 Q 40,30 24,24" fill="none" stroke="#9ca3af" strokeWidth="3.5" />
    <Path d="M 24,24 Q 16,26 12,28" fill="none" stroke="#f97316" strokeWidth="2.5" />
    <Path d="M 24,24 Q 18,18 16,14" fill="none" stroke="#f97316" strokeWidth="2.5" />
    <Path d="M 24,24 Q 28,16 32,12" fill="none" stroke="#f97316" strokeWidth="2.5" />
    <Path d="M 24,24 Q 30,26 36,28" fill="none" stroke="#f97316" strokeWidth="2.5" />
  </Svg>
);

const WaterfallSVG = () => (
  <Svg width="48" height="48" viewBox="0 0 64 64">
    <Path d="M 6,48 A 26,26 0 0,1 58,48 Z" fill="#e5e7eb" />
    <Path d="M 8,46 L 22,22 L 28,46 Z" fill="#9ca3af" />
    <Path d="M 38,46 L 44,18 L 56,46 Z" fill="#9ca3af" />
    <Path d="M 26,28 L 38,28 L 36,46 L 28,46 Z" fill="#f3f4f6" />
    <Path d="M 29,28 L 35,28 L 34,46 L 30,46 Z" fill="#f97316" />
    <Path d="M 18,45 L 46,45 L 46,48 L 18,48 Z" fill="#f3f4f6" />
    <Path d="M 14,48 L 50,48 L 50,51 L 14,51 Z" fill="#9ca3af" />
  </Svg>
);

const TempleSVG = () => (
  <Svg width="48" height="48" viewBox="0 0 64 64">
    <Path d="M 6,48 A 26,26 0 0,1 58,48 Z" fill="#e5e7eb" />
    <Path d="M 12,46 L 52,46 L 52,50 L 12,50 Z" fill="#9ca3af" />
    <Path d="M 16,42 L 48,42 L 48,46 L 16,46 Z" fill="#f3f4f6" />
    <Path d="M 20,28 L 44,28 L 44,42 L 20,42 Z" fill="#f3f4f6" />
    <Path d="M 28,28 L 36,28 L 32,8 Z" fill="#f97316" />
    <Path d="M 27,42 L 27,33 A 5,5 0 0,1 37,33 L 37,42 Z" fill="#9ca3af" />
    <Path d="M 32,8 A 2,2 0 1,1 32,4 A 2,2 0 1,1 32,8 Z" fill="#f3f4f6" />
  </Svg>
);

const TripIllustrationThumbnail = ({ destination }) => {
  const dest = (destination || '').toLowerCase();

  let Illustration = TempleSVG; // default beautiful travel temple/monument

  if (dest.includes('kolkata')) {
    Illustration = VictoriaMemorialSVG;
  } else if (dest.includes('darjeeling') || dest.includes('hill') || dest.includes('mountain')) {
    Illustration = MountainsSVG;
  } else if (dest.includes('jharkhand') || dest.includes('waterfall') || dest.includes('nature')) {
    Illustration = WaterfallSVG;
  } else if (dest.includes('goa') || dest.includes('beach') || dest.includes('sea') || dest.includes('ocean')) {
    Illustration = BeachSVG;
  } else if (dest.includes('delhi') || dest.includes('mumbai') || dest.includes('city')) {
    Illustration = GatewaySVG;
  } else {
    // Symmetrical hashing to pick one of the beautiful structures consistently
    const structures = [TempleSVG, VictoriaMemorialSVG, GatewaySVG, MountainsSVG, BeachSVG];
    let hash = 0;
    const combined = destination || '';
    for (let i = 0; i < combined.length; i++) hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    Illustration = structures[Math.abs(hash) % structures.length];
  }

  return (
    <View style={{
      width: 72,
      height: 72,
      borderRadius: 36,
      marginRight: 12,
      backgroundColor: '#f5f5f5',
      borderWidth: 2,
      borderColor: '#f97316', // Sleek orange frame highlight matching brand color!
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
      elevation: 6
    }}>
      <Illustration />
    </View>
  );
};

const STATUS_FILTERS = ['All', 'upcoming', 'planning', 'ongoing', 'completed'];
const STATUS_COLORS = {
  upcoming: { bg: '#f9731620', text: '#f97316' },
  planning: { bg: '#3b82f620', text: '#3b82f6' },
  ongoing: { bg: '#22c55e20', text: '#22c55e' },
  completed: { bg: '#a3a3a320', text: '#a3a3a3' },
  cancelled: { bg: '#ef444420', text: '#ef4444' },
};

// Generate a consistent gradient color from a string (destination name)
const getGradientColor = (str) => {
  const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#22c55e', '#ec4899', '#06b6d4', '#f59e0b', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getDestinationImage = (destination) => {
  const dest = (destination || '').toLowerCase();
  
  if (dest.includes('kolkata')) {
    return 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80'; // Victoria Memorial golden sunset
  }
  if (dest.includes('jharkhand') || dest.includes('waterfall')) {
    return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80'; // Green waterfall forest
  }
  if (dest.includes('darjeeling') || dest.includes('hill') || dest.includes('mountain')) {
    return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80'; // Camping starry sky
  }
  if (dest.includes('pawapuri') || dest.includes('home') || dest.includes('ghar') || dest.includes('cabin')) {
    return 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80'; // Cozy forest cabin
  }
  if (dest.includes('goa') || dest.includes('beach') || dest.includes('sea') || dest.includes('ocean')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'; // Beach ocean sunset
  }

  // Consistent high-resolution scenery fallbacks
  const fallbacks = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
  ];
  let hash = 0;
  const combined = destination || '';
  for (let i = 0; i < combined.length; i++) hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  return fallbacks[Math.abs(hash) % fallbacks.length];
};

const getMonthAbbrev = (dateStr) => {
  if (!dateStr) return 'MAY';
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'MAY' : months[d.getMonth()];
};

const getDayNum = (dateStr) => {
  if (!dateStr) return '12';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '12' : d.getDate().toString().padStart(2, '0');
};

const getDestinationWeather = (destination) => {
  const dest = (destination || '').toLowerCase();
  if (dest.includes('darjeeling') || dest.includes('hill') || dest.includes('mountain')) {
    return { temp: '16°', desc: 'Cool Mist' };
  }
  if (dest.includes('goa') || dest.includes('beach') || dest.includes('sea')) {
    return { temp: '31°', desc: 'Sunny Breeze' };
  }
  if (dest.includes('kolkata')) {
    return { temp: '32°', desc: 'Partly Cloudy' };
  }
  if (dest.includes('jharkhand')) {
    return { temp: '27°', desc: 'Fresh Rain' };
  }
  return { temp: '29°', desc: 'Mostly Clear' };
};

export default function DashboardScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const { user } = useAuth();
  const [showAllTripsModal, setShowAllTripsModal] = useState(false);

  // Dynamic real-time featured trip details states
  const [featuredMembers, setFeaturedMembers] = useState([]);
  const [featuredSpent, setFeaturedSpent] = useState(0);
  const [featuredTasks, setFeaturedTasks] = useState({ total: 0, completed: 0 });
  const [featuredFlightsCount, setFeaturedFlightsCount] = useState(0);

  const fetchFeaturedStats = async (tripId) => {
    try {
      const [membersRes, expensesRes, checklistsRes, reservationsRes] = await Promise.all([
        client.get(`/trips/${tripId}`),
        client.get(`/trips/${tripId}/expenses`),
        client.get(`/trips/${tripId}/checklists`),
        client.get(`/trips/${tripId}/reservations`)
      ]);

      if (membersRes.data.success) {
        setFeaturedMembers(membersRes.data.members || []);
      }
      if (expensesRes.data.success) {
        setFeaturedSpent(expensesRes.data.summary?.total || 0);
      }
      if (checklistsRes.data.success) {
        let total = 0;
        let completed = 0;
        const checklists = checklistsRes.data.checklists || [];
        checklists.forEach(cl => {
          const items = cl.items || [];
          total += items.length;
          completed += items.filter(item => item.isCompleted).length;
        });
        setFeaturedTasks({ total, completed });
      }
      if (reservationsRes.data.success) {
        const reservations = reservationsRes.data.reservations || [];
        const flights = reservations.filter(r => r.type?.toLowerCase() === 'flight').length;
        setFeaturedFlightsCount(flights);
      }
    } catch (err) {
      console.log('Error fetching featured stats:', err);
    }
  };

  const fetchTrips = async () => {
    try {
      setError(null);
      const res = await client.get('/trips?limit=100');
      if (res.data.success) {
        const fetchedTrips = res.data.trips || [];
        setTrips(fetchedTrips);
        
        if (fetchedTrips.length > 0) {
          const activeTrip = fetchedTrips[0];
          await fetchFeaturedStats(activeTrip._id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteTrip = (tripId, title) => {
    Alert.alert(
      "Delete Trip",
      `Are you sure you want to delete "${title || 'this trip'}"? All checklist tasks, expenses, and itinerary plans will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await client.delete(`/trips/${tripId}`);
              if (res.data.success) {
                Alert.alert("Deleted", "Your trip was deleted successfully.");
                fetchTrips();
              }
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Failed to delete the trip.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchTrips();
    const unsubscribe = navigation.addListener('focus', () => fetchTrips());
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, []);

  // Filter trips by both search query AND status filter (fully functional & dynamically computed!)
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = !searchQuery || 
      trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const dynamicStatus = getDynamicTripStatus(trip.startDate, trip.endDate);
    const matchesStatus = statusFilter === 'All' || 
      dynamicStatus === statusFilter.toLowerCase();
      
    return matchesSearch && matchesStatus;
  });

  const [favorites, setFavorites] = useState({});
  const toggleFavorite = (tripId) => {
    setFavorites(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: THEME.surface }}>
        <ActivityIndicator size="large" color={THEME.brand} />
      </SafeAreaView>
    );
  }

  const totalBudget = trips.reduce((acc, t) => acc + (t.totalBudget || 0), 0);
  // Find a dynamically ongoing trip, else fall back to the first trip
  const ongoingTrip = trips.find(t => getDynamicTripStatus(t.startDate, t.endDate) === 'ongoing') || trips[0];
  const upcomingJourneys = filteredTrips;

  // Weather data mapping for the featured card
  const weather = ongoingTrip ? getDestinationWeather(ongoingTrip.destination) : { temp: '32°', desc: 'Partly Cloudy' };

  // Real-time dynamic budget variables for featured trip
  const tripBudget = ongoingTrip?.totalBudget || 0;
  const spentAmt = featuredSpent || 0;
  const budgetPercent = tripBudget > 0 ? Math.min(100, Math.round((spentAmt / tripBudget) * 100)) : 0;

  // Real-time dynamic members avatars
  const displayMembers = featuredMembers.length > 0 
    ? featuredMembers.slice(0, 3) 
    : [{ user: { name: user?.name || 'Himanshu', avatar: user?.avatar || '' } }];
  const remainingCount = featuredMembers.length > 3 ? featuredMembers.length - 3 : 0;



  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: THEME.surface }} edges={['top']}>
      {/* 1. Header Bar: Brand Logo & Top Actions */}
      <View className="flex-row justify-between items-center px-6 pt-3 pb-2">
        <View className="flex-row items-center">
          <View style={{ transform: [{ rotate: '15deg' }] }}>
            <Plane size={24} color="#f97316" />
          </View>
          <Text className="text-2xl font-black text-white ml-2" style={{ letterSpacing: -0.8 }}>
            Trip<Text style={{ color: '#f97316' }}>Sync</Text>
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Notification Bell with Orange Dot */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full items-center justify-center border relative" 
            style={{ backgroundColor: '#141414', borderColor: '#222222' }}
          >
            <Bell size={18} color="#ffffff" />
            <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-orange-500 border border-[#141414]" />
          </TouchableOpacity>

          {/* Plus Add button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateTrip')}
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ 
              backgroundColor: THEME.brand, 
              shadowColor: '#f97316', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.3, 
              shadowRadius: 6, 
              elevation: 4 
            }}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Greetings Section */}
      <View className="px-6 pt-3 pb-4">
        <Text className="text-3xl font-black text-white" style={{ letterSpacing: -0.5 }}>
          Hi, {user?.name?.split(' ')[0] || 'Himanshu'} 👋
        </Text>
        <Text className="text-sm font-semibold mt-1" style={{ color: '#737373' }}>
          Where will your next journey take you?
        </Text>
      </View>
      {/* 3. Search Bar */}
      <View className="px-6 mb-5">
        <View className="w-full flex-row items-center border rounded-2xl px-4" style={{ backgroundColor: '#141414', borderColor: '#222222', height: 48 }}>
          <Search size={18} color="#525252" />
          <TextInput
            className="flex-1 text-white text-sm ml-3 font-semibold"
            placeholder="Search trips or places..."
            placeholderTextColor="#525252"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {error && (
        <View className="px-6 mb-4">
          <View className="flex-row items-center p-3 rounded-xl border" style={{ backgroundColor: '#ef444415', borderColor: '#ef444430' }}>
            <AlertCircle size={16} color="#ef4444" />
            <Text className="ml-2 flex-1 text-xs" style={{ color: '#ef4444' }}>{error}</Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.brand} />}
      >
        {trips.length === 0 ? (
          /* Premium Vertical Mobile Empty State Card (100% JSON Mockup Parity!) */
          <View 
            className="mx-6 border mt-8 p-6 items-center justify-center relative overflow-hidden" 
            style={{ 
              backgroundColor: '#141414', 
              borderColor: 'rgba(249,115,22,0.15)', 
              borderWidth: 1.5,
              borderRadius: 28,
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 6
            }}
          >
            {/* Top Illustration: Premium 3D Travel Assets */}
            <Image 
              source={require('../assets/travel_banner_asset.png')} 
              style={{ 
                width: 140,
                height: 100,
                marginBottom: 6
              }}
              resizeMode="contain"
            />

            {/* Center Content Section */}
            <View className="items-center mb-6 px-2">
              <Text className="text-white font-extrabold text-[19px] text-center mb-2">
                No trips <Text style={{ color: '#f97316' }}>planned yet?</Text>
              </Text>
              <Text className="text-neutral-400 font-semibold text-[12.5px] text-center leading-5" style={{ maxWidth: '90%' }}>
                Create a new trip and start exploring the world.
              </Text>
            </View>

            {/* Bottom Full-width elegant CTA Button */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateTrip')}
              activeOpacity={0.9}
              className="w-full flex-row items-center justify-center"
              style={{ 
                height: 52,
                backgroundColor: '#f97316',
                borderRadius: 999,
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4
              }}
            >
              <Text className="text-white font-bold text-[13.5px] uppercase tracking-wider mr-2">
                Create New Trip
              </Text>
              <View 
                className="rounded-full border border-white items-center justify-center"
                style={{ width: 17, height: 17 }}
              >
                <Plus size={10} color="#fff" strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* 4. Symmetrical Featured Cover Card (ONGOING Trip) */}
            {ongoingTrip && (
              <View className="px-6 mb-6">
                <TouchableOpacity
                  onPress={() => navigation.navigate('TripDetail', { tripId: ongoingTrip._id })}
                  activeOpacity={0.9}
                  className="rounded-[28px] overflow-hidden h-[300px]"
                  style={{
                    height: 300,
                    borderWidth: 1.5,
                    borderColor: '#222222',
                    position: 'relative'
                  }}
                >
                  {/* Backdrop scenic full-bleed Unsplash image */}
                  <Image
                    source={{ uri: getImageUri(ongoingTrip.coverImage) || getDestinationImage(ongoingTrip.destination) }}
                    style={{ position: 'absolute', width: '100%', height: 300 }}
                    resizeMode="cover"
                  />
                  {/* Vignette Scrim overlays */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />

                  {/* Card Content Overlay */}
                  <View style={{ height: 300, paddingTop: 18, paddingBottom: 22, paddingHorizontal: 20, justifyContent: 'space-between' }}>
                    {/* Upper row: Status Pill left, Heart & Delete actions right */}
                    <View className="flex-row justify-between items-center">
                      <View className="px-3 py-1 rounded-full bg-orange-500">
                        <Text className="text-[9px] font-black text-white uppercase tracking-wider">
                          {getDynamicTripStatus(ongoingTrip.startDate, ongoingTrip.endDate)}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity 
                          onPress={() => toggleFavorite(ongoingTrip._id)}
                          className="w-8 h-8 rounded-full items-center justify-center"
                          style={{ backgroundColor: 'rgba(15,15,15,0.6)' }}
                        >
                          <Heart 
                            size={14} 
                            color={favorites[ongoingTrip._id] ? '#ef4444' : '#ffffff'} 
                            fill={favorites[ongoingTrip._id] ? '#ef4444' : 'transparent'} 
                          />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          onPress={() => handleDeleteTrip(ongoingTrip._id, ongoingTrip.title)}
                          className="w-8 h-8 rounded-full items-center justify-center"
                          style={{ backgroundColor: 'rgba(239,68,68,0.35)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' }}
                        >
                          <Trash2 
                            size={13} 
                            color="#ef4444" 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Middle title row */}
                    <View style={{ marginTop: 4 }}>
                      <Text className="text-xl font-black text-white mb-1 leading-tight" style={{ letterSpacing: -0.3 }}>
                        {ongoingTrip.title}
                      </Text>
                      
                      <View className="flex-row items-center mb-1">
                        <MapPin size={11} color="#ffffff" style={{ opacity: 0.8 }} />
                        <Text className="text-white text-[11px] font-semibold ml-1" style={{ opacity: 0.9 }}>
                          {ongoingTrip.destination}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <Calendar size={11} color="#ffffff" style={{ opacity: 0.8 }} />
                        <Text className="text-white text-[10px] font-semibold ml-1" style={{ opacity: 0.9 }}>
                          {formatDate(ongoingTrip.startDate)} - {formatDate(ongoingTrip.endDate)} • {Math.max(1, Math.ceil(Math.abs(new Date(ongoingTrip.endDate) - new Date(ongoingTrip.startDate)) / (1000 * 60 * 60 * 24)) + 1)} Days
                        </Text>
                      </View>
                    </View>

                    {/* Lower row: Avatar stacked members & CTA left, Budget glass widget right */}
                    <View className="flex-row items-end justify-between pt-1">
                      {/* Left Block: Avatars stack & Button */}
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        {/* Horizontal single-row avatars stack + count label */}
                        <View className="flex-row items-center mb-2.5">
                          <View className="flex-row items-center">
                            {displayMembers.map((member, i) => {
                              const avatarUri = member.user?.avatar || `https://ui-avatars.com/api/?background=f97316&color=fff&size=100&bold=true&name=${encodeURIComponent(member.user?.name || 'User')}`;
                              return (
                                <Image
                                  key={i}
                                  source={{ uri: avatarUri }}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#111111',
                                    marginLeft: i > 0 ? -6 : 0
                                  }}
                                />
                              );
                            })}
                            {remainingCount > 0 && (
                              <View className="w-[20px] h-[20px] rounded-full items-center justify-center bg-orange-500/20 border border-orange-500/40 ml-[-6px]">
                                <Text className="text-[7px] font-black text-orange-500">+{remainingCount}</Text>
                              </View>
                            )}
                          </View>
                          
                          {/* Label sits beside avatars stack */}
                          <Text className="text-[9px] text-white/80 font-black ml-2">
                            {featuredMembers.length === 0 ? '1 Member' : `${featuredMembers.length} ${featuredMembers.length === 1 ? 'Member' : 'Members'}`}
                          </Text>
                        </View>

                        {/* View Itinerary custom charcoal capsule */}
                        <TouchableOpacity
                          onPress={() => navigation.navigate('TripDetail', { tripId: ongoingTrip._id })}
                          className="flex-row items-center px-3 py-1.5 rounded-full border self-start"
                          style={{ backgroundColor: 'rgba(15,15,15,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <Text className="text-orange-500 font-extrabold text-[9px] mr-1" numberOfLines={1} ellipsizeMode="tail">
                            View Itinerary
                          </Text>
                          <ChevronRight size={8} color="#f97316" />
                        </TouchableOpacity>
                      </View>

                      {/* Right Block: Budget Glass widget */}
                      <View className="px-3 py-2 rounded-2xl border" style={{ backgroundColor: 'rgba(15,15,15,0.5)', borderColor: 'rgba(255,255,255,0.1)', width: 125 }}>
                        <Text className="text-[8px] font-black uppercase tracking-wider mb-0.5" style={{ color: '#a3a3a3' }}>Budget</Text>
                        <Text className="text-white text-sm font-black">₹{spentAmt.toLocaleString('en-IN')}</Text>
                        <Text className="text-[8px] font-bold text-neutral-400 mt-0.5">of ₹{tripBudget.toLocaleString('en-IN')}</Text>
                        
                        {/* Progress Bar slider */}
                        <View className="w-full h-1 bg-[#262626] rounded-full mt-1.5 overflow-hidden">
                          <View className="h-full rounded-full" style={{ width: `${budgetPercent}%`, backgroundColor: '#f97316' }} />
                        </View>
                        <Text className="text-right text-[7px] font-extrabold mt-0.5 text-white/60">{budgetPercent}%</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* 5. 1x4 Symmetrical Rounded Capsules Grid (100% Mockup Match) */}
            <View className="flex-row justify-between px-6 mb-6 gap-2.5">
              {/* Card 1: Upcoming Trips with active line indicator */}
              <TouchableOpacity 
                onPress={() => { setStatusFilter('All'); setSearchQuery(''); }}
                activeOpacity={0.8}
                className="flex-1 border rounded-[20px] p-3 items-center justify-between" 
                style={{ backgroundColor: '#111111', borderColor: '#222222', height: 110, position: 'relative' }}
              >
                <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}>
                  <Briefcase size={16} color="#f97316" />
                </View>
                <Text className="text-[11px] font-black text-white mt-1">Upcoming</Text>
                <Text className="text-[9px] font-bold text-neutral-500 mt-0.5">{trips.length} Trips</Text>
                <View style={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 2.5, backgroundColor: '#f97316', borderRadius: 1.25 }} />
              </TouchableOpacity>
              
              {/* Card 2: Flights booked */}
              <TouchableOpacity 
                onPress={() => {
                  if (ongoingTrip) {
                    navigation.navigate('TripDetail', { tripId: ongoingTrip._id, initialTab: 'reservations' });
                  }
                }}
                activeOpacity={0.8}
                className="flex-1 border rounded-[20px] p-3 items-center justify-between" 
                style={{ backgroundColor: '#111111', borderColor: '#222222', height: 110 }}
              >
                <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(139,92,246,0.15)' }}>
                  <Plane size={16} color="#8b5cf6" />
                </View>
                <Text className="text-[11px] font-black text-white mt-1">Flights</Text>
                <Text className="text-[9px] font-bold text-neutral-500 mt-0.5">{featuredFlightsCount} Booked</Text>
              </TouchableOpacity>
              
              {/* Card 3: Total Budget sum */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('BudgetTab')}
                activeOpacity={0.8}
                className="flex-1 border rounded-[20px] p-3 items-center justify-between" 
                style={{ backgroundColor: '#111111', borderColor: '#222222', height: 110 }}
              >
                <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                  <Wallet size={16} color="#22c55e" />
                </View>
                <Text className="text-[11px] font-black text-white mt-1">Budget</Text>
                <Text className="text-[9px] font-bold text-neutral-500 mt-0.5" numberOfLines={1}>
                  ₹{tripBudget >= 100000 ? (tripBudget/100000).toFixed(1) + 'L' : tripBudget.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
              
              {/* Card 4: Checklist Tasks */}
              <TouchableOpacity 
                onPress={() => {
                  if (ongoingTrip) {
                    navigation.navigate('TripDetail', { tripId: ongoingTrip._id, initialTab: 'checklist' });
                  }
                }}
                activeOpacity={0.8}
                className="flex-1 border rounded-[20px] p-3 items-center justify-between" 
                style={{ backgroundColor: '#111111', borderColor: '#222222', height: 110 }}
              >
                <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
                  <CheckSquare size={16} color="#3b82f6" />
                </View>
                <Text className="text-[11px] font-black text-white mt-1">Tasks</Text>
                <Text className="text-[9px] font-bold text-neutral-500 mt-0.5">{featuredTasks.completed}/{featuredTasks.total} Done</Text>
              </TouchableOpacity>
            </View>

            {/* 6. Your Journeys Header */}
            <View className="flex-row justify-between items-center px-6 mb-4">
              <Text className="text-lg font-black text-white" style={{ letterSpacing: -0.3 }}>
                Your Journeys
              </Text>
              <TouchableOpacity onPress={() => setShowAllTripsModal(true)} className="flex-row items-center">
                <Text className="text-xs font-bold mr-1" style={{ color: '#f97316' }}>View All</Text>
                <ChevronRight size={12} color="#f97316" />
              </TouchableOpacity>
            </View>

            {/* 7. Upcoming Journeys Vertical Cards Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
              className="mb-8"
            >
              {upcomingJourneys.length === 0 ? (
                <View 
                  className="items-center justify-center p-6 border rounded-[24px]" 
                  style={{ width: 280, height: 265, borderColor: '#222222', backgroundColor: '#141414', marginRight: 16 }}
                >
                  <Search size={32} color="#525252" />
                  <Text className="text-white font-extrabold text-sm mt-3 text-center">No Journeys Match</Text>
                  <Text className="text-xs text-center mt-1 px-2 leading-4" style={{ color: '#737373' }}>
                    Try searching for different keywords or clear the current filters!
                  </Text>
                  <TouchableOpacity
                    onPress={() => { setSearchQuery(''); setStatusFilter('All'); }}
                    className="mt-4 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: '#262626' }}
                  >
                    <Text className="text-white text-xs font-bold">Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                upcomingJourneys.map(trip => {
                  const dynamicStatus = getDynamicTripStatus(trip.startDate, trip.endDate);
                  const statusStyle = STATUS_COLORS[dynamicStatus] || STATUS_COLORS.planning;
                  const bgImage = trip.coverImage || getDestinationImage(trip.destination);

                  return (
                    <TouchableOpacity
                      key={trip._id + '_slider'}
                      onPress={() => navigation.navigate('TripDetail', { tripId: trip._id })}
                      activeOpacity={0.88}
                      className="rounded-[24px] overflow-hidden mr-4"
                      style={{
                        width: 170,
                        height: 265,
                        borderWidth: 1.5,
                        borderColor: '#222222',
                        position: 'relative'
                      }}
                    >
                      {/* Full-bleed vertical cover image */}
                      <Image
                        source={{ uri: getImageUri(bgImage) }}
                        style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 22 }}
                        resizeMode="cover"
                      />

                      {/* Dark gradient scrims */}
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.48)' }} />
                      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, backgroundColor: 'rgba(0,0,0,0.5)' }} />

                      {/* Overlay components container */}
                      <View style={{ flex: 1, padding: 15, justifyContent: 'space-between' }}>
                        {/* Top elements: Calendar Tag left, Actions Row right */}
                        <View className="flex-row justify-between items-start">
                          {/* Floating Calendar day Pill */}
                          <View className="items-center justify-center rounded-xl p-1.5" style={{ backgroundColor: 'rgba(249,115,22,0.85)', minWidth: 42 }}>
                            <Text className="text-[8px] font-black text-white uppercase tracking-wider">
                              {getMonthAbbrev(trip.startDate)}
                            </Text>
                            <Text className="text-lg font-black text-white mt-0.5 leading-none">
                              {getDayNum(trip.startDate)}
                            </Text>
                          </View>

                          <View className="flex-row items-center gap-1.5">
                            {/* Bookmark Save Outline */}
                            <TouchableOpacity 
                              onPress={() => toggleFavorite(trip._id)}
                              className="w-8 h-8 rounded-full items-center justify-center" 
                              style={{ backgroundColor: favorites[trip._id] ? 'rgba(249,115,22,0.2)' : 'rgba(15,15,15,0.5)' }}
                            >
                              <Bookmark 
                                size={14} 
                                color={favorites[trip._id] ? '#f97316' : '#ffffff'} 
                                fill={favorites[trip._id] ? '#f97316' : 'transparent'} 
                              />
                            </TouchableOpacity>

                            {/* Delete Button */}
                            <TouchableOpacity 
                              onPress={() => handleDeleteTrip(trip._id, trip.title)}
                              className="w-7 h-7 rounded-full items-center justify-center" 
                              style={{ backgroundColor: 'rgba(239,68,68,0.25)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' }}
                            >
                              <Trash2 
                                size={12} 
                                color="#ef4444" 
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Bottom elements: Title and Location */}
                        <View>
                          {/* Status capsule */}
                          <View className="px-2 py-0.5 rounded-full self-start mb-2 border" style={{ backgroundColor: 'rgba(15,15,15,0.85)', borderColor: statusStyle.text + '50' }}>
                            <Text className="text-[8px] font-black uppercase tracking-wide" style={{ color: statusStyle.text }}>
                              {dynamicStatus}
                            </Text>
                          </View>
                        
                          {/* Title */}
                          <Text className="text-base font-black text-white mb-1.5 leading-tight" numberOfLines={1}>
                            {trip.title}
                          </Text>

                          {/* Destination */}
                          <View className="flex-row items-center mb-1.5">
                            <MapPin size={10} color="#ffffff" style={{ opacity: 0.8 }} />
                            <Text className="text-white text-[10px] font-semibold ml-1" style={{ opacity: 0.9 }} numberOfLines={1}>
                              {trip.destination}
                            </Text>
                          </View>

                          {/* Dates */}
                          <View className="flex-row items-center">
                            <Calendar size={10} color="#ffffff" style={{ opacity: 0.8 }} />
                            <Text className="text-white text-[9px] font-medium ml-1" style={{ opacity: 0.8 }}>
                              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {/* 8. Premium Vertical Create Trip Banner (100% JSON Mockup Parity!) */}
            <View 
              className="mx-6 border mb-6 p-6 items-center justify-center relative overflow-hidden" 
              style={{ 
                backgroundColor: '#141414', 
                borderColor: 'rgba(249,115,22,0.15)', 
                borderWidth: 1.5,
                borderRadius: 28,
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 6
              }}
            >
              {/* Top Illustration: Premium 3D Travel Assets */}
              <Image 
                source={require('../assets/travel_banner_asset.png')} 
                style={{ 
                  width: 140,
                  height: 100,
                  marginBottom: 6
                }}
                resizeMode="contain"
              />

              {/* Center Content Section */}
              <View className="items-center mb-6 px-2">
                <Text className="text-white font-extrabold text-[19px] text-center mb-2">
                  No trips <Text style={{ color: '#f97316' }}>planned yet?</Text>
                </Text>
                <Text className="text-neutral-400 font-semibold text-[12.5px] text-center leading-5" style={{ maxWidth: '90%' }}>
                  Create a new trip and start exploring the world.
                </Text>
              </View>

              {/* Bottom Full-width elegant CTA Button */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('CreateTrip')}
                activeOpacity={0.9}
                className="w-full flex-row items-center justify-center"
                style={{ 
                  height: 52,
                  backgroundColor: '#f97316',
                  borderRadius: 999,
                  shadowColor: '#f97316',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 4
                }}
              >
                <Text className="text-white font-bold text-[13.5px] uppercase tracking-wider mr-2">
                  Create New Trip
                </Text>
                <View 
                  className="rounded-full border border-white items-center justify-center"
                  style={{ width: 17, height: 17 }}
                >
                  <Plus size={10} color="#fff" strokeWidth={3} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>

      {/* 9. Premium All Journeys Explorer Modal */}
      <Modal
        visible={showAllTripsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAllTripsModal(false)}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: THEME.surface }} edges={['top', 'bottom']}>
          {/* Drag Handle Indicator */}
          <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 2 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#2e2e2e' }} />
          </View>

          {/* Modal Header */}
          <View className="flex-row justify-between items-center px-6 py-4">
            <View>
              <Text className="text-2xl font-black text-white" style={{ letterSpacing: -0.5 }}>All Journeys</Text>
              <Text className="text-xs font-semibold mt-1" style={{ color: '#737373' }}>
                <Text style={{ color: '#f97316' }}>{trips.length}</Text> trips in your archive
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowAllTripsModal(false)}
              className="w-10 h-10 rounded-full items-center justify-center border" 
              style={{ backgroundColor: '#141414', borderColor: '#222222' }}
            >
              <X size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Modal Search & Filters */}
          <View className="px-6 pt-2 pb-2">
            {/* Inner Search input */}
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

            {/* Inner Horizontal Status Filter Capsules (Matching User Ref) */}
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

          {/* Scrollable list of all journeys */}
          <ScrollView
            className="flex-1 px-6 pt-2"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredTrips.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Search size={40} color="#525252" />
                <Text className="text-white font-extrabold text-sm mt-3">No matching trips found</Text>
                <Text className="text-xs text-neutral-500 mt-1">Try modifying your query or filters.</Text>
              </View>
            ) : (
              <View>
                {filteredTrips.map((trip) => {
                  const dynamicStatus = getDynamicTripStatus(trip.startDate, trip.endDate);
                  const statusStyle = STATUS_COLORS[dynamicStatus] || STATUS_COLORS.planning;
                  return (
                    <TouchableOpacity
                      key={trip._id + '_all_modal'}
                      onPress={() => {
                        setShowAllTripsModal(false);
                        navigation.navigate('TripDetail', { tripId: trip._id });
                      }}
                      activeOpacity={0.88}
                      className="mb-3.5 rounded-[24px] border p-3 flex-row items-center justify-between"
                      style={{ backgroundColor: '#111111', borderColor: '#222222' }}
                    >
                      {/* Left: Perfect Circle Cover Image (matching user ref exactly!) */}
                      <View className="mr-3.5">
                        <Image
                          source={{ uri: getImageUri(trip.coverImage) || getDestinationImage(trip.destination) }}
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
                          {/* Dynamic status badge */}
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

                          {/* Total Budget value */}
                          <Text className="text-[14px] font-black text-emerald-500 leading-none">
                            ₹{(trip.totalBudget || 0).toLocaleString('en-IN')}
                          </Text>
                          <Text className="text-[8px] text-neutral-500 font-bold mt-0.5">Total Budget</Text>
                        </View>

                        {/* Small circular chevron on far right */}
                        <View className="w-8 h-8 rounded-full items-center justify-center border ml-3" style={{ backgroundColor: '#141414', borderColor: '#222222' }}>
                          <ChevronRight size={12} color="#a3a3a3" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Elegant suitcase archive indicator at list footer */}
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
      </Modal>
    </SafeAreaView>
  );
}
