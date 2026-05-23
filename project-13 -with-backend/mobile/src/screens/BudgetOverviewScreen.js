import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image, StyleSheet, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Wallet, Filter, ChevronRight, Lightbulb, Calendar as CalendarIcon, Plus, X, MapPin } from 'lucide-react-native';
import client, { getImageUri } from '../api/client';
import Svg, { Circle } from 'react-native-svg';
import { PieChart } from 'react-native-chart-kit';

const THEME = { 
  bg: '#050505', 
  surface: '#121212', 
  brand: '#ec9006', 
  textMuted: '#888888', 
  textWhite: '#ffffff',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  border: '#1f1f1f',
  purple: '#a855f7'
};

const TRIP_COLORS = [
  '#ec9006', // Orange
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

// Circular Progress Component
const CircularProgress = ({ percentage, color, size = 60, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background Circle */}
        <Circle
          stroke="#1f1f1f"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Foreground Circle */}
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          originX={size / 2}
          originY={size / 2}
          rotation="-90"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{Math.round(percentage)}%</Text>
        <Text style={{ color: THEME.textMuted, fontSize: 9 }}>Used</Text>
      </View>
    </View>
  );
};

export default function BudgetOverviewScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tripExpenses, setTripExpenses] = useState({});
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(true);
  const [insightsModalVisible, setInsightsModalVisible] = useState(false);
  
  // Add Expense Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('misc');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [selectedTripForExpense, setSelectedTripForExpense] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddExpense = async () => {
    if (!selectedTripForExpense || !expenseTitle || !expenseAmount) {
      Alert.alert('Error', 'Please fill in all required fields and select a trip.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: expenseTitle,
        amount: Number(expenseAmount),
        category: expenseCategory,
        notes: expenseNotes,
        date: new Date().toISOString()
      };
      const res = await client.post(`/trips/${selectedTripForExpense}/expenses`, payload);
      if (res.data.success) {
        setModalVisible(false);
        setExpenseTitle('');
        setExpenseAmount('');
        setExpenseCategory('misc');
        setExpenseNotes('');
        fetchTripsAndExpenses(); // Refresh data
        Alert.alert('Success', 'Expense added successfully!');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add expense.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTripsAndExpenses = async () => {
    try {
      const res = await client.get('/trips?limit=100');
      const fetchedTrips = res.data.trips || [];
      setTrips(fetchedTrips);
      
      const expensesMap = {};
      await Promise.all(fetchedTrips.map(async (t) => {
        try {
          const expRes = await client.get(`/trips/${t._id}/expenses`);
          expensesMap[t._id] = expRes.data.expenses || [];
        } catch (e) { expensesMap[t._id] = []; }
      }));
      setTripExpenses(expensesMap);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  };

  useEffect(() => {
    fetchTripsAndExpenses();
    const unsub = navigation.addListener('focus', fetchTripsAndExpenses);
    return unsub;
  }, [navigation]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchTripsAndExpenses(); }, []);

  // Filter logic
  const filteredTrips = trips.filter(t => {
    if (filterStatus === 'All') return true;
    const now = new Date();
    const start = t.startDate ? new Date(t.startDate) : now;
    const end = t.endDate ? new Date(t.endDate) : now;
    let status = 'Planning';
    if (start <= now && end >= now) status = 'Ongoing';
    else if (end < now) status = 'Completed';
    return status === filterStatus;
  });

  // Aggregation
  const totalBudget = filteredTrips.reduce((a, t) => a + (t.totalBudget || 0), 0);
  
  let allExpenses = [];
  filteredTrips.forEach(t => {
    allExpenses = [...allExpenses, ...(tripExpenses[t._id] || [])];
  });
  
  const totalSpent = allExpenses.reduce((a, e) => a + (e.amount || 0), 0);
  const amountLeft = totalBudget - totalSpent;
  const budgetUsagePct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  // Insight calculation
  let onTrack = 0;
  filteredTrips.forEach(t => {
    const budget = t.totalBudget || 0;
    const spent = (tripExpenses[t._id] || []).reduce((a, e) => a + (e.amount || 0), 0);
    if (budget > 0 && (spent / budget) * 100 <= 75) onTrack++;
  });

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: THEME.bg }}>
        <ActivityIndicator size="large" color={THEME.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: THEME.bg }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">Trip Budgets</Text>
            <Text className="text-xs mt-0.5" style={{ color: THEME.textMuted }}>All your trips at a glance</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => {
              if (trips.length > 0) setSelectedTripForExpense(trips[0]._id);
              setModalVisible(true);
            }}
            style={{ backgroundColor: THEME.brand + '20', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: THEME.brand }}
          >
            <Plus size={14} color={THEME.brand} />
            <Text style={{ color: THEME.brand, fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-10 h-10 rounded-xl items-center justify-center border" 
            style={{ borderColor: showFilters ? THEME.brand : THEME.border, backgroundColor: showFilters ? THEME.brand + '15' : 'transparent' }}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} color={showFilters ? THEME.brand : THEME.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.brand} />}>
        {/* Filter Chips */}
        {showFilters && (
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All', 'Ongoing', 'Planning', 'Completed'].map(f => {
                const isActive = filterStatus === f;
                let chipColor = THEME.textMuted;
                if (isActive) {
                  if (f === 'Ongoing') chipColor = '#ec9006';
                  else if (f === 'Planning') chipColor = '#3b82f6';
                  else if (f === 'Completed') chipColor = '#22c55e';
                  else chipColor = THEME.brand;
                }

                return (
                  <TouchableOpacity 
                    key={f}
                    onPress={() => setFilterStatus(f)}
                    style={{ 
                      paddingHorizontal: 16, 
                      paddingVertical: 8, 
                      borderRadius: 20, 
                      marginRight: 8,
                      backgroundColor: isActive ? chipColor + '20' : THEME.surface,
                      borderWidth: 1, 
                      borderColor: isActive ? chipColor : THEME.border 
                    }}
                  >
                    <Text style={{ color: isActive ? chipColor : THEME.textWhite, fontSize: 12, fontWeight: isActive ? 'bold' : 'normal' }}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Top Total Card */}
        <View className="rounded-2xl p-4 mb-5 border" style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}>
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#ec900620' }}>
              <Wallet size={20} color={THEME.brand} />
            </View>
            <Text className="text-xs" style={{ color: THEME.textMuted }}>
              Total Across {filteredTrips.length} {filterStatus !== 'All' ? filterStatus : ''} Trips
            </Text>
          </View>

          <View className="flex-row justify-between pl-1">
            <View>
              <Text className="text-base font-bold text-white mb-1">₹{totalBudget.toLocaleString()}</Text>
              <Text className="text-[10px] font-bold" style={{ color: THEME.brand }}>Total Budget</Text>
            </View>
            <View>
              <Text className="text-base font-bold text-white mb-1">₹{totalSpent.toLocaleString()}</Text>
              <Text className="text-[10px] font-bold" style={{ color: THEME.yellow }}>Total Spent</Text>
            </View>
            <View>
              <Text className="text-base font-bold text-white mb-1">₹{amountLeft.toLocaleString()}</Text>
              <Text className="text-[10px] font-bold" style={{ color: THEME.green }}>Total Left</Text>
            </View>
            <View>
              <Text className="text-base font-bold text-white mb-1">{budgetUsagePct.toFixed(1)}%</Text>
              <Text className="text-[10px] font-bold" style={{ color: THEME.purple }}>Avg. Used</Text>
            </View>
          </View>
        </View>

        {/* Trip Cards */}
        {(() => {
          if (filteredTrips.length === 0) {
            return (
              <View className="items-center py-10">
                <Wallet size={32} color={THEME.textMuted} />
                <Text className="text-sm mt-3" style={{ color: THEME.textMuted }}>No trips found for '{filterStatus}'</Text>
              </View>
            );
          }

          return filteredTrips.map((t, index) => {
            const b = t.totalBudget || 0;
            const s = (tripExpenses[t._id] || []).reduce((a,e) => a + (e.amount||0), 0);
            const p = b > 0 ? (s/b)*100 : 0;
            const l = b - s;
            
            const isOver = p > 90;
            const leftColor = isOver ? THEME.red : THEME.green;
            const themeColor = TRIP_COLORS[index % TRIP_COLORS.length];
            
            // Determine status based on dates
            const now = new Date();
            const start = t.startDate ? new Date(t.startDate) : now;
            const end = t.endDate ? new Date(t.endDate) : now;
            let status = 'Planning';
            let statusColor = '#3b82f6'; // Blue for Planning
            
            if (start <= now && end >= now) {
              status = 'Ongoing';
              statusColor = '#ec9006'; // Orange for Ongoing
            } else if (end < now) {
              status = 'Completed';
              statusColor = '#22c55e'; // Green for Completed
            }

            return (
              <TouchableOpacity 
                key={t._id} 
                className="rounded-2xl p-4 mb-4 border flex-row items-center relative" 
                style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TripBudget', { tripId: t._id })}
              >
                {/* Trip Image */}
                <Image 
                  source={t.coverImage ? { uri: getImageUri(t.coverImage) } : require('../../assets/image copy.png')}
                  className="w-16 h-16 rounded-full mr-4"
                />

                <View className="flex-1">
                  {/* Title and Status */}
                  <View className="flex-row items-center mb-1">
                    <Text className="text-[15px] font-bold text-white mr-2" numberOfLines={1}>{t.title}</Text>
                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: statusColor + '20' }}>
                      <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: statusColor }}>{status}</Text>
                    </View>
                  </View>

                  {/* Destination */}
                  <View className="flex-row items-center mb-1">
                    <MapPin size={10} color={THEME.textMuted} />
                    <Text className="text-[11px] font-semibold ml-1" style={{ color: THEME.textMuted }} numberOfLines={1}>
                      {t.destination}
                    </Text>
                  </View>

                  {/* Dates */}
                  <View className="flex-row items-center mb-3">
                    <CalendarIcon size={10} color={THEME.textMuted} />
                    <Text className="text-[10px] ml-1 font-medium" style={{ color: THEME.textMuted }}>
                      {t.startDate ? new Date(t.startDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''} - {t.endDate ? new Date(t.endDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''}
                    </Text>
                  </View>

                  {/* Finances */}
                  <View className="flex-row items-center pr-2">
                    <View>
                      <Text className="text-[17px] font-bold text-white tracking-tight">₹{b.toLocaleString()}</Text>
                      <Text className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: THEME.textMuted }}>Total Budget</Text>
                    </View>
                  </View>
                </View>

                {/* Progress Ring */}
                <View className="ml-2 flex-row items-center mt-3">
                  <CircularProgress percentage={p > 100 ? 100 : p} color={themeColor} size={64} strokeWidth={5} />
                  <ChevronRight size={16} color={THEME.textMuted} style={{ marginLeft: 10 }} />
                </View>

                {/* Top Right Add Expense Button */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: themeColor + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: themeColor
                  }}
                  onPress={(e) => {
                    setSelectedTripForExpense(t._id);
                    setModalVisible(true);
                  }}
                >
                  <Plus size={20} color={themeColor} strokeWidth={2.5} />
                </TouchableOpacity>

              </TouchableOpacity>
            );
          });
        })()}

        {/* Insight Banner */}
        <TouchableOpacity 
          onPress={() => setInsightsModalVisible(true)}
          activeOpacity={0.7}
          className="rounded-xl flex-row items-center justify-between p-3 mb-8 border" 
          style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
        >
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: THEME.brand + '20' }}>
              <Lightbulb size={16} color={THEME.brand} />
            </View>
            <Text className="text-[11px] text-white flex-1"><Text style={{ color: THEME.brand, fontWeight: 'bold' }}>Insight</Text>  You're doing great! {onTrack} trips are on track.</Text>
          </View>
          <ChevronRight size={16} color={THEME.brand} />
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: THEME.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Add New Expense</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={THEME.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Trip Selection */}
                <Text style={{ color: THEME.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>SELECT TRIP</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  {trips.map((t) => (
                    <TouchableOpacity 
                      key={t._id} 
                      onPress={() => setSelectedTripForExpense(t._id)}
                      style={{ 
                        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                        backgroundColor: selectedTripForExpense === t._id ? THEME.brand + '20' : THEME.bg,
                        borderWidth: 1, borderColor: selectedTripForExpense === t._id ? THEME.brand : THEME.border
                      }}
                    >
                      <Text style={{ color: selectedTripForExpense === t._id ? THEME.brand : '#fff', fontSize: 12, fontWeight: 'bold' }}>{t.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Amount */}
                <Text style={{ color: THEME.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>AMOUNT (₹)</Text>
                <TextInput 
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  keyboardType="numeric"
                  placeholder="e.g. 1500"
                  placeholderTextColor="#555"
                  style={{ backgroundColor: THEME.bg, color: '#fff', fontSize: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, marginBottom: 20 }}
                />

                {/* Title */}
                <Text style={{ color: THEME.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>EXPENSE TITLE</Text>
                <TextInput 
                  value={expenseTitle}
                  onChangeText={setExpenseTitle}
                  placeholder="e.g. Dinner at Cafe"
                  placeholderTextColor="#555"
                  style={{ backgroundColor: THEME.bg, color: '#fff', fontSize: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, marginBottom: 20 }}
                />

                {/* Category */}
                <Text style={{ color: THEME.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>CATEGORY</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {['accommodation', 'transport', 'food', 'entertainment', 'shopping', 'health', 'visa', 'misc'].map(cat => (
                    <TouchableOpacity 
                      key={cat}
                      onPress={() => setExpenseCategory(cat)}
                      style={{ 
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
                        backgroundColor: expenseCategory === cat ? THEME.brand + '20' : THEME.bg,
                        borderWidth: 1, borderColor: expenseCategory === cat ? THEME.brand : THEME.border
                      }}
                    >
                      <Text style={{ color: expenseCategory === cat ? THEME.brand : '#ccc', fontSize: 11, textTransform: 'capitalize' }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Notes */}
                <Text style={{ color: THEME.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>NOTES / DESCRIPTION (OPTIONAL)</Text>
                <TextInput 
                  value={expenseNotes}
                  onChangeText={setExpenseNotes}
                  placeholder="e.g., Paid via UPI, bill split details, etc."
                  placeholderTextColor="#555"
                  multiline
                  numberOfLines={3}
                  style={{ backgroundColor: THEME.bg, color: '#fff', fontSize: 14, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, marginBottom: 24, textAlignVertical: 'top', height: 80 }}
                />

                {/* Submit Button */}
                <TouchableOpacity 
                  onPress={handleAddExpense}
                  disabled={submitting}
                  style={{ backgroundColor: THEME.brand, padding: 16, borderRadius: 16, alignItems: 'center', opacity: submitting ? 0.7 : 1, marginBottom: 20 }}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Save Expense</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Insights Modal */}
      {(() => {
        // Calculation of category totals for insights
        const categoryTotals = {
          accommodation: 0,
          transport: 0,
          food: 0,
          entertainment: 0,
          shopping: 0,
          health: 0,
          visa: 0,
          misc: 0
        };
        
        let maxSpentTrip = 'None';
        let maxSpentAmount = 0;
        let tripsOverBudgetCount = 0;

        filteredTrips.forEach(t => {
          const expenses = tripExpenses[t._id] || [];
          const spent = expenses.reduce((a, e) => a + (e.amount || 0), 0);
          const budget = t.totalBudget || 0;
          
          if (spent > budget) {
            tripsOverBudgetCount++;
          }
          if (spent > maxSpentAmount) {
            maxSpentAmount = spent;
            maxSpentTrip = t.title;
          }

          expenses.forEach(e => {
            const cat = e.category?.toLowerCase() || 'misc';
            if (categoryTotals.hasOwnProperty(cat)) {
              categoryTotals[cat] += (e.amount || 0);
            } else {
              categoryTotals.misc += (e.amount || 0);
            }
          });
        });

        const pieData = Object.keys(categoryTotals).map((cat, idx) => {
          const colors = ['#ec9006', '#3b82f6', '#22c55e', '#a855f7', '#eab308', '#64748b'];
          return {
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            population: categoryTotals[cat],
            color: colors[idx % colors.length],
            legendFontColor: '#aaa',
            legendFontSize: 11
          };
        }).filter(d => d.population > 0);

        // Find top category
        let topCategory = 'None';
        let maxCatAmount = 0;
        Object.keys(categoryTotals).forEach(cat => {
          if (categoryTotals[cat] > maxCatAmount) {
            maxCatAmount = categoryTotals[cat];
            topCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
          }
        });

        return (
          <Modal visible={insightsModalVisible} animationType="slide" transparent={true} onRequestClose={() => setInsightsModalVisible(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
              <View style={{ backgroundColor: THEME.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '90%' }}>
                
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Trip Budget Insights</Text>
                    <Text style={{ fontSize: 11, color: THEME.textMuted }}>Analytics across {filteredTrips.length} trips</Text>
                  </View>
                  <TouchableOpacity onPress={() => setInsightsModalVisible(false)}>
                    <X size={24} color={THEME.textMuted} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  
                  {/* Category Breakdown Chart */}
                  <Text style={{ color: THEME.textWhite, fontSize: 13, fontWeight: 'bold', marginBottom: 12 }}>SPENDING BY CATEGORY</Text>
                  {pieData.length > 0 ? (
                    <View style={{ alignItems: 'center', backgroundColor: THEME.bg, borderRadius: 16, padding: 12, marginBottom: 24, borderWidth: 1, borderColor: THEME.border }}>
                      <PieChart
                        data={pieData}
                        width={Dimensions.get('window').width - 70}
                        height={160}
                        chartConfig={{
                          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                      />
                    </View>
                  ) : (
                    <View style={{ backgroundColor: THEME.bg, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: THEME.border }}>
                      <Lightbulb size={24} color={THEME.textMuted} />
                      <Text style={{ color: THEME.textMuted, fontSize: 12, marginTop: 8 }}>No expenses recorded yet.</Text>
                    </View>
                  )}

                  {/* Key Highlights Grid */}
                  <Text style={{ color: THEME.textWhite, fontSize: 13, fontWeight: 'bold', marginBottom: 12 }}>KEY PERFORMANCE STATS</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                    
                    {/* Stat 1 */}
                    <View style={{ width: '47%', backgroundColor: THEME.bg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: THEME.border }}>
                      <Text style={{ color: THEME.textMuted, fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>TOP CATEGORY</Text>
                      <Text style={{ color: THEME.brand, fontSize: 14, fontWeight: 'bold' }} numberOfLines={1}>{topCategory}</Text>
                      <Text style={{ color: THEME.textWhite, fontSize: 10, marginTop: 2 }}>₹{maxCatAmount.toLocaleString()}</Text>
                    </View>

                    {/* Stat 2 */}
                    <View style={{ width: '47%', backgroundColor: THEME.bg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: THEME.border }}>
                      <Text style={{ color: THEME.textMuted, fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>MOST EXPENSIVE TRIP</Text>
                      <Text style={{ color: THEME.yellow, fontSize: 14, fontWeight: 'bold' }} numberOfLines={1}>{maxSpentTrip}</Text>
                      <Text style={{ color: THEME.textWhite, fontSize: 10, marginTop: 2 }}>₹{maxSpentAmount.toLocaleString()}</Text>
                    </View>

                    {/* Stat 3 */}
                    <View style={{ width: '47%', backgroundColor: THEME.bg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: THEME.border }}>
                      <Text style={{ color: THEME.textMuted, fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>AVG SPENT PER TRIP</Text>
                      <Text style={{ color: THEME.green, fontSize: 14, fontWeight: 'bold' }}>
                        ₹{filteredTrips.length > 0 ? Math.round(totalSpent / filteredTrips.length).toLocaleString() : 0}
                      </Text>
                    </View>

                    {/* Stat 4 */}
                    <View style={{ width: '47%', backgroundColor: THEME.bg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: THEME.border }}>
                      <Text style={{ color: THEME.textMuted, fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>OVER BUDGET TRIPS</Text>
                      <Text style={{ color: THEME.red, fontSize: 14, fontWeight: 'bold' }}>
                        {tripsOverBudgetCount} {tripsOverBudgetCount === 1 ? 'Trip' : 'Trips'}
                      </Text>
                    </View>

                  </View>

                  {/* Custom Trip Budget Comparison List */}
                  <Text style={{ color: THEME.textWhite, fontSize: 13, fontWeight: 'bold', marginBottom: 12 }}>TRIP BUDGET VS SPENT</Text>
                  <View style={{ backgroundColor: THEME.bg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 20 }}>
                    {filteredTrips.map(t => {
                      const budget = t.totalBudget || 0;
                      const spent = (tripExpenses[t._id] || []).reduce((a, e) => a + (e.amount || 0), 0);
                      const usagePct = budget > 0 ? (spent / budget) * 100 : 0;
                      const barColor = spent > budget ? THEME.red : (usagePct > 80 ? THEME.yellow : THEME.green);

                      return (
                        <View key={t._id} style={{ marginBottom: 16 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{t.title}</Text>
                            <Text style={{ color: barColor, fontSize: 10, fontWeight: 'bold' }}>
                              ₹{spent.toLocaleString()} / ₹{budget.toLocaleString()}
                            </Text>
                          </View>
                          
                          {/* Progress bar */}
                          <View style={{ height: 6, width: '100%', backgroundColor: '#222', borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${Math.min(usagePct, 100)}%`, backgroundColor: barColor, borderRadius: 3 }} />
                          </View>
                        </View>
                      );
                    })}
                  </View>

                </ScrollView>
              </View>
            </View>
          </Modal>
        );
      })()}
    </SafeAreaView>
  );
}
