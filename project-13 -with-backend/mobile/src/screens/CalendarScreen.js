import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
  Image,
  Animated,
  ActivityIndicator,
  Platform,
  Modal,
  PanResponder,
  Alert,
} from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Map as MapIcon,
  AlignLeft,
  Users,
  Clock,
  Layers,
  Crosshair,
  X,
  Briefcase,
  Plane,
  Globe,
} from 'lucide-react-native';
import Svg, { Path, Circle, Line, Polygon, Text as SvgText, G } from 'react-native-svg';
import client, { getImageUri } from '../api/client';
import { getDynamicTripStatus, getDestinationImage } from './DashboardScreen';
import { useNavigation } from '@react-navigation/native';

// Screen width is now resolved dynamically inside each component via useWindowDimensions()

const THEME = {
  bg: '#0d0d0d',
  surface: '#111111',
  card: '#171717',
  card2: '#1a1a1a',
  border: '#222222',
  border2: '#2e2e2e',
  brand: '#ec9006',
  brandDim: 'rgba(236, 144, 6,0.15)',
  brandGlow: 'rgba(236, 144, 6,0.08)',
  text: '#f5f5f5',
  textSec: '#a3a3a3',
  textMuted: '#525252',
  success: '#22c55e',
  successDim: 'rgba(34,197,94,0.15)',
  warning: '#f59e0b',
  warningDim: 'rgba(245,158,11,0.15)',
  info: '#3b82f6',
  infoDim: 'rgba(59,130,246,0.15)',
  purple: '#8b5cf6',
  purpleDim: 'rgba(139,92,246,0.15)',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAYS_SHORT = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

// ─── Color palette for timeline bars ────────────────────────────────────────
const BAR_COLORS = [
  '#ec9006', '#8b5cf6', '#a16207', '#0891b2', '#16a34a', '#dc2626', '#7c3aed',
];

const getBarColor = (str, idx) => BAR_COLORS[idx % BAR_COLORS.length];

// ─── Status helpers ──────────────────────────────────────────────────────────
const STATUS_DOT = {
  planning:  THEME.brand,
  upcoming:  THEME.brand,
  ongoing:   THEME.warning,
  completed: THEME.success,
};

const STATUS_LABEL_COLOR = {
  planning:  { bg: '#ec900618', text: '#ec9006' },
  upcoming:  { bg: '#ec900618', text: '#ec9006' },
  ongoing:   { bg: '#22c55e18', text: '#22c55e' },
  completed: { bg: '#a3a3a318', text: '#a3a3a3' },
};

// ─── Date util ──────────────────────────────────────────────────────────────
const toLocal = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const sameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDateRange = (start, end) => {
  const s = toLocal(start);
  const e = toLocal(end);
  if (!s || !e) return '';
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-IN', opts)}`;
};

const daysLeft = (startDate) => {
  const s = toLocal(startDate);
  if (!s) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((s - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const tripDuration = (start, end) => {
  const s = toLocal(start);
  const e = toLocal(end);
  if (!s || !e) return 0;
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

// ─── Avatar stack ────────────────────────────────────────────────────────────
const AvatarStack = ({ count = 3, size = 22 }) => {
  const colors = ['#ec9006','#8b5cf6','#3b82f6','#22c55e','#ec4899'];
  const initials = ['H','A','R','K','S'];
  const shown = Math.min(count, 4);
  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: shown }).map((_, i) => (
        <View
          key={i}
          style={{
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: colors[i % colors.length],
            borderWidth: 1.5, borderColor: THEME.card,
            marginLeft: i > 0 ? -size * 0.35 : 0,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 7, fontWeight: '900' }}>
            {initials[i]}
          </Text>
        </View>
      ))}
      {count > 4 && (
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: THEME.brandDim, borderWidth: 1.5,
          borderColor: THEME.brand, marginLeft: -size * 0.35,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: THEME.brand, fontSize: 7, fontWeight: '900' }}>
            +{count - 4}
          </Text>
        </View>
      )}
    </View>
  );
};

