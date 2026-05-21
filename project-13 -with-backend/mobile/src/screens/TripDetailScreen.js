import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, ScrollView, ActivityIndicator, TouchableOpacity, Image,
  RefreshControl, Modal, TextInput, Alert, LayoutAnimation, Platform, UIManager, Dimensions
} from 'react-native';
import { Text } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, MapPin, Users, DollarSign, Globe, Compass,
  CheckSquare, Plane, Info, Clock, CheckCircle2, 
  Circle, Tag, Wallet, Ticket, Plus, Trash2, X,
  ChevronDown, ChevronRight, Hotel, Car, Utensils, Package, Map as MapIcon,
  MessageSquare, Crown, Eye, Edit3, UserX, Shield, BarChart2
} from 'lucide-react-native';
import client, { getImageUri } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getDynamicTripStatus } from './DashboardScreen';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const THEME = {
  brand: '#f97316',
  surface: '#111111',
  surface2: '#1a1a1a',
  border: '#2e2e2e',
  textPrimary: '#ffffff',
  textSecondary: '#a3a3a3',
  textMuted: '#525252',
  success: '#22c55e',
  danger: '#ef4444',
  info: '#3b82f6',
};

const CAT_COLORS = {
  transport: '#3b82f6', accommodation: '#8b5cf6', food: '#f59e0b',
  activity: '#f97316', sightseeing: '#22c55e', other: '#6b7280',
};

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { user: currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [subData, setSubData] = useState({ itinerary: [], checklists: [], expenses: [], reservations: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'itinerary');

  const [modalType, setModalType] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    try {
      const [tripRes, daysRes, checklistsRes, expensesRes, reservationsRes] = await Promise.all([
        client.get(`/trips/${tripId}`),
        client.get(`/trips/${tripId}/days`),
        client.get(`/trips/${tripId}/checklists`),
        client.get(`/trips/${tripId}/expenses`),
        client.get(`/trips/${tripId}/reservations`),
      ]);

      if (tripRes.data.success) {
        setData(tripRes.data);
        const days = daysRes.data.days || [];
        const daysWithActivities = await Promise.all(days.map(async d => {
          const actRes = await client.get(`/days/${d._id}/activities`);
          return { ...d, activities: actRes.data.activities || [] };
        }));
        setSubData({
          itinerary: daysWithActivities,
          checklists: checklistsRes.data.checklists || [],
          expenses: expensesRes.data.expenses || [],
          reservations: reservationsRes.data.reservations || []
        });
      }
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, [tripId]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  const handleAction = async (action, endpoint, body = {}) => {
    try {
      let res;
      if (action === 'POST') res = await client.post(endpoint, body);
      if (action === 'PATCH') res = await client.patch(endpoint, body);
      if (action === 'DELETE') res = await client.delete(endpoint);
      if (res.data.success) { setModalType(null); setFormData({}); fetchData(); }
    } catch (e) { Alert.alert('Error', 'Operation failed'); }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-surface items-center justify-center" style={{ backgroundColor: THEME.surface }}>
        <ActivityIndicator size="large" color={THEME.brand} />
      </View>
    );
  }

  const { trip, members, myRole } = data;
  const canEdit = myRole === 'owner' || myRole === 'editor';

  const tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'reservations', label: 'Reservations', icon: MapPin },
    { id: 'budget', label: 'Budget', icon: DollarSign },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: THEME.surface }} edges={['bottom']}>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.brand} />}>
        <View className="px-6 pt-2 pb-6">
          {/* Scenic Full-Width Destination Cover Banner */}
          <View style={{ height: 180, borderRadius: 24, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#2e2e2e', position: 'relative' }}>
            <Image
              source={{ uri: getImageUri(trip.coverImage || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80') }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.38)' }} />
            
            {/* Floating weather pill on cover image */}
            <View className="absolute bottom-4 right-4 flex-row items-center px-3 py-1.5 rounded-full border" style={{ backgroundColor: 'rgba(17,17,17,0.85)', borderColor: '#2e2e2e' }}>
              <Compass size={12} color="#f97316" />
              <Text className="text-[10px] font-black text-white ml-1.5">Explore {trip.destination}</Text>
            </View>
          </View>

          <Text className="text-4xl font-bold text-white leading-tight" style={{ color: '#FFFFFF' }}>{trip.title}</Text>
          <View className="flex-row flex-wrap items-center mt-3 mb-2 gap-2">
            {trip.destination && <View className="flex-row items-center bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"><Globe size={11} color={THEME.textSecondary} /><Text className="text-[10px] text-text-secondary ml-1" style={{ color: THEME.textSecondary }}>{trip.destination}</Text></View>}
            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: getDynamicTripStatus(trip.startDate, trip.endDate) === 'ongoing' ? '#22c55e20' : getDynamicTripStatus(trip.startDate, trip.endDate) === 'completed' ? '#f9731620' : '#3b82f620' }}><Text className="text-[10px] font-bold uppercase" style={{ color: getDynamicTripStatus(trip.startDate, trip.endDate) === 'ongoing' ? '#22c55e' : getDynamicTripStatus(trip.startDate, trip.endDate) === 'completed' ? '#f97316' : '#3b82f6' }}>{getDynamicTripStatus(trip.startDate, trip.endDate)}</Text></View>
            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: '#f9731620' }}><Text className="text-[10px] font-bold uppercase" style={{ color: '#f97316' }}>{myRole}</Text></View>
          </View>
          <Text className="text-base text-text-secondary mt-1 mb-8 leading-6">{trip.description || 'Enjoy your journey!'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <WebPill icon={Calendar} label="Duration" value={`${subData.itinerary.length} days`} />
            <WebPill icon={Users} label="Members" value={members.length} />
            <WebPill icon={DollarSign} label="Budget" value={`${trip.currency || '₹'} ${trip.totalBudget || 0}`} />
            <WebPill icon={Calendar} label="Dates" value={`${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`} />
          </ScrollView>
        </View>

        <View className="bg-surface border-b border-border" style={{ backgroundColor: THEME.surface }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row px-2">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setActiveTab(tab.id); }}
                className={`flex-row items-center px-4 py-4 border-b-2 ${activeTab === tab.id ? 'border-brand-500' : 'border-transparent'}`}
              >
                <tab.icon size={16} color={activeTab === tab.id ? THEME.brand : THEME.textSecondary} />
                <Text className={`ml-2 text-xs font-bold ${activeTab === tab.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 pt-6">
          {activeTab === 'itinerary' && <ItineraryTab data={subData.itinerary} canEdit={canEdit} currency={trip.currency === 'USD' ? '₹' : (trip.currency || '₹')} onAdd={(id) => { setSelectedDay(id); setModalType('activity'); setFormData({ category: 'activity', status: 'planned' }); }} onDelete={(id) => handleAction('DELETE', `/activities/${id}`)} />}
          {activeTab === 'members' && <MembersTab members={members} myRole={myRole} currentUserId={currentUser?._id} onInvite={() => { setModalType('member'); setFormData({ role: 'viewer' }); }} onChangeRole={(userId, role) => handleAction('PATCH', `/trips/${tripId}/members/${userId}/role`, { role })} onRemove={(userId) => handleAction('DELETE', `/trips/${tripId}/members/${userId}`)} />}
          {activeTab === 'checklist' && <ChecklistTab data={subData.checklists} canEdit={canEdit} onToggle={(id) => handleAction('PATCH', `/checklist-items/${id}/toggle`)} onAddItem={(clId, label) => handleAction('POST', `/checklists/${clId}/items`, { label })} onDeleteItem={(id) => handleAction('DELETE', `/checklist-items/${id}`)} onDeleteList={(id) => handleAction('DELETE', `/checklists/${id}`)} onCreateChecklist={() => { setModalType('checklist_create'); setFormData({ category: 'todo' }); }} />}
          {activeTab === 'reservations' && <ReservationsTab data={subData.reservations} canEdit={canEdit} onAdd={() => { setModalType('reservation'); setFormData({ type: 'hotel', status: 'pending' }); }} onDelete={(id) => handleAction('DELETE', `/reservations/${id}`)} />}
          {activeTab === 'budget' && <BudgetTab trip={trip} expenses={subData.expenses} canEdit={canEdit} onAdd={() => { setModalType('expense'); setFormData({ category: 'misc' }); }} onDelete={(id) => handleAction('DELETE', `/expenses/${id}`)} />}
        </View>
        <View className="h-24" />
      </ScrollView>

      {/* DETAILED ACTION MODALS */}
      <Modal visible={!!modalType} animationType="slide" transparent>
        <View className="flex-1 bg-black/70 justify-end">
          <TouchableOpacity activeOpacity={1} onPress={() => { setModalType(null); setFormData({}); }} className="flex-1" />
          <View className="bg-surface-2 p-6 rounded-t-3xl border-t border-border" style={{ backgroundColor: THEME.surface2, maxHeight: '85%' }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text variant="h2" style={{ color: THEME.textPrimary }}>Add {modalType}</Text>
              <TouchableOpacity onPress={() => { setModalType(null); setFormData({}); }}><X color={THEME.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {modalType === 'activity' && (
                <View>
                  <Input label="Title *" placeholder="Visit Eiffel Tower" onChangeText={t => setFormData({...formData, title: t})} />
                  <Text className="text-[10px] text-text-muted font-bold uppercase mb-2">Category</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {['transport', 'accommodation', 'food', 'activity', 'sightseeing', 'other'].map(c => (
                      <TouchableOpacity key={c} onPress={() => setFormData({...formData, category: c})} className={`px-3 py-1.5 rounded-full border ${formData.category === c ? 'bg-brand-500 border-brand-500' : 'bg-surface border-border'}`}><Text className={`text-[10px] font-bold ${formData.category === c ? 'text-white' : 'text-text-secondary'}`}>{c.toUpperCase()}</Text></TouchableOpacity>
                    ))}
                  </View>
                  <View className="flex-row gap-4"><View className="flex-1"><Input label="Time" placeholder="10:00 AM" onChangeText={t => setFormData({...formData, startTime: t})} /></View><View className="flex-1"><Input label="Location" placeholder="Address..." onChangeText={t => setFormData({...formData, location: t})} /></View></View>
                  <View className="flex-row gap-4"><View className="flex-1"><Input label="Cost" placeholder="0" keyboardType="numeric" onChangeText={t => setFormData({...formData, cost: Number(t)})} /></View><View className="flex-1"><Input label="Status" placeholder="planned" value={formData.status} onChangeText={t => setFormData({...formData, status: t})} /></View></View>
                  <Input label="Notes" placeholder="Some notes..." onChangeText={t => setFormData({...formData, notes: t})} multiline />
                  <Button title="Save Activity" onPress={() => handleAction('POST', `/days/${selectedDay}/activities`, formData)} className="mt-4" />
                </View>
              )}
              {modalType === 'expense' && (
                <View>
                  <Input label="Title *" placeholder="Hotel stay, Taxi, Dinner..." onChangeText={t => setFormData({...formData, title: t})} />
                  <View className="flex-row gap-4">
                    <View className="flex-1"><Input label="Amount *" placeholder="0" keyboardType="numeric" onChangeText={t => setFormData({...formData, amount: t})} /></View>
                    <View className="flex-1"><Input label="Currency" placeholder="INR" value="INR" editable={false} /></View>
                  </View>
                  <Text className="text-[10px] text-text-muted font-bold uppercase mb-2">Category</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {['transport', 'accommodation', 'food', 'entertainment', 'shopping', 'health', 'visa', 'misc'].map(c => {
                      const expCatColors = { transport: '#3b82f6', accommodation: '#8b5cf6', food: '#f59e0b', entertainment: '#ec4899', shopping: '#06b6d4', health: '#22c55e', visa: '#f97316', misc: '#6b7280' };
                      const isActive = formData.category === c;
                      return (
                        <TouchableOpacity key={c} onPress={() => setFormData({...formData, category: c})} className="px-3 py-1.5 rounded-xl border" style={{ backgroundColor: isActive ? expCatColors[c] + '20' : 'transparent', borderColor: isActive ? expCatColors[c] : THEME.border }}>
                          <Text className="text-[10px] font-bold" style={{ color: isActive ? expCatColors[c] : THEME.textSecondary }}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Input label="Notes" placeholder="Optional notes..." onChangeText={t => setFormData({...formData, notes: t})} multiline />
                  <Button title="Add Expense" onPress={() => handleAction('POST', `/trips/${tripId}/expenses`, { ...formData, amount: Number(formData.amount) })} className="mt-4" />
                </View>
              )}
              {modalType === 'reservation' && (
                <View>
                  <Text className="text-[10px] text-text-muted font-bold uppercase mb-2">Type</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {['flight', 'hotel', 'car', 'tour', 'restaurant', 'other'].map(t => {
                      const tColors = { flight: '#3b82f6', hotel: '#8b5cf6', car: '#f59e0b', tour: '#22c55e', restaurant: '#f97316', other: '#6b7280' };
                      const isActive = formData.type === t;
                      return (
                        <TouchableOpacity key={t} onPress={() => setFormData({...formData, type: t})} className="px-3 py-1.5 rounded-xl border" style={{ backgroundColor: isActive ? tColors[t] + '20' : 'transparent', borderColor: isActive ? tColors[t] : THEME.border }}>
                          <Text className="text-[10px] font-bold" style={{ color: isActive ? tColors[t] : THEME.textSecondary }}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Input label="Title *" placeholder="Hotel Hilton" onChangeText={t => setFormData({...formData, title: t})} />
                  <View className="flex-row gap-4"><View className="flex-1"><Input label="Vendor" placeholder="Booking.com" onChangeText={t => setFormData({...formData, vendor: t})} /></View><View className="flex-1"><Input label="Confirmation Code" placeholder="ABC123" onChangeText={t => setFormData({...formData, confirmationCode: t})} /></View></View>
                  <View className="flex-row gap-4"><View className="flex-1"><Input label="Check-in" placeholder="2025-06-15" onChangeText={t => setFormData({...formData, checkIn: t})} /></View><View className="flex-1"><Input label="Check-out" placeholder="2025-06-18" onChangeText={t => setFormData({...formData, checkOut: t})} /></View></View>
                  <View className="flex-row gap-4"><View className="flex-1"><Input label="Cost" placeholder="0" keyboardType="numeric" onChangeText={t => setFormData({...formData, cost: Number(t)})} /></View><View className="flex-1">
                    <Text className="text-[10px] text-text-muted font-bold uppercase mb-2">Status</Text>
                    <View className="flex-row gap-1">
                      {['pending', 'confirmed'].map(s => (<TouchableOpacity key={s} onPress={() => setFormData({...formData, status: s})} className={`px-2.5 py-1.5 rounded-lg border ${formData.status === s ? 'border-brand-500 bg-brand-500/10' : 'border-border'}`}><Text className={`text-[9px] font-bold ${formData.status === s ? 'text-brand-500' : 'text-text-muted'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text></TouchableOpacity>))}
                    </View>
                  </View></View>
                  <Input label="Notes" placeholder="Extra info..." onChangeText={t => setFormData({...formData, notes: t})} multiline />
                  <Button title="Save Reservation" onPress={() => handleAction('POST', `/trips/${tripId}/reservations`, { ...formData, cost: Number(formData.cost) || 0 })} className="mt-4" />
                </View>
              )}
              {modalType === 'member' && (
                <View>
                  <Input label="Email Address *" placeholder="friend@example.com" keyboardType="email-address" autoCapitalize="none" onChangeText={t => setFormData({...formData, email: t})} />
                  <Text className="text-[10px] text-text-muted font-bold uppercase mb-2 mt-4">Role</Text>
                  <View className="flex-row gap-2 mb-6">
                    {['viewer', 'editor'].map(r => (
                      <TouchableOpacity key={r} onPress={() => setFormData({...formData, role: r})} className={`flex-1 py-3 items-center rounded-xl border ${formData.role === r ? 'bg-brand-500 border-brand-500' : 'bg-surface border-border'}`}>
                        <View className="flex-row items-center">
                          {r === 'viewer' ? <Eye size={14} color={formData.role === r ? '#fff' : THEME.textSecondary} /> : <Edit3 size={14} color={formData.role === r ? '#fff' : THEME.textSecondary} />}
                          <Text className={`ml-2 text-xs font-bold ${formData.role === r ? 'text-white' : 'text-text-secondary'}`}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                        </View>
                        <Text className="text-[9px] text-text-muted mt-1">{r === 'viewer' ? 'Can view only' : 'Can edit content'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Button title="Invite Member" onPress={() => handleAction('POST', `/trips/${tripId}/members`, formData)} className="mt-2" />
                </View>
              )}
              {modalType === 'checklist_create' && (
                <View>
                  <Input label="Checklist Title *" placeholder="Packing List" onChangeText={t => setFormData({...formData, title: t})} />
                  <Text className="text-[10px] text-text-muted font-bold uppercase mb-2 mt-4">Category</Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {['packing', 'todo', 'documents', 'shopping', 'other'].map(c => {
                      const catColors = { packing: '#f97316', todo: '#3b82f6', documents: '#f59e0b', shopping: '#22c55e', other: '#6b7280' };
                      const isActive = formData.category === c;
                      return (
                        <TouchableOpacity key={c} onPress={() => setFormData({...formData, category: c})} className="px-4 py-2 rounded-xl border" style={{ backgroundColor: isActive ? catColors[c] + '20' : 'transparent', borderColor: isActive ? catColors[c] : THEME.border }}>
                          <Text className="text-[11px] font-bold" style={{ color: isActive ? catColors[c] : THEME.textSecondary }}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Button title="Create Checklist" onPress={() => handleAction('POST', `/trips/${tripId}/checklists`, formData)} className="mt-2" />
                </View>
              )}
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const WebPill = ({ icon: Icon, label, value }) => (
  <View className="bg-surface-2 flex-row items-center px-4 py-2.5 rounded-full border border-border mr-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
    <Icon size={14} color={THEME.textSecondary} />
    <Text className="ml-2 text-xs text-text-secondary">{label}: </Text>
    <Text className="text-xs font-bold text-white">{value}</Text>
  </View>
);

const ItineraryTab = ({ data, canEdit, currency, onAdd, onDelete }) => {
  const [expandedDays, setExpandedDays] = useState({});

  const toggleDay = (dayId) => {
    setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  return (
  <View>
    {data.map((day) => {
      const isExpanded = expandedDays[day._id] !== false; // default open
      return (
      <View key={day._id} className="mb-8">
        <TouchableOpacity onPress={() => toggleDay(day._id)} activeOpacity={0.7} className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-brand-500 w-8 h-8 rounded-lg items-center justify-center mr-3"><Text className="text-white font-bold text-xs">{day.dayNumber}</Text></View>
            <View><Text className="font-bold text-text-primary">Day {day.dayNumber}</Text><Text className="text-[10px] text-text-muted">{day.activities.length} activities</Text></View>
          </View>
          <View className="flex-row items-center">
            {canEdit && <TouchableOpacity onPress={() => onAdd(day._id)} style={{ marginRight: 8 }}><Plus size={20} color={THEME.brand} /></TouchableOpacity>}
            <ChevronDown size={16} color={THEME.textSecondary} style={{ transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }] }} />
          </View>
        </TouchableOpacity>

        {isExpanded && day.activities.map((act) => (
          <Card key={act._id} className="mb-4 p-4 border-l-4" style={{ borderLeftColor: CAT_COLORS[act.category] || THEME.brand }}>
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-base text-text-primary mr-2">{act.title}</Text>
                  <View className="bg-surface-300 px-2 py-0.5 rounded-full"><Text className="text-[8px] font-bold text-text-secondary uppercase">{act.status}</Text></View>
                </View>
                <Text className="text-[10px] text-brand-500 font-bold uppercase mt-1">{act.category}</Text>
              </View>
              {canEdit && <TouchableOpacity onPress={() => onDelete(act._id)}><Trash2 size={14} color={THEME.danger} /></TouchableOpacity>}
            </View>
            
            <View className="flex-row items-center flex-wrap mt-1">
              <View className="flex-row items-center mr-4">
                <Clock size={12} color={THEME.textMuted} />
                <Text className="text-xs text-text-secondary ml-1">{act.startTime || 'Flexible'}</Text>
              </View>
              {act.location && (
                <View className="flex-row items-center mr-4">
                  <MapPin size={12} color={THEME.textMuted} />
                  <Text className="text-xs text-text-secondary ml-1" numberOfLines={1}>{act.location}</Text>
                </View>
              )}
              {act.cost > 0 && (
                <View className="flex-row items-center">
                  <Text className="text-xs text-success font-bold">₹{act.cost}</Text>
                </View>
              )}
            </View>

            {act.notes && (
              <View className="mt-3 flex-row items-start bg-black/20 p-2 rounded-lg border border-border/50">
                <MessageSquare size={12} color={THEME.textMuted} style={{ marginTop: 2 }} />
                <Text className="text-[11px] text-text-secondary italic ml-2 flex-1">"{act.notes}"</Text>
              </View>
            )}
          </Card>
        ))}
      </View>
      );
    })}
  </View>
  );
};

const ROLE_BADGE_COLORS = { owner: '#f97316', editor: '#3b82f6', viewer: '#a3a3a3' };
const ROLE_ICONS_MAP = { owner: Crown, editor: Edit3, viewer: Eye };

const MembersTab = ({ members, myRole, currentUserId, onInvite, onChangeRole, onRemove }) => {
  const isOwner = myRole === 'owner';
  const [changingRole, setChangingRole] = useState(null);

  return (
    <View>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text variant="h3">Members ({members.length})</Text>
        {isOwner && (
          <TouchableOpacity onPress={onInvite} className="bg-brand-500 px-4 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Plus size={14} color="#fff" />
              <Text className="text-white text-xs font-bold ml-1">Add</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Member Cards */}
      {members.map((m) => {
        const isSelf = m.user._id === currentUserId;
        const RoleIcon = ROLE_ICONS_MAP[m.role] || Eye;
        const badgeColor = ROLE_BADGE_COLORS[m.role] || '#a3a3a3';

        return (
          <View key={m._id} className="bg-surface-100 border border-border rounded-2xl" style={{ padding: 12, marginBottom: 6 }}>
            <View className="flex-row items-center">
              {/* Avatar */}
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${badgeColor}20`, borderWidth: 1, borderColor: `${badgeColor}40` }}>
                <Text className="font-bold text-sm" style={{ color: badgeColor }}>{m.user.name?.charAt(0).toUpperCase()}</Text>
              </View>

              {/* Name + Email */}
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-sm text-text-primary">{m.user.name}</Text>
                  {isSelf && <View className="bg-brand-500/10 px-2 py-0.5 rounded ml-2"><Text className="text-brand-500 text-[8px] font-bold">(you)</Text></View>}
                </View>
                <Text className="text-[11px] text-text-secondary mt-0.5">{m.user.email}</Text>
              </View>

              {/* Role Badge */}
              <View className="px-2.5 py-1 rounded-full flex-row items-center" style={{ backgroundColor: `${badgeColor}15`, borderWidth: 1, borderColor: `${badgeColor}30` }}>
                <RoleIcon size={11} color={badgeColor} />
                <Text className="ml-1 text-[9px] font-bold uppercase" style={{ color: badgeColor }}>{m.role}</Text>
              </View>
            </View>

            {/* Owner Actions: Change Role + Remove */}
            {isOwner && !isSelf && m.role !== 'owner' && (
              <View className="flex-row items-center border-t border-border" style={{ marginTop: 10, paddingTop: 10 }}>
                {/* Role Toggle */}
                <View className="flex-1 flex-row gap-2">
                  {['editor', 'viewer'].map(r => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => onChangeRole(m.user._id, r)}
                      className={`px-3 py-1.5 rounded-lg border ${m.role === r ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-surface'}`}
                    >
                      <Text className={`text-[10px] font-bold ${m.role === r ? 'text-brand-500' : 'text-text-muted'}`}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Remove Button */}
                <TouchableOpacity
                  onPress={() => Alert.alert('Remove Member', `Remove ${m.user.name} from trip?`, [{ text: 'Cancel' }, { text: 'Remove', style: 'destructive', onPress: () => onRemove(m.user._id) }])}
                  className="bg-danger/10 px-3 py-1.5 rounded-lg border border-danger/20 flex-row items-center"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}
                >
                  <UserX size={13} color={THEME.danger} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {/* Role Permissions Info */}
      <View className="bg-surface-100 border border-border rounded-2xl" style={{ marginTop: 8, padding: 16 }}>
        <View className="flex-row items-center mb-4">
          <Shield size={16} color={THEME.textSecondary} />
          <Text className="ml-2 font-bold text-sm text-text-primary">Role Permissions</Text>
        </View>
        {[
          { role: 'owner', icon: Crown, color: '#f97316', perms: 'Manage everything, Delete trip, Change roles' },
          { role: 'editor', icon: Edit3, color: '#3b82f6', perms: 'Edit itinerary, Manage checklists, Add expenses' },
          { role: 'viewer', icon: Eye, color: '#a3a3a3', perms: 'View all content, Add comments' },
        ].map(r => (
          <View key={r.role} className="flex-row items-start mb-3">
            <View className="w-6 h-6 rounded-full items-center justify-center mt-0.5" style={{ backgroundColor: `${r.color}15` }}>
              <r.icon size={12} color={r.color} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-xs font-bold uppercase" style={{ color: r.color }}>{r.role}</Text>
              <Text className="text-[10px] text-text-muted mt-0.5">{r.perms}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const CL_CAT_COLORS = { packing: '#f97316', todo: '#3b82f6', documents: '#f59e0b', shopping: '#22c55e', other: '#6b7280' };

const ChecklistTab = ({ data, onToggle, canEdit, onAddItem, onDeleteItem, onDeleteList, onCreateChecklist }) => (
  <View>
    {/* Header */}
    <View className="flex-row justify-between items-center mb-6">
      <Text variant="h3">Checklists ({data.length})</Text>
      {canEdit && (
        <TouchableOpacity onPress={onCreateChecklist} className="bg-brand-500 px-4 py-2 rounded-xl">
          <View className="flex-row items-center">
            <Plus size={14} color="#fff" />
            <Text className="text-white text-xs font-bold ml-1">New</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>

    {data.length === 0 && (
      <View className="items-center py-10">
        <CheckSquare size={32} color={THEME.textMuted} />
        <Text className="text-text-muted text-sm mt-3">No checklists yet</Text>
      </View>
    )}

    {data.map((cl) => {
      const completed = cl.items?.filter(i => i.isCompleted).length || 0;
      const total = cl.items?.length || 0;
      const pct = total ? Math.round((completed / total) * 100) : 0;
      const catColor = CL_CAT_COLORS[cl.category] || '#6b7280';

      return (
        <View key={cl._id} className="bg-surface-100 border border-border rounded-2xl overflow-hidden" style={{ marginBottom: 10 }}>
          {/* Card Header */}
          <View style={{ padding: 14 }}>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <View className="px-2 py-0.5 rounded-full mr-2" style={{ backgroundColor: catColor + '20', borderWidth: 1, borderColor: catColor + '40' }}>
                  <Text className="text-[9px] font-bold uppercase" style={{ color: catColor }}>{cl.category || 'other'}</Text>
                </View>
                <Text className="font-bold text-sm text-text-primary" numberOfLines={1}>{cl.title}</Text>
              </View>
              {canEdit && <TouchableOpacity onPress={() => onDeleteList(cl._id)} style={{ padding: 4 }}><Trash2 size={14} color={THEME.danger} /></TouchableOpacity>}
            </View>

            {/* Progress Bar */}
            {total > 0 && (
              <View className="mt-3">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[10px] text-text-muted">{completed}/{total} done</Text>
                  <Text className="text-[10px] font-bold" style={{ color: pct === 100 ? THEME.success : THEME.textSecondary }}>{pct}%</Text>
                </View>
                <View className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? THEME.success : THEME.brand }} />
                </View>
              </View>
            )}
          </View>

          {/* Items */}
          {cl.items?.map((item) => (
            <View key={item._id} className="flex-row items-center border-t border-border" style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
              <TouchableOpacity onPress={() => onToggle(item._id)} className="flex-row items-center flex-1">
                {item.isCompleted ? <CheckCircle2 size={18} color={THEME.success} /> : <Circle size={18} color={THEME.textMuted} />}
                <Text className={`ml-3 text-xs flex-1 ${item.isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}`}>{item.label}</Text>
              </TouchableOpacity>
              {canEdit && <TouchableOpacity onPress={() => onDeleteItem(item._id)} style={{ padding: 4 }}><Trash2 size={12} color={THEME.danger} /></TouchableOpacity>}
            </View>
          ))}

          {/* Add Item Input */}
          {canEdit && (
            <View className="border-t border-border" style={{ padding: 10, backgroundColor: THEME.surface2 }}>
              <TextInput
                className="text-xs text-text-primary"
                placeholder="Add item & press Enter..."
                placeholderTextColor={THEME.textMuted}
                onSubmitEditing={(e) => { if (e.nativeEvent.text.trim()) { onAddItem(cl._id, e.nativeEvent.text); e.target.clear(); } }}
              />
            </View>
          )}
        </View>
      );
    })}
  </View>
);

const RES_TYPE_COLORS = { flight: '#3b82f6', hotel: '#8b5cf6', car: '#f59e0b', tour: '#22c55e', restaurant: '#f97316', other: '#6b7280' };
const RES_STATUS_COLORS = { pending: '#f59e0b', confirmed: '#22c55e', cancelled: '#ef4444', completed: '#a3a3a3' };

const ReservationsTab = ({ data, canEdit, onAdd, onDelete }) => {
  const [filterType, setFilterType] = useState('');
  const filtered = filterType ? data.filter(r => r.type === filterType) : data;

  return (
    <View>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text variant="h3">Reservations ({data.length})</Text>
        {canEdit && (
          <TouchableOpacity onPress={onAdd} className="bg-brand-500 px-4 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Plus size={14} color="#fff" />
              <Text className="text-white text-xs font-bold ml-1">Add</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {['', 'flight', 'hotel', 'car', 'tour', 'restaurant', 'other'].map(t => (
          <TouchableOpacity key={t} onPress={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg border mr-2 ${filterType === t ? 'border-brand-500 bg-brand-500/10' : 'border-border'}`}>
            <Text className={`text-[10px] font-bold ${filterType === t ? 'text-brand-500' : 'text-text-secondary'}`}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 && (
        <View className="items-center py-10">
          <MapPin size={32} color={THEME.textMuted} />
          <Text className="text-text-muted text-sm mt-3">No reservations yet</Text>
        </View>
      )}

      {/* Reservation Cards */}
      {filtered.map((res) => {
        const Icon = RES_TYPE_ICONS[res.type] || Package;
        const typeColor = RES_TYPE_COLORS[res.type] || '#6b7280';
        const statusColor = RES_STATUS_COLORS[res.status] || '#a3a3a3';

        return (
          <View key={res._id} className="bg-surface-100 border border-border rounded-2xl" style={{ padding: 14, marginBottom: 8 }}>
            <View className="flex-row items-start">
              {/* Type Icon */}
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: typeColor + '20' }}>
                <Icon size={18} color={typeColor} />
              </View>

              {/* Info */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-sm text-text-primary flex-1" numberOfLines={1}>{res.title}</Text>
                  <View className="px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: statusColor + '20', borderWidth: 1, borderColor: statusColor + '40' }}>
                    <Text className="text-[8px] font-bold uppercase" style={{ color: statusColor }}>{res.status}</Text>
                  </View>
                </View>

                {/* Metadata Row */}
                <View className="flex-row flex-wrap items-center mt-2 gap-x-3 gap-y-1">
                  {res.vendor && <Text className="text-[10px] text-text-secondary">🏢 {res.vendor}</Text>}
                  {res.confirmationCode && <Text className="text-[10px] text-text-secondary">🎫 {res.confirmationCode}</Text>}
                  {res.checkIn && <Text className="text-[10px] text-text-secondary">📅 {new Date(res.checkIn).toLocaleDateString()}</Text>}
                  {res.checkOut && <Text className="text-[10px] text-text-secondary">→ {new Date(res.checkOut).toLocaleDateString()}</Text>}
                  {res.cost > 0 && <Text className="text-[10px] font-bold" style={{ color: THEME.success }}>₹{res.cost.toLocaleString()}</Text>}
                </View>

                {res.notes && <Text className="text-[10px] text-text-muted italic mt-2">{res.notes}</Text>}
              </View>

              {/* Delete */}
              {canEdit && <TouchableOpacity onPress={() => onDelete(res._id)} style={{ padding: 4, marginLeft: 6 }}><Trash2 size={14} color={THEME.danger} /></TouchableOpacity>}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const EXP_CAT_COLORS = { transport: '#3b82f6', accommodation: '#8b5cf6', food: '#f59e0b', entertainment: '#ec4899', shopping: '#06b6d4', health: '#22c55e', visa: '#f97316', misc: '#6b7280' };

const BudgetTab = ({ trip, expenses, canEdit, onAdd, onDelete }) => {
  const spent = expenses.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalBudget = trip.totalBudget || 0;
  const remaining = totalBudget - spent;
  const pct = totalBudget ? Math.min(Math.round((spent / totalBudget) * 100), 100) : 0;
  const progressColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : THEME.success;
  const [showCharts, setShowCharts] = useState(false);

  return (
    <View>
      {/* 3 Summary Cards */}
      <View className="flex-row gap-2 mb-5">
        {[
          { label: 'Budget', value: `₹${totalBudget.toLocaleString()}`, color: THEME.brand, icon: Wallet },
          { label: 'Spent', value: `₹${spent.toLocaleString()}`, color: '#f59e0b', icon: Tag },
          { label: 'Left', value: `₹${remaining.toLocaleString()}`, color: remaining >= 0 ? THEME.success : '#ef4444', icon: DollarSign },
        ].map(({ label, value, color, icon: Icon }) => (
          <View key={label} className="flex-1 bg-surface-100 border border-border rounded-2xl" style={{ padding: 12 }}>
            <View className="w-7 h-7 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: color + '20' }}>
              <Icon size={14} color={color} />
            </View>
            <Text className="font-bold text-sm" style={{ color }}>{value}</Text>
            <Text className="text-[9px] text-text-muted font-bold uppercase mt-0.5">{label}</Text>
          </View>
        ))}
      </View>

      {/* Progress Bar */}
      {totalBudget > 0 && (
        <View className="bg-surface-100 border border-border rounded-2xl" style={{ padding: 12, marginBottom: 16 }}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[10px] text-text-muted">Budget Usage</Text>
            <Text className="text-[10px] font-bold" style={{ color: progressColor }}>{pct}% used</Text>
          </View>
          <View className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: progressColor }} />
          </View>
        </View>
      )}

      {/* Analytics Toggle Button */}
      {expenses.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowCharts(!showCharts)}
          className="bg-surface-100 border border-border rounded-2xl flex-row items-center justify-center" style={{ padding: 12, marginBottom: 12 }}
        >
          <BarChart2 size={16} color={showCharts ? THEME.brand : THEME.textSecondary} />
          <Text className={`ml-2 text-xs font-bold ${showCharts ? 'text-brand-500' : 'text-text-secondary'}`}>{showCharts ? 'Hide Analytics' : 'View Analytics'}</Text>
          <ChevronDown size={14} color={showCharts ? THEME.brand : THEME.textSecondary} style={{ marginLeft: 4, transform: [{ rotate: showCharts ? '180deg' : '0deg' }] }} />
        </TouchableOpacity>
      )}

      {/* Charts: Pie + Bar */}
      {showCharts && expenses.length > 0 && (() => {
        const byCategory = {};
        expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0); });
        const catEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
        const screenW = Dimensions.get('window').width - 80;

        const pieData = catEntries.map(([cat, amount]) => ({
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          population: amount,
          color: EXP_CAT_COLORS[cat] || '#6b7280',
          legendFontColor: '#a3a3a3',
          legendFontSize: 10,
        }));

        const barData = {
          labels: catEntries.map(([c]) => c.charAt(0).toUpperCase() + c.slice(1, 5)),
          datasets: [{ data: catEntries.map(([, a]) => a) }],
        };

        const chartConfig = {
          backgroundGradientFrom: '#1a1a1a',
          backgroundGradientTo: '#1a1a1a',
          color: (opacity = 1) => `rgba(255, 140, 50, ${opacity})`,
          labelColor: () => '#a3a3a3',
          barPercentage: 0.6,
          decimalPlaces: 0,
          propsForBackgroundLines: { stroke: '#2e2e2e' },
        };

        return (
          <View>
            {/* Pie Chart */}
            <View className="bg-surface-100 border border-border rounded-2xl" style={{ padding: 14, marginBottom: 10 }}>
              <Text className="font-bold text-sm text-text-primary mb-3">Spending by Category</Text>
              <PieChart
                data={pieData}
                width={screenW}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
            </View>

            {/* Bar Chart */}
            <View className="bg-surface-100 border border-border rounded-2xl" style={{ padding: 14, marginBottom: 16 }}>
              <Text className="font-bold text-sm text-text-primary mb-3">Category Breakdown</Text>
              <BarChart
                data={barData}
                width={screenW}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 140, 50, ${opacity})`,
                }}
                fromZero
                showBarTops={false}
                style={{ borderRadius: 12 }}
              />
            </View>
          </View>
        );
      })()}

      {/* Expense Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text variant="h3">Expenses ({expenses.length})</Text>
        {canEdit && (
          <TouchableOpacity onPress={onAdd} className="bg-brand-500 px-4 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Plus size={14} color="#fff" />
              <Text className="text-white text-xs font-bold ml-1">Add</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {expenses.length === 0 && (
        <View className="items-center py-10">
          <Wallet size={32} color={THEME.textMuted} />
          <Text className="text-text-muted text-sm mt-3">No expenses yet</Text>
        </View>
      )}

      {/* Expense List */}
      {expenses.map((exp) => {
        const catColor = EXP_CAT_COLORS[exp.category] || '#6b7280';
        return (
          <View key={exp._id} className="bg-surface-100 border border-border rounded-2xl flex-row items-center" style={{ padding: 12, marginBottom: 6 }}>
            {/* Category Dot */}
            <View className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: catColor }} />

            {/* Info */}
            <View className="flex-1">
              <Text className="font-bold text-sm text-text-primary">{exp.title}</Text>
              <Text className="text-[10px] text-text-muted mt-0.5">
                {exp.category}{exp.paidBy?.name ? ` · ${exp.paidBy.name}` : ''}{exp.date ? ` · ${new Date(exp.date).toLocaleDateString()}` : ''}
                {exp.notes ? ` · ${exp.notes}` : ''}
              </Text>
            </View>

            {/* Amount */}
            <Text className="font-bold text-sm mr-2" style={{ color: THEME.brand }}>₹{exp.amount?.toLocaleString()}</Text>

            {/* Delete */}
            {canEdit && <TouchableOpacity onPress={() => onDelete(exp._id)} style={{ padding: 4 }}><Trash2 size={13} color={THEME.danger} /></TouchableOpacity>}
          </View>
        );
      })}
    </View>
  );
};
