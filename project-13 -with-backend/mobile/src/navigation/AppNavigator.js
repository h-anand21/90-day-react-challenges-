import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Text } from '../components/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import DashboardScreen from '../screens/DashboardScreen';
import BudgetOverviewScreen from '../screens/BudgetOverviewScreen';
import CalendarScreen from '../screens/CalendarScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreScreen from '../screens/ExploreScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import TripBudgetScreen from '../screens/TripBudgetScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import { Home, Wallet, Calendar, Compass } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Design Tokens ────────────────────────────────────────────
const BRAND       = '#ff7a00';
const GRAD_START  = '#ff9500';
const GRAD_END    = '#ff6b00';
const NAV_BG      = 'rgba(20,20,20,0.88)';
const INACTIVE    = '#9a9a9a';
const NAV_HEIGHT  = 72;

// ─── Icon Map ────────────────────────────────────────────────
const ICON_MAP = {
  DashboardTab: Home,
  ExploreTab:   Compass,
  BudgetTab:    Wallet,
  CalendarTab:  Calendar,
};

// ─── Single Tab Item with capsule morph animation ────────────
function NavItem({ route, label, isFocused, onPress }) {
  const IconComponent = ICON_MAP[route.name] || Home;

  // JS-driven anims (width/height can't use native driver)
  const expandAnim   = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const glowAnim     = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    const toVal = isFocused ? 1 : 0;
    Animated.parallel([
      Animated.spring(expandAnim, {
        toValue: toVal,
        useNativeDriver: false,
        speed: 14,
        bounciness: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: toVal,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused]);

  // Interpolations
  const capsuleWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [46, 100],
  });

  const capsuleHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [42, 48],
  });

  const capsuleBorderRadius = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 28],
  });

  const labelOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.tabSlot}
    >
      {isFocused ? (
        /* ── ACTIVE: horizontal gradient capsule ── */
        <Animated.View
          style={[
            styles.capsuleWrap,
            {
              width: capsuleWidth,
              height: capsuleHeight,
              borderRadius: capsuleBorderRadius,
            },
          ]}
        >
          <LinearGradient
            colors={[GRAD_START, GRAD_END]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: 26,
            }}
          />

          {/* Outer glow */}
          <Animated.View
            style={[styles.outerGlow, { opacity: glowOpacity }]}
          />

          {/* Top specular highlight */}
          <View style={styles.specularHighlight} />

          {/* Icon + Label inside capsule */}
          <View style={styles.capsuleContent}>
            <IconComponent
              size={22}
              color="#ffffff"
              strokeWidth={2.2}
            />
            <Animated.View style={{ opacity: labelOpacity, marginLeft: 7 }}>
              <Text style={styles.activeText}>{label}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      ) : (
        /* ── INACTIVE: vertical icon + label stack ── */
        <View style={styles.inactiveStack}>
          <IconComponent
            size={26}
            color={INACTIVE}
            strokeWidth={1.7}
          />
          <Text style={styles.inactiveText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Floating Tab Bar ─────────────────────────────────────────
function FloatingTabBar({ state, descriptors, navigation }) {
  // Navbar entrance slide-up
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 10,
      bounciness: 10,
    }).start();
  }, []);

  return (
    <View style={styles.outerWrapper} pointerEvents="box-none">
      {/* Orange glow pool under navbar */}
      <View style={styles.glowPool} />

      <Animated.View
        style={[
          styles.navPill,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Top glass edge highlight */}
        <View style={styles.topEdge} />
        {/* Bottom orange ambient edge */}
        <View style={styles.bottomEdge} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <NavItem
              key={route.key}
              route={route}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    paddingHorizontal: 24,
  },

  // Warm glow beneath the navbar
  glowPool: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 22 : 10,
    left: '12%',
    right: '12%',
    height: 36,
    borderRadius: 100,
    backgroundColor: 'transparent',
    shadowColor: '#ff6a00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    elevation: 0,
    ...(Platform.OS === 'android' && {
      backgroundColor: '#ff6a00',
      opacity: 0.18,
      height: 4,
      bottom: 20,
    }),
  },

  // Floating pill container
  navPill: {
    width: '100%',
    maxWidth: 420,
    height: NAV_HEIGHT,
    backgroundColor: NAV_BG,
    borderRadius: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 14,
    overflow: 'hidden',
    // Deep premium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 30,
    // Subtle glass border
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  // Glass top catchlight
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 30,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 1,
  },

  // Bottom orange tint
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 30,
    right: 30,
    height: 1,
    backgroundColor: 'rgba(255,120,0,0.10)',
    borderRadius: 1,
  },

  // ── Each tab slot ──
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: NAV_HEIGHT,
  },

  // ── Capsule container (animated width/height) ──
  capsuleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  capsuleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  // Inactive vertical stack: icon on top, label below, centered
  inactiveStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Outer orange glow behind active capsule
  outerGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 34,
    backgroundColor: 'transparent',
    shadowColor: '#ff7a00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    // Android fallback
    ...(Platform.OS === 'android' && {
      borderWidth: 1,
      borderColor: 'rgba(255,122,0,0.25)',
    }),
  },

  // Specular highlight on top of the active capsule
  specularHighlight: {
    position: 'absolute',
    top: 3,
    left: '15%',
    right: '15%',
    height: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // Active label inside capsule
  activeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Inactive label below icon
  inactiveText: {
    color: INACTIVE,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.2,
  },
});

// ─── Tab Navigator ────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen}      options={{ title: 'Home'     }} />
      <Tab.Screen name="ExploreTab"   component={ExploreScreen}        options={{ title: 'Explore'  }} />
      <Tab.Screen name="BudgetTab"    component={BudgetOverviewScreen} options={{ title: 'Budget'   }} />
      <Tab.Screen name="CalendarTab"  component={CalendarScreen}       options={{ title: 'Calendar' }} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Trip Details',
          headerStyle: { backgroundColor: '#111111' },
          headerTintColor: '#f5f5f5',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen name="TripBudget"    component={TripBudgetScreen}    options={{ headerShown: false }} />
      <Stack.Screen name="CreateTrip"    component={CreateTripScreen}    options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerTitle: 'Profile',
          headerStyle: { backgroundColor: '#111111' },
          headerTintColor: '#f5f5f5',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