// ─── Trip image card thumbnail ───────────────────────────────────────────────
const TripThumb = ({ trip, size = 72, radius = 14 }) => (
  <Image
    source={{ uri: getImageUri(trip.coverImage || getDestinationImage(trip.destination)) }}
    style={{ width: size, height: size, borderRadius: radius }}
    resizeMode="cover"
  />
);

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — CALENDAR VIEW
// ════════════════════════════════════════════════════════════════════════════
function CalendarTab({ trips, navigation }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDateTrips, setSelectedDateTrips] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateText, setSelectedDateText] = useState('');
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 15;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 40) {
          prevMonth();
        } else if (gestureState.dx < -40) {
          nextMonth();
        }
      },
    })
  ).current;

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  // prev month padding
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, current: false, date: new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, daysInPrev - i) });
  // current month
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true, date: new Date(year, month, d) });
  // next month padding
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)
    cells.push({ day: d, current: false, date: new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, d) });

  // Map trip starts to dates
  const tripMap = {};
  trips.forEach(t => {
    const s = toLocal(t.startDate);
    if (!s) return;
    const key = `${s.getFullYear()}-${s.getMonth()}-${s.getDate()}`;
    if (!tripMap[key]) tripMap[key] = [];
    tripMap[key].push(t);
  });

  const getCellTrips = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return tripMap[key] || [];
  };

  const isToday = (date) => sameDay(date, today);
  const { width: screenW } = useWindowDimensions();
  const CELL_W = (screenW - 32) / 7;

  // Upcoming trips (upcoming + ongoing)
  const upcomingTrips = trips
    .filter(t => {
      const status = getDynamicTripStatus(t.startDate, t.endDate);
      return status === 'upcoming' || status === 'planning';
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Month Navigator */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
          <ChevronLeft size={20} color={THEME.textSec} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: THEME.text, fontSize: 18, fontWeight: '800' }}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity
            onPress={goToday}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.brandDim, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: THEME.brand + '40' }}
          >
            <CalendarIcon size={11} color={THEME.brand} />
            <Text style={{ color: THEME.brand, fontSize: 10, fontWeight: '800', marginLeft: 4 }}>Today</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}>
          <ChevronRight size={20} color={THEME.textSec} />
        </TouchableOpacity>
      </View>

      {/* Weekday header */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4 }}>
        {DAYS_SHORT.map(d => (
          <View key={d} style={{ width: CELL_W, alignItems: 'center' }}>
            <Text style={{ color: THEME.textMuted, fontSize: 10, fontWeight: '700' }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View {...panResponder.panHandlers} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {Array.from({ length: 6 }).map((_, row) => (
          <View key={row} style={{ flexDirection: 'row', marginBottom: 2 }}>
            {cells.slice(row * 7, row * 7 + 7).map((cell, col) => {
              const cellTrips = getCellTrips(cell.date);
              const todayCell = isToday(cell.date);
              const tripForDot = cellTrips[0];
              const status = tripForDot ? getDynamicTripStatus(tripForDot.startDate, tripForDot.endDate) : null;
              const dotColor = status ? STATUS_DOT[status] : THEME.brand;

              return (
                <TouchableOpacity
                  key={col}
                  style={{ width: CELL_W, alignItems: 'center', paddingVertical: 6 }}
                  onPress={() => {
                    if (cellTrips.length === 1) {
                      navigation.navigate('TripDetail', { tripId: cellTrips[0]._id });
                    } else if (cellTrips.length > 1) {
                      setSelectedDateTrips(cellTrips);
                      setSelectedDateText(cell.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));
                      setModalVisible(true);
                    }
                  }}
                  activeOpacity={cellTrips.length > 0 ? 0.7 : 1}
                >
                  {/* Day number circle */}
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: todayCell ? THEME.brand : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                    marginBottom: 2,
                  }}>
                    <Text style={{
                      color: todayCell ? '#fff' : cell.current ? THEME.text : THEME.textMuted,
                      fontSize: 13,
                      fontWeight: todayCell || cellTrips.length > 0 ? '800' : '500',
                    }}>
                      {cell.day}
                    </Text>
                  </View>

                  {/* Trip name label or multiple trips indicator */}
                  {cellTrips.length > 0 && !todayCell && (
                    <View style={{
                      backgroundColor: cellTrips.length > 1 ? THEME.purple + '20' : dotColor + '20',
                      borderRadius: 8, paddingHorizontal: 3, paddingVertical: 1.5,
                      maxWidth: CELL_W - 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                      {cellTrips.length > 1 && (
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: THEME.purple }} />
                      )}
                      <Text
                        numberOfLines={1}
                        style={{ color: cellTrips.length > 1 ? THEME.purple : dotColor, fontSize: 7, fontWeight: '800', textAlign: 'center' }}
                      >
                        {cellTrips.length > 1 
                          ? `${cellTrips.length} Trips` 
                          : (tripForDot.destination?.split(',')[0]?.slice(0, 6) || tripForDot.title?.slice(0, 6))}
                      </Text>
                    </View>
                  )}

                  {/* Dot indicator for multi-day trips (mid-day dots) */}
                  {!tripForDot && (() => {
                    const midDayTrip = trips.find(t => {
                      const s = toLocal(t.startDate);
                      const e = toLocal(t.endDate);
                      return s && e && cell.date > s && cell.date < e;
                    });
                    if (midDayTrip) {
                      const status = getDynamicTripStatus(midDayTrip.startDate, midDayTrip.endDate);
                      const dotColor = STATUS_DOT[status] || THEME.brand;
                      return <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: dotColor, marginTop: 1 }} />;
                    }
                    return null;
                  })()}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Status legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 20, paddingHorizontal: 16 }}>
        {[['Upcoming', THEME.brand], ['Ongoing', THEME.warning], ['Completed', THEME.success]].map(([label, color]) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            <Text style={{ color: THEME.textSec, fontSize: 11, fontWeight: '600' }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Trips Section */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: THEME.text, fontSize: 16, fontWeight: '800' }}>Upcoming Trips</Text>
          <TouchableOpacity onPress={() => setShowAllUpcoming(!showAllUpcoming)}>
            <Text style={{ color: THEME.brand, fontSize: 12, fontWeight: '700' }}>
              {showAllUpcoming ? 'Show Less' : 'View All'}
            </Text>
          </TouchableOpacity>
        </View>

        {upcomingTrips.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32, backgroundColor: THEME.card, borderRadius: 20, borderWidth: 1, borderColor: THEME.border }}>
            <CalendarIcon size={36} color={THEME.textMuted} />
            <Text style={{ color: THEME.textMuted, fontSize: 13, marginTop: 12, fontWeight: '600' }}>No upcoming trips</Text>
          </View>
        ) : (
          (showAllUpcoming ? upcomingTrips : upcomingTrips.slice(0, 3)).map((trip, idx) => {
            const dl = daysLeft(trip.startDate);
            const status = getDynamicTripStatus(trip.startDate, trip.endDate);
            const sc = STATUS_LABEL_COLOR[status] || STATUS_LABEL_COLOR.upcoming;
            return (
              <TouchableOpacity
                key={trip._id}
                onPress={() => navigation.navigate('TripDetail', { tripId: trip._id })}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: THEME.card, borderRadius: 20, padding: 12,
                  marginBottom: 10, borderWidth: 1, borderColor: THEME.border,
                }}
              >
                {/* Thumbnail */}
                <TripThumb trip={trip} size={68} radius={12} />

                {/* Info */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text numberOfLines={1} style={{ color: THEME.text, fontSize: 14, fontWeight: '800', flex: 1, marginRight: 8 }}>
                      {trip.title}
                    </Text>
                    <View style={{ backgroundColor: sc.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                      <Text style={{ color: sc.text, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>{status}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 }}>
                    <CalendarIcon size={11} color={THEME.textMuted} />
                    <Text style={{ color: THEME.textSec, fontSize: 10, fontWeight: '600' }}>
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AvatarStack count={trip.memberCount || 3} size={20} />
                    {dl !== null && dl >= 0 && (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: THEME.brand, fontSize: 20, fontWeight: '900', lineHeight: 22 }}>
                          {dl.toString().padStart(2, '0')}
                        </Text>
                        <Text style={{ color: THEME.textMuted, fontSize: 8, fontWeight: '700' }}>Days Left</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
      <View style={{ height: 100 }} />
      
      {/* Multiple Trips Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.75)',
          justifyContent: 'flex-end',
        }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1 }}
            onPress={() => setModalVisible(false)}
          />
          <View style={{
            backgroundColor: THEME.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 16,
            paddingHorizontal: 20,
            paddingBottom: Platform.OS === 'ios' ? 120 : 110,
            borderTopWidth: 1,
            borderColor: THEME.border,
            maxHeight: '75%',
          }}>
            {/* Header indicator bar */}
            <View style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: THEME.border2,
              alignSelf: 'center',
              marginBottom: 16,
            }} />

            {/* Title block */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <View>
                <Text style={{ color: THEME.text, fontSize: 18, fontWeight: '900' }}>
                  Multiple Trips
                </Text>
                <Text style={{ color: THEME.textSec, fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                  {selectedDateText}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: THEME.card2,
                  borderWidth: 1,
                  borderColor: THEME.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color={THEME.textSec} />
              </TouchableOpacity>
            </View>

            {/* List of trips */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedDateTrips.map((trip, idx) => {
                const status = getDynamicTripStatus(trip.startDate, trip.endDate);
                const sc = STATUS_LABEL_COLOR[status] || STATUS_LABEL_COLOR.upcoming;
                return (
                  <TouchableOpacity
                    key={trip._id}
                    activeOpacity={0.85}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('TripDetail', { tripId: trip._id });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: THEME.card2,
                      borderRadius: 18,
                      padding: 12,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: THEME.border,
                    }}
                  >
                    {/* Thumbnail */}
                    <TripThumb trip={trip} size={60} radius={10} />

                    {/* Details */}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text numberOfLines={1} style={{ color: THEME.text, fontSize: 14, fontWeight: '800', flex: 1, marginRight: 8 }}>
                          {trip.title}
                        </Text>
                        <View style={{ backgroundColor: sc.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 }}>
                          <Text style={{ color: sc.text, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' }}>
                            {status}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 }}>
                        <CalendarIcon size={10} color={THEME.textMuted} />
                        <Text style={{ color: THEME.textSec, fontSize: 10, fontWeight: '600' }}>
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Users size={10} color={THEME.textMuted} />
                          <Text style={{ color: THEME.textSec, fontSize: 10, fontWeight: '600' }}>
                            {trip.memberCount || 1} Travelers
                          </Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={16} color={THEME.textMuted} style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2 — TIMELINE / GANTT VIEW
// ════════════════════════════════════════════════════════════════════════════
function TimelineTab({ trips, navigation }) {
  const today = new Date();
  const scrubberRef = useRef(null);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedStoryTrip, setSelectedStoryTrip] = useState(null);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const DAY_W = 32;
  const TOTAL_W = daysInMonth * DAY_W;
  const { width: screenW } = useWindowDimensions();

  useEffect(() => {
    if (scrubberRef.current) {
      if (today.getMonth() === viewMonth && today.getFullYear() === viewYear) {
        const todayX = (today.getDate() - 1) * DAY_W;
        const scrollX = Math.max(0, todayX - screenW / 2 + DAY_W / 2);
        setTimeout(() => {
          scrubberRef.current?.scrollTo({ x: scrollX, animated: true });
        }, 150);
      } else {
        setTimeout(() => {
          scrubberRef.current?.scrollTo({ x: 0, animated: true });
        }, 150);
      }
    }
  }, [viewMonth, viewYear, screenW]);

  // Sort trips for stories (Ongoing -> Upcoming -> Completed)
  const stories = [...trips].sort((a, b) => {
    const statusA = getDynamicTripStatus(a.startDate, a.endDate);
    const statusB = getDynamicTripStatus(b.startDate, b.endDate);
    const wA = statusA === 'ongoing' ? 0 : (statusA === 'upcoming' || statusA === 'planning' ? 1 : 2);
    const wB = statusB === 'ongoing' ? 0 : (statusB === 'upcoming' || statusB === 'planning' ? 1 : 2);
    if (wA !== wB) return wA - wB;
    return new Date(a.startDate) - new Date(b.startDate);
  });

  // Filter trips visible in this month
  const monthStart = new Date(viewYear, viewMonth, 1);
  const monthEnd = new Date(viewYear, viewMonth + 1, 0);

  const visibleTrips = trips.filter(t => {
    const s = toLocal(t.startDate);
    const e = toLocal(t.endDate);
    return s && e && s <= monthEnd && e >= monthStart;
  });

  const getBarStyle = (trip, idx) => {
    const s = toLocal(trip.startDate);
    const e = toLocal(trip.endDate);
    if (!s || !e) return null;
    const clampStart = s < monthStart ? monthStart : s;
    const clampEnd = e > monthEnd ? monthEnd : e;
    const startDay = clampStart.getDate() - 1;
    const days = Math.ceil((clampEnd - clampStart) / (1000 * 60 * 60 * 24)) + 1;
    return { left: startDay * DAY_W, width: days * DAY_W - 4 };
  };

  const todayCol = today.getMonth() === viewMonth && today.getFullYear() === viewYear
    ? (today.getDate() - 1) * DAY_W + DAY_W / 2 : -1;

  // Free gaps between trips (needs chronological order)
  const chronologicalTrips = [...trips].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  let freeGap = null;
  for (let i = 0; i < chronologicalTrips.length - 1; i++) {
    const e = toLocal(chronologicalTrips[i].endDate);
    const s = toLocal(chronologicalTrips[i + 1].startDate);
    if (e && s) {
      const gapDays = Math.ceil((s - e) / (1000 * 60 * 60 * 24)) - 1;
      if (gapDays >= 2) {
        const gapStart = new Date(e); gapStart.setDate(gapStart.getDate() + 1);
        const gapEnd = new Date(s); gapEnd.setDate(gapEnd.getDate() - 1);
        freeGap = { start: gapStart, end: gapEnd, days: gapDays };
        break;
      }
    }
  }

  // Display trips in descending order (Planning -> Ongoing -> Completed)
  const sortedTrips = [...trips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Instagram-Style Trip Stories */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: THEME.text, fontSize: 18, fontWeight: '900', paddingHorizontal: 16, marginBottom: 16 }}>
          Your Stories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {stories.map(trip => {
            const status = getDynamicTripStatus(trip.startDate, trip.endDate);
            let ringColor = THEME.border; // past trips
            if (status === 'ongoing') ringColor = THEME.success; // Green for ongoing
            else if (status === 'upcoming' || status === 'planning') ringColor = THEME.info; // Blue for upcoming

            return (
              <TouchableOpacity
                key={trip._id}
                activeOpacity={0.8}
                onPress={() => setSelectedStoryTrip(trip)}
                style={{ alignItems: 'center', marginRight: 18 }}
              >
                <View style={{
                  width: 74, height: 74, borderRadius: 37,
                  borderWidth: 2.5, borderColor: ringColor,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Image
                    source={{ uri: getImageUri(trip.imageUrl) || getDestinationImage(trip.destination) }}
                    style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: THEME.bg }}
                  />
                </View>
                <Text numberOfLines={1} style={{
                  color: THEME.text, fontSize: 12, fontWeight: '700',
                  marginTop: 6, maxWidth: 74, textAlign: 'center'
                }}>
                  {trip.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Month label + navigation */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 }}>
        <Text style={{ color: THEME.brand, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>
          {MONTH_SHORT[viewMonth]} {viewYear}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}
            style={{ backgroundColor: THEME.card, borderRadius: 10, padding: 4, borderWidth: 1, borderColor: THEME.border }}>
            <ChevronLeft size={14} color={THEME.textSec} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
            style={{ backgroundColor: THEME.brandDim, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: THEME.brand + '40' }}>
            <Text style={{ color: THEME.brand, fontSize: 10, fontWeight: '700' }}>TODAY</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}
            style={{ backgroundColor: THEME.card, borderRadius: 10, padding: 4, borderWidth: 1, borderColor: THEME.border }}>
            <ChevronRight size={14} color={THEME.textSec} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Gantt chart area */}
      <View style={{
        marginHorizontal: 16, backgroundColor: THEME.card, borderRadius: 20,
        borderWidth: 1, borderColor: THEME.border, overflow: 'hidden', marginBottom: 20,
      }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrubberRef}>
          <View style={{ width: TOTAL_W }}>
            {/* Day numbers header */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: THEME.border, paddingVertical: 10 }}>
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const isT = todayCol === (i * DAY_W + DAY_W / 2);
                return (
                  <View key={i} style={{ width: DAY_W, alignItems: 'center' }}>
                    <Text style={{
                      color: i + 1 === today.getDate() && today.getMonth() === viewMonth ? THEME.brand : THEME.textMuted,
                      fontSize: 10, fontWeight: i + 1 === today.getDate() && today.getMonth() === viewMonth ? '900' : '500',
                    }}>
                      {i + 1}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Gantt bars area */}
            <View style={{ position: 'relative', paddingVertical: 12, minHeight: Math.max(80, visibleTrips.length * 38 + 24) }}>
              {/* Today vertical line */}
              {todayCol > 0 && (
                <View style={{
                  position: 'absolute', left: todayCol, top: 0, bottom: 0,
                  width: 1.5, backgroundColor: THEME.brand + '60', zIndex: 1,
                }} />
              )}

              {/* Trip bars */}
              {visibleTrips.map((trip, idx) => {
                const barStyle = getBarStyle(trip, idx);
                if (!barStyle) return null;
                const color = getBarColor(trip.title, idx);
                const status = getDynamicTripStatus(trip.startDate, trip.endDate);
                return (
                  <TouchableOpacity
                    key={trip._id}
                    onPress={() => navigation.navigate('TripDetail', { tripId: trip._id })}
                    activeOpacity={0.8}
                    style={{
                      position: 'absolute',
                      left: barStyle.left + 2,
                      width: barStyle.width,
                      top: 12 + idx * 38,
                      height: 32,
                      backgroundColor: color + '25',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: color + '60',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginRight: 5 }} />
                    <Text numberOfLines={1} style={{ color: '#fff', fontSize: 10, fontWeight: '700', flex: 1 }}>
                      {trip.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Vertical trip list */}
      <View style={{ paddingHorizontal: 16 }}>
        {sortedTrips.map((trip, idx) => {
          const status = getDynamicTripStatus(trip.startDate, trip.endDate);
          const sc = STATUS_LABEL_COLOR[status] || STATUS_LABEL_COLOR.upcoming;
          const color = getBarColor(trip.title, idx);
          const dur = tripDuration(trip.startDate, trip.endDate);
          const s = toLocal(trip.startDate);
          const e = toLocal(trip.endDate);

          return (
            <TouchableOpacity
              key={trip._id}
              onPress={() => navigation.navigate('TripDetail', { tripId: trip._id })}
              activeOpacity={0.85}
            >
              {/* Date label on left + dot */}
              <View style={{ flexDirection: 'row' }}>
                {/* Left timeline column */}
                <View style={{ width: 48, alignItems: 'center' }}>
                  {s && (
                    <>
                      <Text style={{ color: THEME.brand, fontSize: 13, fontWeight: '900' }}>
                        {s.getDate().toString().padStart(2, '0')}
                      </Text>
                      <Text style={{ color: THEME.textMuted, fontSize: 9, fontWeight: '700' }}>
                        {MONTH_SHORT[s.getMonth()]}
                      </Text>
                    </>
                  )}
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginTop: 4, borderWidth: 2, borderColor: THEME.bg }} />
                  {/* Vertical connector */}
                  {idx < sortedTrips.length - 1 && (
                    <View style={{ flex: 1, width: 1.5, backgroundColor: THEME.border, marginTop: 4, minHeight: 30 }} />
                  )}
                  {e && s && e.getDate() !== s.getDate() && (
                    <>
                      <Text style={{ color: THEME.textSec, fontSize: 13, fontWeight: '900', marginTop: 4 }}>
                        {e.getDate().toString().padStart(2, '0')}
                      </Text>
                      <Text style={{ color: THEME.textMuted, fontSize: 9, fontWeight: '700' }}>
                        {MONTH_SHORT[e.getMonth()]}
                      </Text>
                    </>
                  )}
                </View>

                {/* Right card */}
                <View style={{
                  flex: 1, backgroundColor: THEME.card, borderRadius: 20,
                  borderWidth: 1, borderColor: THEME.border, marginLeft: 12,
                  marginBottom: 14, overflow: 'hidden',
                  flexDirection: 'row', padding: 12,
                }}>
                  <TripThumb trip={trip} size={76} radius={12} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text numberOfLines={1} style={{ color: THEME.text, fontSize: 14, fontWeight: '800', flex: 1, marginRight: 6 }}>
                        {trip.title}
                      </Text>
                      <View style={{ backgroundColor: sc.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                        <Text style={{ color: sc.text, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' }}>{status}</Text>
                      </View>
                    </View>

                    <Text style={{ color: THEME.textSec, fontSize: 10, fontWeight: '600', marginBottom: 6 }}>
                      📅 {formatDateRange(trip.startDate, trip.endDate)}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Users size={11} color={THEME.textMuted} />
                        <Text style={{ color: THEME.textSec, fontSize: 10, fontWeight: '600' }}>{trip.memberCount || 1} People</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} color={THEME.textMuted} />
                        <Text style={{ color: THEME.textSec, fontSize: 10, fontWeight: '600' }}>{dur} Days</Text>
                      </View>
                    </View>

                    <AvatarStack count={trip.memberCount || 2} size={20} />
                  </View>
                  <ChevronRight size={16} color={THEME.textMuted} style={{ alignSelf: 'center' }} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Free gap banner */}
        {freeGap && (
          <View style={{
            backgroundColor: '#1a0e00', borderRadius: 20, padding: 16,
            borderWidth: 1, borderColor: THEME.brand + '30', flexDirection: 'row',
            alignItems: 'center', marginBottom: 16,
          }}>
            <View style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: THEME.brandDim, alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <CalendarIcon size={22} color={THEME.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: THEME.textSec, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>
                You're free between
              </Text>
              <Text style={{ color: THEME.brand, fontSize: 15, fontWeight: '900' }}>
                {freeGap.start.getDate()} {MONTHS[freeGap.start.getMonth()].slice(0,3)} – {freeGap.end.getDate()} {MONTHS[freeGap.end.getMonth()].slice(0,3)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: THEME.text, fontSize: 11, fontWeight: '700', marginBottom: 2 }}>
                Plan your next adventure!
              </Text>
              <Text style={{ color: THEME.textMuted, fontSize: 9 }}>
                Explore and create memories
              </Text>
            </View>
            <TouchableOpacity
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.brand, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
            >
              <ChevronRight size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{ height: 100 }} />

      <Modal
        visible={!!selectedStoryTrip}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedStoryTrip(null)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }} 
          activeOpacity={1} 
          onPress={() => setSelectedStoryTrip(null)}
        >
          <TouchableOpacity activeOpacity={1} style={{
            backgroundColor: THEME.card,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: 120,
          }}>
            {selectedStoryTrip && (
              <>
                <TouchableOpacity
                  onPress={() => setSelectedStoryTrip(null)}
                  style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 8, backgroundColor: THEME.bg, borderRadius: 20, opacity: 0.8 }}
                >
                  <X size={20} color={THEME.text} />
                </TouchableOpacity>

                <Image
                  source={{ uri: getImageUri(selectedStoryTrip.imageUrl) || getDestinationImage(selectedStoryTrip.destination) }}
                  style={{ width: '100%', height: 160, borderRadius: 20, marginBottom: 20 }}
                />

                <Text style={{ color: THEME.text, fontSize: 24, fontWeight: '900', marginBottom: 4 }}>
                  {selectedStoryTrip.title}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <MapIcon size={14} color={THEME.brand} style={{ marginRight: 6 }} />
                  <Text style={{ color: THEME.textSec, fontSize: 14, fontWeight: '600' }}>
                    {selectedStoryTrip.destination || 'Destination TBD'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: THEME.bg, padding: 16, borderRadius: 16, marginBottom: 24 }}>
                  <View>
                    <Text style={{ color: THEME.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' }}>Dates</Text>
                    <Text style={{ color: THEME.text, fontSize: 13, fontWeight: '800' }}>{formatDateRange(selectedStoryTrip.startDate, selectedStoryTrip.endDate)}</Text>
                  </View>
                  <View>
                    <Text style={{ color: THEME.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' }}>Travelers</Text>
                    <Text style={{ color: THEME.text, fontSize: 13, fontWeight: '800' }}>{selectedStoryTrip.memberCount || 1} People</Text>
                  </View>
                  <View>
                    <Text style={{ color: THEME.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' }}>Status</Text>
                    <Text style={{ color: getDynamicTripStatus(selectedStoryTrip.startDate, selectedStoryTrip.endDate) === 'ongoing' ? THEME.success : THEME.brand, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' }}>
                      {getDynamicTripStatus(selectedStoryTrip.startDate, selectedStoryTrip.endDate)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    const id = selectedStoryTrip._id;
                    setSelectedStoryTrip(null);
                    navigation.navigate('TripDetail', { tripId: id });
                  }}
                  style={{ backgroundColor: THEME.brand, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>View Full Details</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3 — MAP VIEW (SVG World Map)
// ════════════════════════════════════════════════════════════════════════════

// Simplified Mercator projection — accepts dynamic map dimensions
const lngLatToXY = (lng, lat, mapW, mapH) => {
  const x = ((lng + 180) / 360) * mapW;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = (mapH / 2) - (mapW * mercN) / (2 * Math.PI);
  return { x, y };
};

// Destination → approximate coordinates
const DEST_COORDS = {
  goa:       { lng: 74.1240, lat: 15.2993 },
  mumbai:    { lng: 72.8777, lat: 19.0760 },
  delhi:     { lng: 77.2090, lat: 28.6139 },
  kolkata:   { lng: 88.3639, lat: 22.5726 },
  darjeeling:{ lng: 88.2627, lat: 27.0360 },
  jharkhand: { lng: 85.2799, lat: 23.6102 },
  bali:      { lng: 115.1889, lat: -8.4095 },
  'new york':{ lng: -74.0060, lat: 40.7128 },
  paris:     { lng: 2.3522, lat: 48.8566 },
  london:    { lng: -0.1276, lat: 51.5074 },
  tokyo:     { lng: 139.6917, lat: 35.6895 },
  dubai:     { lng: 55.2708, lat: 25.2048 },
  singapore: { lng: 103.8198, lat: 1.3521 },
  bangkok:   { lng: 100.5018, lat: 13.7563 },
  switzerland:{ lng: 8.2275, lat: 46.8182 },
  default:   { lng: 78.9629, lat: 20.5937 }, // India center
};

const getCoords = (destination) => {
  if (!destination) return { latitude: DEST_COORDS.default.lat, longitude: DEST_COORDS.default.lng };
  const d = destination.toLowerCase();
  for (const [key, val] of Object.entries(DEST_COORDS)) {
    if (d.includes(key)) {
      return { latitude: val.lat, longitude: val.lng };
    }
  }
  return { latitude: DEST_COORDS.default.lat, longitude: DEST_COORDS.default.lng };
};

// Simplified world map SVG path (major continents outline)
const WORLD_PATH = `
M 20,120 L 60,100 L 80,90 L 90,85 L 95,80 L 100,70 L 110,65 L 120,70 L 130,65 
L 145,60 L 160,55 L 175,58 L 185,65 L 190,75 L 185,85 L 175,90 L 165,95 
L 155,100 L 150,110 L 145,120 L 140,130 L 135,140 L 130,150 L 120,155 
L 110,150 L 100,145 L 90,140 L 80,135 L 70,130 L 60,128 L 45,130 L 30,128 L 20,120 Z

M 200,55 L 215,50 L 230,48 L 245,50 L 258,55 L 268,65 L 275,78 L 278,92 
L 275,105 L 268,115 L 255,122 L 240,125 L 225,122 L 212,115 L 205,105 
L 200,92 L 198,78 L 200,65 L 200,55 Z

M 280,62 L 300,58 L 320,55 L 340,58 L 355,65 L 365,75 L 370,88 
L 368,100 L 362,110 L 350,118 L 335,122 L 320,120 L 308,115 
L 298,108 L 290,98 L 284,86 L 280,74 L 280,62 Z

M 370,80 L 385,75 L 400,72 L 418,74 L 432,80 L 442,90 L 448,103 
L 446,116 L 440,126 L 428,133 L 413,136 L 398,133 L 386,126 
L 376,116 L 372,103 L 370,90 L 370,80 Z

M 105,155 L 120,158 L 130,165 L 135,178 L 132,192 L 122,202 
L 108,205 L 96,200 L 88,188 L 87,175 L 93,164 L 105,155 Z

M 250,160 L 270,155 L 288,158 L 300,168 L 305,182 L 300,196 
L 286,205 L 268,207 L 252,202 L 242,190 L 240,176 L 246,165 L 250,160 Z
`;

let WebView = null;

if (Platform.OS !== 'web') {
  try {
    const WV = require('react-native-webview');
    WebView = WV.WebView;
  } catch (e) {
    console.log('[CalendarScreen] Failed to load react-native-webview:', e.message);
  }
}

function MapTab({ trips, navigation }) {
  const { width: screenW } = useWindowDimensions();
  const MAP_W = screenW - 32;
  const MAP_H = MAP_W * 0.75; // taller for better interaction
  const [subTab, setSubTab] = useState('Trips');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [resolvedCoords, setResolvedCoords] = useState({});
  const [resolving, setResolving] = useState(false);
  const mapRef = useRef(null);

  const displayTrips = trips.filter(t => {
    const status = getDynamicTripStatus(t.startDate, t.endDate);
    if (subTab === 'Trips') return status === 'upcoming' || status === 'ongoing' || status === 'planning';
    if (subTab === 'Visited') return status === 'completed';
    return false;
  });

  // Geocode fallback for missing coordinates
  useEffect(() => {
    let active = true;
    const resolveAllCoords = async () => {
      const tripsToGeocode = displayTrips.filter(t => {
        const hasDbCoords = t.latitude != null && t.longitude != null;
        const hasStateCoords = resolvedCoords[t._id] != null;
        return !hasDbCoords && !hasStateCoords;
      });

      if (tripsToGeocode.length === 0) return;

      setResolving(true);
      const newCoords = {};
      let changed = false;

      for (const trip of tripsToGeocode) {
        if (!active) break;
        if (!trip.destination) continue;
        try {
          const cleanDest = trip.destination.split(',')[0].trim();
          const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(cleanDest)}&limit=1`);
          if (res.ok) {
            const data = await res.json();
            if (data.features && data.features.length > 0) {
              const geometry = data.features[0].geometry;
              if (geometry && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
                const lon = geometry.coordinates[0];
                const lat = geometry.coordinates[1];
                if (typeof lon === 'number' && typeof lat === 'number' && !isNaN(lon) && !isNaN(lat)) {
                  newCoords[trip._id] = {
                    latitude: lat,
                    longitude: lon
                  };
                  changed = true;
                }
              }
            }
          }
          await new Promise(r => setTimeout(r, 150)); // small delay
        } catch (e) {
          console.log(`[MapTab] Error geocoding fallback for ${trip.destination}:`, e.message);
        }
      }

      if (changed && active) {
        setResolvedCoords(prev => ({ ...prev, ...newCoords }));
      }
      setResolving(false);
    };

    resolveAllCoords();
    return () => {
      active = false;
    };
  }, [trips, subTab]);

  const getTripCoords = (trip) => {
    if (trip.latitude != null && trip.longitude != null) {
      return { latitude: trip.latitude, longitude: trip.longitude };
    }
    if (resolvedCoords[trip._id]) {
      return resolvedCoords[trip._id];
    }
    return getCoords(trip.destination);
  };

  // Zoom map to show all coordinates is now handled inside WebView's HTML

  const PIN_COLORS = {
    planning: THEME.brand,
    upcoming: THEME.brand,
    ongoing:  THEME.warning,
    completed:THEME.success,
  };

  const handleMarkerPress = (trip) => {
    setSelectedTrip(trip);
  };

  const MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#0f0f12' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f12' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#74747c' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#52525b' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#18181b' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#27272a' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#18181b' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3f3f46' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#09090b' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3f3f46' }] }
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Sub-tab bar */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 14, backgroundColor: THEME.card, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: THEME.border }}>
        {['Trips', 'Visited'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setSubTab(tab);
              setSelectedTrip(null);
            }}
            style={{
              flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 12,
              backgroundColor: subTab === tab ? THEME.brand : 'transparent',
            }}
          >
            <Text style={{
              color: subTab === tab ? '#fff' : THEME.textSec,
              fontSize: 12, fontWeight: '700',
            }}>
              {tab === 'Trips' ? '✈️ Active Trips' : '☑ Visited'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map Container */}
      <View style={{
        marginHorizontal: 16, borderRadius: 24, overflow: 'hidden',
        backgroundColor: '#0a0a0f', borderWidth: 1, borderColor: THEME.border, marginBottom: 14,
        height: MAP_H, position: 'relative'
      }}>
        {Platform.OS === 'web' || !WebView ? (
          /* Web fallback or package failed loader */
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <MapIcon size={48} color={THEME.brand} style={{ opacity: 0.6, marginBottom: 12 }} />
            <Text style={{ color: THEME.text, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
              Interactive Map
            </Text>
            <Text style={{ color: THEME.textSec, fontSize: 11, textAlign: 'center', marginTop: 4 }}>
              Tracking {displayTrips.length} locations. Open this app on Android/iOS device to view the fully interactive map.
            </Text>
          </View>
        ) : (
          <WebView
            ref={mapRef}
            style={{ flex: 1, backgroundColor: '#0a0a0f' }}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'markerPress') {
                  const trip = displayTrips.find(t => t._id === data.id);
                  if (trip) setSelectedTrip(trip);
                }
              } catch (e) {}
            }}
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                  <style>
                    body { margin: 0; padding: 0; background-color: #0a0a0f; }
                    #map { width: 100vw; height: 100vh; background-color: #0a0a0f; }
                    .leaflet-layer { filter: brightness(0.65) contrast(1.3) saturate(1.1); }
                    .marker-wrapper {
                      position: relative;
                      width: 40px;
                      height: 40px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                    }
                    .premium-marker {
                      width: 28px;
                      height: 28px;
                      background: radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, var(--marker-color) 120%);
                      border-radius: 50% 50% 50% 0;
                      transform: rotate(-45deg);
                      border: 2px solid var(--marker-color);
                      box-shadow: 0 0 8px var(--marker-color), inset 0 0 6px rgba(0,0,0,0.6);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      position: relative;
                      z-index: 2;
                      transition: all 0.3s ease;
                    }
                    .marker-wrapper.selected .premium-marker {
                      transform: rotate(-45deg) scale(1.2);
                      border-color: #fff;
                      box-shadow: 0 0 12px #fff, inset 0 0 8px rgba(0,0,0,0.6);
                    }
                    .premium-marker-icon {
                      transform: rotate(45deg);
                      font-size: 13px;
                      color: #fff;
                      font-family: sans-serif;
                      font-weight: bold;
                      filter: drop-shadow(0 2px 2px rgba(0,0,0,0.6));
                    }
                    .ripple-container {
                      position: absolute;
                      bottom: -10px;
                      left: 50%;
                      transform: translateX(-50%);
                      width: 50px;
                      height: 50px;
                      z-index: 1;
                      pointer-events: none;
                    }
                    .ripple {
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%) rotateX(65deg);
                      border-radius: 50%;
                      border: 1px solid var(--marker-color);
                      box-shadow: 0 0 8px var(--marker-color), inset 0 0 8px var(--marker-color);
                      animation: rippleAnim 2s infinite linear;
                    }
                    .ripple:nth-child(2) { animation-delay: 0.6s; }
                    .ripple:nth-child(3) { animation-delay: 1.2s; }
                    @keyframes rippleAnim {
                      0% { width: 0; height: 0; opacity: 1; border-width: 2px; }
                      100% { width: 50px; height: 50px; opacity: 0; border-width: 0px; }
                    }
                    .marker-label {
                      position: absolute;
                      left: 36px;
                      top: 50%;
                      transform: translateY(-50%);
                      white-space: nowrap;
                      pointer-events: none;
                      z-index: 3;
                    }
                    .marker-title { color: #fff; font-weight: 800; font-size: 13px; font-family: sans-serif; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8); }
                    .marker-subtitle { color: var(--marker-color); font-size: 11px; font-weight: 600; font-family: sans-serif; margin-top: 1px; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
                  </style>
                </head>
                <body>
                  <div id="map"></div>
                  <script>
                    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([20.5937, 78.9629], 4);
                    L.tileLayer('https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

                    var markersData = ${JSON.stringify(displayTrips.map(t => {
                      const c = getTripCoords(t);
                      if (!c || typeof c.latitude !== 'number' || typeof c.longitude !== 'number' || isNaN(c.latitude)) return null;
                      
                      const status = getDynamicTripStatus(t.startDate, t.endDate);
                      const color = PIN_COLORS[status] || '${THEME.brand}';
                      
                      let iconStr = '📍';
                      const titleLow = t.title.toLowerCase();
                      if (status === 'completed') iconStr = '✓';
                      else if (titleLow.includes('beach') || titleLow.includes('goa') || titleLow.includes('bali')) iconStr = '🌴';
                      else if (titleLow.includes('city') || titleLow.includes('york') || titleLow.includes('mumbai')) iconStr = '🏢';
                      else if (titleLow.includes('mountain') || titleLow.includes('darjeeling')) iconStr = '⛰️';
                      else if (status === 'planning' || status === 'upcoming') iconStr = '🤍';

                      return {
                        id: t._id, lat: c.latitude, lng: c.longitude, 
                        color: color,
                        icon: iconStr,
                        title: t.title,
                        subtitle: status === 'completed' ? 'Completed' : formatDateRange(t.startDate, t.endDate),
                        isSelected: selectedTrip?._id === t._id,
                        date: t.startDate
                      };
                    }).filter(Boolean).sort((a,b) => new Date(a.date) - new Date(b.date)))};

                    var markerGroup = L.featureGroup();
                    var latlngs = markersData.map(m => [m.lat, m.lng]);
                    
                    // Bezier curve points generator for arcs
                    function getArcPoints(lat1, lng1, lat2, lng2) {
                        var points = [];
                        var numOfPoints = 30;
                        var midLat = (lat1 + lat2) / 2;
                        var midLng = (lng1 + lng2) / 2;
                        
                        var dx = lng2 - lng1;
                        var dy = lat2 - lat1;
                        var dist = Math.sqrt(dx*dx + dy*dy);
                        var offset = dist * 0.25; 
                        
                        var nx = -dy;
                        var ny = dx;
                        var nLen = Math.sqrt(nx*nx + ny*ny);
                        nx = (nx / nLen) * offset;
                        ny = (ny / nLen) * offset;
                        
                        // Always curve upwards (North) to look like the flight paths in the picture
                        if (ny < 0) { nx = -nx; ny = -ny; }

                        var cpLat = midLat + ny;
                        var cpLng = midLng + nx;
                        
                        for (var i = 0; i <= numOfPoints; i++) {
                            var t = i / numOfPoints;
                            var u = 1 - t;
                            var plat = u*u*lat1 + 2*u*t*cpLat + t*t*lat2;
                            var plng = u*u*lng1 + 2*u*t*cpLng + t*t*lng2;
                            points.push([plat, plng]);
                        }
                        return points;
                    }

                    if (latlngs.length > 1) {
                      // Add curved flight paths and airplanes
                      for (let i = 0; i < latlngs.length - 1; i++) {
                        const lat1 = latlngs[i][0];
                        const lng1 = latlngs[i][1];
                        const lat2 = latlngs[i+1][0];
                        const lng2 = latlngs[i+1][1];
                        
                        var arc = getArcPoints(lat1, lng1, lat2, lng2);
                        
                        L.polyline(arc, {
                          color: '${THEME.brand}',
                          weight: 2,
                          dashArray: '4, 8',
                          opacity: 0.8
                        }).addTo(map);

                        // Midpoint of arc is around index 15
                        const midLat = arc[15][0];
                        const midLng = arc[15][1];
                        
                        // Angle at midpoint for airplane rotation
                        const pLat1 = arc[14][0];
                        const pLng1 = arc[14][1];
                        const pLat2 = arc[16][0];
                        const pLng2 = arc[16][1];
                        let angle = Math.atan2(pLng2 - pLng1, pLat2 - pLat1) * 180 / Math.PI;

                        var airplaneIcon = L.divIcon({
                          html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="${THEME.brand}" style="transform: rotate(' + angle + 'deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
                          className: '',
                          iconSize: [20, 20],
                          iconAnchor: [10, 10]
                        });
                        L.marker([midLat, midLng], { icon: airplaneIcon, interactive: false }).addTo(map);
                      }
                    }

                    markersData.forEach(function(m) {
                      var el = document.createElement('div');
                      el.className = 'marker-wrapper' + (m.isSelected ? ' selected' : '');
                      el.style.setProperty('--marker-color', m.color);
                      el.innerHTML = '<div class="ripple-container"><div class="ripple"></div><div class="ripple"></div><div class="ripple"></div></div><div class="premium-marker"><div class="premium-marker-icon">' + m.icon + '</div></div><div class="marker-label"><div class="marker-title">' + m.title + '</div><div class="marker-subtitle">' + m.subtitle + '</div></div>';

                      var icon = L.divIcon({
                        html: el, className: '',
                        iconSize: [40, 40],
                        iconAnchor: [20, 36] // Pointing to the bottom tip of teardrop
                      });

                      var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(map);
                      markerGroup.addLayer(marker);
                      
                      marker.on('click', function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: m.id }));
                      });
                    });

                    if (markersData.length > 0) {
                      var hasSelected = markersData.find(m => m.isSelected);
                      if (hasSelected) {
                         map.setView([hasSelected.lat, hasSelected.lng], 10, { animate: true });
                      } else if (markersData.length === 1) {
                         map.setView([markersData[0].lat, markersData[0].lng], 8);
                      } else {
                         map.fitBounds(markerGroup.getBounds(), { padding: [40, 40], maxZoom: 10 });
                      }
                    }
                  </script>
                </body>
                </html>
              `
            }}
          />
        )}

        {/* Loading overlay for Geocoder */}
        {resolving && (
          <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.85)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ActivityIndicator size="small" color={THEME.brand} />
            <Text style={{ color: THEME.textSec, fontSize: 9, fontWeight: '700' }}>Syncing coordinates...</Text>
          </View>
        )}
      </View>



      {/* Selected trip card */}
      {selectedTrip ? (
        <TouchableOpacity
          onPress={() => navigation.navigate('TripDetail', { tripId: selectedTrip._id })}
          activeOpacity={0.9}
          style={{
            marginHorizontal: 16, backgroundColor: THEME.card, borderRadius: 20,
            borderWidth: 1, borderColor: THEME.border, overflow: 'hidden', marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: 'row', padding: 12 }}>
            <TripThumb trip={selectedTrip} size={80} radius={14} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text numberOfLines={1} style={{ color: THEME.text, fontSize: 15, fontWeight: '800', flex: 1 }}>
                  {selectedTrip.title}
                </Text>
                <View style={{ backgroundColor: THEME.brandDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                  <Text style={{ color: THEME.brand, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' }}>
                    {getDynamicTripStatus(selectedTrip.startDate, selectedTrip.endDate)}
                  </Text>
                </View>
              </View>
              <Text style={{ color: THEME.textSec, fontSize: 10, fontWeight: '600', marginBottom: 8 }}>
                📅 {formatDateRange(selectedTrip.startDate, selectedTrip.endDate)}
              </Text>
              {/* Stats row */}
              <View style={{ flexDirection: 'row', gap: 14 }}>
                {[
                  { icon: '💰', label: `₹${(selectedTrip.totalBudget || 0).toLocaleString('en-IN')}`, sub: 'Budget' },
                  { icon: '📍', label: selectedTrip.destination?.split(',')[0] || 'Unknown', sub: 'Location' },
                  { icon: '⏱️', label: `${tripDuration(selectedTrip.startDate, selectedTrip.endDate)}d`, sub: 'Duration' },
                ].map(s => (
                  <View key={s.sub} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                    <Text style={{ color: THEME.text, fontSize: 10, fontWeight: '700' }}>{s.label}</Text>
                    <Text style={{ color: THEME.textMuted, fontSize: 8 }}>{s.sub}</Text>
                  </View>
                ))}
              </View>
            </View>
            <ChevronRight size={16} color={THEME.textMuted} style={{ alignSelf: 'center', marginLeft: 4 }} />
          </View>
          {/* Travelers */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, gap: 8 }}>
            <Users size={12} color={THEME.textMuted} />
            <Text style={{ color: THEME.textSec, fontSize: 10, fontWeight: '600' }}>
              {selectedTrip.memberCount || 1} Travelers
            </Text>
            <AvatarStack count={selectedTrip.memberCount || 2} size={22} />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
          <Text style={{ color: THEME.textMuted, fontSize: 12, textAlign: 'center' }}>
            Tap a pin on the map to see trip details
          </Text>
        </View>
      )}

      {/* All trips mini list */}
      {displayTrips.length > 0 && (
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: THEME.text, fontSize: 14, fontWeight: '800', marginBottom: 12 }}>
            Mapped Locations ({displayTrips.length})
          </Text>
          {displayTrips.map((trip, idx) => {
            const status = getDynamicTripStatus(trip.startDate, trip.endDate);
            const color = getBarColor(trip.title, idx);
            const isSelected = selectedTrip?._id === trip._id;
            return (
              <TouchableOpacity
                key={trip._id}
                onPress={() => handleMarkerPress(trip)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: isSelected ? THEME.brandDim : THEME.card,
                  borderRadius: 14, padding: 10, marginBottom: 8,
                  borderWidth: 1,
                  borderColor: isSelected ? THEME.brand + '40' : THEME.border,
                }}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ color: THEME.text, fontSize: 12, fontWeight: '700' }}>{trip.title}</Text>
                  <Text style={{ color: THEME.textMuted, fontSize: 10 }}>{trip.destination}</Text>
                </View>
                <Text style={{ color: THEME.textMuted, fontSize: 10 }}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'timeline', label: 'Timeline', icon: List },
  { id: 'map',      label: 'Map',      icon: MapIcon },
];

export default function CalendarScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('calendar');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fetchTrips = async () => {
    try {
      const res = await client.get('/trips?limit=100');
      if (res.data.success) setTrips(res.data.trips || []);
    } catch (e) {
      console.log('[CalendarScreen] Fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchTrips(); }, []);

  const switchTab = (tabId) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={THEME.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10,
      }}>
        {/* Left: hamburger + title stack */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity style={{ padding: 4 }}>
            <AlignLeft size={22} color={THEME.textSec} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: THEME.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, lineHeight: 26 }}>
              Calendar
            </Text>
            <Text style={{ color: THEME.brand, fontSize: 10, fontWeight: '700', letterSpacing: 0.2 }}>
              Plan. Track. Travel.
            </Text>
          </View>
        </View>

        {/* Right: search + add */}
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              width: 38, height: 38, borderRadius: 19, backgroundColor: THEME.card,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: THEME.border,
            }}
          >
            <Search size={17} color={THEME.textSec} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateTrip')}
            style={{
              width: 38, height: 38, borderRadius: 19, backgroundColor: THEME.brand,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: THEME.brand, shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
            }}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={{
        flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
        backgroundColor: THEME.card, borderRadius: 18, padding: 4,
        borderWidth: 1, borderColor: THEME.border,
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => switchTab(tab.id)}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                paddingVertical: 9, borderRadius: 14, gap: 6,
                backgroundColor: isActive ? THEME.brand : 'transparent',
              }}
              activeOpacity={0.8}
            >
              <Icon size={14} color={isActive ? '#fff' : THEME.textSec} />
              <Text style={{ color: isActive ? '#fff' : THEME.textSec, fontSize: 12, fontWeight: '700' }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {activeTab === 'calendar' && (
          <CalendarTab trips={trips} navigation={navigation} />
        )}
        {activeTab === 'timeline' && (
          <TimelineTab trips={trips} navigation={navigation} />
        )}
        {activeTab === 'map' && (
          <MapTab trips={trips} navigation={navigation} />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
