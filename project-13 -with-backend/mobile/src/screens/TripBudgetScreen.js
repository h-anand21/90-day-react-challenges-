import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image, StyleSheet, Dimensions, Modal } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit2, Wallet, Tag, PieChart as PieChartIcon, TrendingUp, Bed, Car, Utensils, Camera, ShoppingBag, FileText, IndianRupee, X, Users, Heart, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import client, { getImageUri } from '../api/client';

const { width } = Dimensions.get('window');
const THEME = { 
  bg: '#050505', 
  surface: '#121212', 
  brand: '#ec9006', 
  textMuted: '#888888', 
  textWhite: '#ffffff',
  green: '#22c55e',
  border: '#1f1f1f',
};

const EXP_CAT_COLORS = { 
  accommodation: '#ec9006', 
  transport: '#3b82f6', 
  food: '#eab308', 
  entertainment: '#8b5cf6', 
  shopping: '#ec4899', 
  health: '#22c55e', 
  visa: '#a855f7', 
  misc: '#06b6d4'
};

const ICONS = {
  accommodation: Bed,
  transport: Car,
  food: Utensils,
  entertainment: Camera,
  shopping: ShoppingBag,
  health: Heart,
  visa: Globe,
  misc: Wallet
};

export default function TripBudgetScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState(null);
  const [memberFilterModalVisible, setMemberFilterModalVisible] = useState(false);
  const [allExpensesModalVisible, setAllExpensesModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      const [tripRes, expRes] = await Promise.all([
        client.get(`/trips/${tripId}`),
        client.get(`/trips/${tripId}/expenses`)
      ]);
      setTrip(tripRes.data.trip);
      setMembers(tripRes.data.members || []);
      setExpenses(expRes.data.expenses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.brand} />
      </View>
    );
  }

  if (!trip) return null;

  const getMemberSpentAmount = (memberUserId) => {
    return expenses
      .filter(e => e.paidBy?._id === memberUserId || e.paidBy === memberUserId)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  // Calcs
  const filteredExpenses = selectedMemberFilter
    ? expenses.filter(e => e.paidBy?._id === selectedMemberFilter || e.paidBy === selectedMemberFilter)
    : expenses;

  const budget = trip.totalBudget || 0;
  const spent = filteredExpenses.reduce((a, e) => a + (e.amount || 0), 0);
  const left = budget - spent;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  // Categories
  const catTotals = {};
  filteredExpenses.forEach(e => {
    const c = e.category || 'misc';
    catTotals[c] = (catTotals[c] || 0) + (e.amount || 0);
  });
  
  const chartData = Object.keys(catTotals).map(cat => ({
    name: cat,
    population: catTotals[cat],
    color: EXP_CAT_COLORS[cat] || '#888',
    legendFontColor: 'transparent',
    legendFontSize: 0
  })).sort((a,b) => b.population - a.population);

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.brand} />}>
        
        {/* Hero Section */}
        <View style={{ height: 320, width: '100%', position: 'relative' }}>
          <Image 
            source={trip.coverImage ? { uri: getImageUri(trip.coverImage) } : require('../../assets/image copy.png')} 
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            resizeMode="cover"
          />
          <LinearGradient 
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.2)', '#050505']} 
            style={{ position: 'absolute', width: '100%', height: '100%' }} 
          />

          {/* Header */}
          <SafeAreaView edges={['top']}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
                  <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>{trip.title}</Text>
                  <Text style={{ fontSize: 12, color: '#ccc' }}>
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setMemberFilterModalVisible(true)}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}
              >
                <Users size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Image Content Bottom */}
          <View style={{ position: 'absolute', bottom: 20, width: '100%', paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <Image 
                source={trip.coverImage ? { uri: getImageUri(trip.coverImage) } : require('../../assets/image copy.png')}
                style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: THEME.brand }}
              />
              {(() => {
                const now = new Date();
                const start = trip.startDate ? new Date(trip.startDate) : now;
                const end = trip.endDate ? new Date(trip.endDate) : now;
                let status = 'Planning';
                let statusColor = '#3b82f6';
                if (start <= now && end >= now) { status = 'Ongoing'; statusColor = '#ec9006'; }
                else if (end < now) { status = 'Completed'; statusColor = '#22c55e'; }
                return (
                  <View style={{ backgroundColor: statusColor + '40', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                    <Text style={{ color: statusColor, fontSize: 10, fontWeight: 'bold' }}>{status}</Text>
                  </View>
                );
              })()}
            </View>

            {/* 4 Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(236, 144, 6,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Wallet size={16} color={THEME.brand} />
                </View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>₹{budget.toLocaleString()}</Text>
                <Text style={{ color: '#aaa', fontSize: 10 }}>Total Budget</Text>
              </View>

              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 }} />
              
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(234,179,8,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Tag size={16} color="#eab308" />
                </View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>₹{spent.toLocaleString()}</Text>
                <Text style={{ color: '#aaa', fontSize: 10 }}>Total Spent</Text>
              </View>

              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(34,197,94,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <IndianRupee size={16} color="#22c55e" />
                </View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>₹{left.toLocaleString()}</Text>
                <Text style={{ color: '#aaa', fontSize: 10 }}>Amount Left</Text>
              </View>

              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(236, 144, 6,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <PieChartIcon size={16} color={THEME.brand} />
                </View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{pct.toFixed(0)}%</Text>
                <Text style={{ color: '#aaa', fontSize: 10 }}>Budget Used</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={{ padding: 20 }}>
          
          {/* Active Member Filter Indicator */}
          {selectedMemberFilter && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.brand + '20', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: THEME.brand }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Users size={16} color={THEME.brand} style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontSize: 12, flexShrink: 1 }}>
                  Showing expenses for:{' '}
                  <Text style={{ fontWeight: 'bold', color: THEME.brand }}>
                    {members.find(m => m.user?._id === selectedMemberFilter)?.user?.name || 'Selected Member'}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMemberFilter(null)} style={{ backgroundColor: THEME.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                <Text style={{ color: '#ff4d4d', fontSize: 10, fontWeight: 'bold' }}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Budget Usage Bar */}
          <View style={{ backgroundColor: THEME.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 12 }}>Budget Usage</Text>
            <View style={{ height: 24, backgroundColor: '#222', borderRadius: 12, overflow: 'hidden', flexDirection: 'row' }}>
              <LinearGradient colors={['#ec9006', '#dc6601']} start={{x:0, y:0}} end={{x:1, y:0}} style={{ width: `${pct}%`, height: '100%', justifyContent: 'center', paddingRight: 10 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'right' }}>{pct.toFixed(0)}%</Text>
              </LinearGradient>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <TrendingUp size={14} color={THEME.green} />
              <Text style={{ color: THEME.green, fontSize: 12, marginLeft: 6 }}>You're on track! Keep it up.</Text>
            </View>
          </View>

          {/* Spending by Category */}
          <View style={{ backgroundColor: THEME.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 16 }}>Spending by Category</Text>
            
            {chartData.length > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ position: 'relative', width: 120, height: 120 }}>
                  <PieChart 
                    data={chartData} 
                    width={120} 
                    height={120} 
                    chartConfig={{ color: () => '#fff' }} 
                    accessor="population" 
                    backgroundColor="transparent" 
                    paddingLeft="30" 
                    hasLegend={false}
                    absolute 
                  />
                  <View style={{ position: 'absolute', top: 25, left: 25, width: 70, height: 70, borderRadius: 35, backgroundColor: THEME.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: THEME.textMuted, fontSize: 10 }}>Total</Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>₹{spent > 1000 ? (spent/1000).toFixed(1)+'k' : spent}</Text>
                  </View>
                </View>

                {/* Legend */}
                <View style={{ flex: 1, marginLeft: 20 }}>
                  {chartData.slice(0,6).map((c, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.color, marginRight: 8 }} />
                        <Text style={{ color: '#ddd', fontSize: 10, textTransform: 'capitalize' }} numberOfLines={1}>{c.name}</Text>
                      </View>
                      <Text style={{ color: '#ddd', fontSize: 10 }}>₹{c.population > 1000 ? (c.population/1000).toFixed(1)+'k' : c.population}</Text>
                      <Text style={{ color: THEME.textMuted, fontSize: 10, width: 28, textAlign: 'right' }}>{((c.population/spent)*100).toFixed(0)}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={{ color: THEME.textMuted, fontSize: 12 }}>No expenses recorded yet.</Text>
            )}
          </View>

          {/* Recent Expenses */}
          <View style={{ backgroundColor: THEME.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Recent Expenses</Text>
              <TouchableOpacity onPress={() => setAllExpensesModalVisible(true)}>
                <Text style={{ color: THEME.brand, fontSize: 11, fontWeight: 'bold' }}>View All</Text>
              </TouchableOpacity>
            </View>

            {filteredExpenses.slice(0, 5).map((exp, index) => {
              const cat = exp.category || 'misc';
              const catColor = EXP_CAT_COLORS[cat] || '#888';
              const Icon = ICONS[cat] || Wallet;

              return (
                <View key={exp._id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: index !== filteredExpenses.slice(0, 5).length-1 ? 16 : 0 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: catColor + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Icon size={18} color={catColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: catColor, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 }}>
                      {cat} • {exp.date ? new Date(exp.date).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 2 }}>{exp.title}</Text>
                    {exp.notes ? <Text style={{ color: '#aaa', fontSize: 10, marginBottom: 2, fontStyle: 'italic' }}>"{exp.notes}"</Text> : null}
                    <Text style={{ color: THEME.textMuted, fontSize: 9 }}>
                      Added by: {exp.paidBy?.name || 'Unknown'}
                    </Text>
                  </View>
                  <Text style={{ color: THEME.brand, fontSize: 14, fontWeight: 'bold' }}>₹{exp.amount?.toLocaleString()}</Text>
                </View>
              );
            })}
            
            {filteredExpenses.length === 0 && (
              <Text style={{ color: THEME.textMuted, fontSize: 12 }}>No expenses recorded.</Text>
            )}
          </View>



        </View>
      </ScrollView>

      {/* Member Filter Modal */}
      <Modal visible={memberFilterModalVisible} animationType="fade" transparent={true} onRequestClose={() => setMemberFilterModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: THEME.surface, borderRadius: 20, width: '100%', padding: 24, borderWidth: 1, borderColor: THEME.border }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Filter by Member</Text>
              <TouchableOpacity onPress={() => setMemberFilterModalVisible(false)}>
                <X size={20} color={THEME.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {/* Option to clear filter */}
              <TouchableOpacity 
                onPress={() => {
                  setSelectedMemberFilter(null);
                  setMemberFilterModalVisible(false);
                }}
                style={{ 
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, 
                  borderBottomWidth: 1, borderBottomColor: THEME.border,
                  backgroundColor: selectedMemberFilter === null ? THEME.brand + '15' : 'transparent',
                  paddingHorizontal: 12, borderRadius: 8
                }}
              >
                <Text style={{ color: selectedMemberFilter === null ? THEME.brand : '#fff', fontWeight: 'bold', fontSize: 14 }}>All Members</Text>
                <Text style={{ color: THEME.textMuted, fontSize: 12 }}>₹{expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}</Text>
              </TouchableOpacity>

              {/* List of members */}
              {members.map((m) => {
                const memberUser = m.user;
                if (!memberUser) return null;
                const memberSpent = getMemberSpentAmount(memberUser._id);
                const isSelected = selectedMemberFilter === memberUser._id;

                return (
                  <TouchableOpacity 
                    key={m._id}
                    onPress={() => {
                      setSelectedMemberFilter(memberUser._id);
                      setMemberFilterModalVisible(false);
                    }}
                    style={{ 
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, 
                      borderBottomWidth: 1, borderBottomColor: THEME.border,
                      backgroundColor: isSelected ? THEME.brand + '15' : 'transparent',
                      paddingHorizontal: 12, borderRadius: 8, marginTop: 4
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: THEME.brand + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Text style={{ color: THEME.brand, fontWeight: 'bold', fontSize: 12 }}>
                          {memberUser.name?.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={{ color: isSelected ? THEME.brand : '#fff', fontWeight: 'bold', fontSize: 14 }}>
                        {memberUser.name} {m.role === 'owner' ? '(Owner)' : ''}
                      </Text>
                    </View>
                    <Text style={{ color: THEME.brand, fontWeight: 'bold', fontSize: 13 }}>
                      ₹{memberSpent.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* View All Expenses Modal */}
      <Modal visible={allExpensesModalVisible} animationType="slide" transparent={true} onRequestClose={() => setAllExpensesModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: THEME.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '75%' }}>
            
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>All Expenses</Text>
                <Text style={{ fontSize: 11, color: THEME.textMuted }}>Total {expenses.length} expenses recorded</Text>
              </View>
              <TouchableOpacity onPress={() => setAllExpensesModalVisible(false)}>
                <X size={24} color={THEME.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredExpenses.map((exp, index) => {
                const cat = exp.category || 'misc';
                const catColor = EXP_CAT_COLORS[cat] || '#888';
                const Icon = ICONS[cat] || Wallet;

                return (
                  <View key={exp._id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: index !== filteredExpenses.length - 1 ? 1 : 0, borderBottomColor: THEME.border }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: catColor + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Icon size={18} color={catColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: catColor, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 }}>
                        {cat} • {exp.date ? new Date(exp.date).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''}
                      </Text>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 2 }}>{exp.title}</Text>
                      {exp.notes ? <Text style={{ color: '#aaa', fontSize: 10, marginBottom: 2, fontStyle: 'italic' }}>"{exp.notes}"</Text> : null}
                      <Text style={{ color: THEME.textMuted, fontSize: 9 }}>
                        Added by: {exp.paidBy?.name || 'Unknown'}
                      </Text>
                    </View>
                    <Text style={{ color: THEME.brand, fontSize: 14, fontWeight: 'bold' }}>₹{exp.amount?.toLocaleString()}</Text>
                  </View>
                );
              })}

              {filteredExpenses.length === 0 && (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Text style={{ color: THEME.textMuted, fontSize: 12 }}>No expenses recorded yet.</Text>
                </View>
              )}
            </ScrollView>

          </View>
        </View>
      </Modal>

    </View>
  );
}
