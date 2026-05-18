import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, ChevronDown, DollarSign, Tag, MapPin, Calendar } from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';
import client from '../api/client';

const THEME = { surface: '#111111', brand: '#f97316', textMuted: '#525252', textSecondary: '#a3a3a3', success: '#22c55e', border: '#2e2e2e' };
const EXP_CAT_COLORS = { transport: '#3b82f6', accommodation: '#8b5cf6', food: '#f59e0b', entertainment: '#ec4899', shopping: '#06b6d4', health: '#22c55e', visa: '#f97316', misc: '#6b7280' };

export default function BudgetOverviewScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [tripExpenses, setTripExpenses] = useState({});

  const fetchTrips = async () => {
    try {
      const res = await client.get('/trips?limit=100');
      if (res.data.success) setTrips(res.data.trips || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchTrips();
    const unsub = navigation.addListener('focus', fetchTrips);
    return unsub;
  }, [navigation]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchTrips(); }, []);

  const toggleTrip = async (tripId) => {
    if (expandedTrip === tripId) { setExpandedTrip(null); return; }
    setExpandedTrip(tripId);
    if (!tripExpenses[tripId]) {
      try {
        const res = await client.get(`/trips/${tripId}/expenses`);
        setTripExpenses(prev => ({ ...prev, [tripId]: res.data.expenses || [] }));
      } catch (e) { console.error(e); }
    }
  };

  const totalBudget = trips.reduce((a, t) => a + (t.totalBudget || 0), 0);
  const totalSpent = Object.values(tripExpenses).flat().reduce((a, e) => a + (e.amount || 0), 0);

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: THEME.surface }}>
        <ActivityIndicator size="large" color={THEME.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: THEME.surface }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 }}>
        <Text className="text-2xl font-bold text-white">Budget Overview</Text>
        <Text className="text-text-muted text-xs mt-1">Track spending across all your trips</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.brand} />}>

        {/* Global Summary */}
        <View className="flex-row gap-2 mb-5">
          {[
            { label: 'Total Budget', value: `₹${totalBudget.toLocaleString()}`, color: THEME.brand, icon: Wallet },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, color: '#f59e0b', icon: Tag },
            { label: 'Remaining', value: `₹${(totalBudget - totalSpent).toLocaleString()}`, color: (totalBudget - totalSpent) >= 0 ? THEME.success : '#ef4444', icon: DollarSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <View key={label} className="flex-1 border rounded-2xl" style={{ padding: 12, borderColor: THEME.border, backgroundColor: '#1a1a1a' }}>
              <View className="w-7 h-7 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: color + '20' }}>
                <Icon size={14} color={color} />
              </View>
              <Text className="font-bold text-sm" style={{ color }}>{value}</Text>
              <Text className="text-[8px] font-bold uppercase mt-0.5" style={{ color: THEME.textMuted }}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Trip Budget Cards */}
        <Text className="font-bold text-base text-white mb-3">Per Trip</Text>

        {trips.length === 0 && (
          <View className="items-center py-10">
            <Wallet size={32} color={THEME.textMuted} />
            <Text className="text-sm mt-3" style={{ color: THEME.textMuted }}>No trips yet</Text>
          </View>
        )}

        {trips.map(trip => {
          const isExpanded = expandedTrip === trip._id;
          const expenses = tripExpenses[trip._id] || [];
          const spent = expenses.reduce((a, e) => a + (e.amount || 0), 0);
          const budget = trip.totalBudget || 0;
          const pct = budget ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
          const barColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : THEME.success;

          return (
            <View key={trip._id} className="border rounded-2xl overflow-hidden" style={{ borderColor: THEME.border, backgroundColor: '#1a1a1a', marginBottom: 10 }}>
              {/* Trip Header */}
              <TouchableOpacity onPress={() => toggleTrip(trip._id)} activeOpacity={0.7} style={{ padding: 14 }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-bold text-sm text-white">{trip.title}</Text>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={10} color={THEME.textMuted} />
                      <Text className="text-[10px] ml-1" style={{ color: THEME.textMuted }}>{trip.destination}</Text>
                      <Text className="text-[10px] ml-3" style={{ color: THEME.textMuted }}>₹{budget.toLocaleString()}</Text>
                    </View>
                  </View>
                  <ChevronDown size={16} color={THEME.textSecondary} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
                </View>

                {/* Mini Progress */}
                {budget > 0 && (
                  <View className="mt-3">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-[9px]" style={{ color: THEME.textMuted }}>₹{spent.toLocaleString()} spent</Text>
                      <Text className="text-[9px] font-bold" style={{ color: barColor }}>{pct}%</Text>
                    </View>
                    <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2e2e2e' }}>
                      <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              {/* Expanded Details */}
              {isExpanded && (
                <View style={{ padding: 14, paddingTop: 0, borderTopWidth: 1, borderTopColor: THEME.border }}>
                  {expenses.length === 0 ? (
                    <Text className="text-[11px] text-center py-4" style={{ color: THEME.textMuted }}>No expenses recorded</Text>
                  ) : (
                    <>
                      {/* Pie Chart */}
                      {(() => {
                        const byCategory = {};
                        expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0); });
                        const catEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
                        const screenW = Dimensions.get('window').width - 100;
                        const pieData = catEntries.map(([cat, amount]) => ({
                          name: cat.charAt(0).toUpperCase() + cat.slice(1),
                          population: amount,
                          color: EXP_CAT_COLORS[cat] || '#6b7280',
                          legendFontColor: '#a3a3a3',
                          legendFontSize: 9,
                        }));
                        return (
                          <View style={{ marginTop: 10, marginBottom: 6 }}>
                            <PieChart data={pieData} width={screenW} height={140} chartConfig={{ color: () => '#fff' }} accessor="population" backgroundColor="transparent" paddingLeft="0" absolute />
                          </View>
                        );
                      })()}

                      {/* Expense Items */}
                      {expenses.map(exp => {
                        const catColor = EXP_CAT_COLORS[exp.category] || '#6b7280';
                        return (
                          <View key={exp._id} className="flex-row items-center" style={{ paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#2e2e2e' }}>
                            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: catColor }} />
                            <Text className="flex-1 text-[11px] text-white">{exp.title}</Text>
                            <Text className="text-[11px] font-bold" style={{ color: THEME.brand }}>₹{exp.amount?.toLocaleString()}</Text>
                          </View>
                        );
                      })}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
