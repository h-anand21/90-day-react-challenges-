import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import BudgetOverviewScreen from '../screens/BudgetOverviewScreen';
import CalendarScreen from '../screens/CalendarScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreScreen from '../screens/ExploreScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import TripBudgetScreen from '../screens/TripBudgetScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import { Home, Wallet, Calendar, Bell, User, Compass } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabBarIconWithGlow = ({ icon: Icon, color, size, focused }) => {
  return (
    <View style={focused ? {
      backgroundColor: 'rgba(249, 115, 22, 0.12)',
      paddingHorizontal: 18,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(249, 115, 22, 0.25)',
      marginTop: 2,
    } : {
      paddingHorizontal: 18,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    }}>
      <Icon size={18} color={color} />
    </View>
  );
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#222222',
          paddingBottom: 10,
          paddingTop: 10,
          height: 72,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#525252',
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', marginTop: 4 },
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => <TabBarIconWithGlow icon={Home} color={color} size={size} focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="ExploreTab" 
        component={ExploreScreen} 
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => <TabBarIconWithGlow icon={Compass} color={color} size={size} focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="BudgetTab" 
        component={BudgetOverviewScreen} 
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size, focused }) => <TabBarIconWithGlow icon={Wallet} color={color} size={size} focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="CalendarTab" 
        component={CalendarScreen} 
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size, focused }) => <TabBarIconWithGlow icon={Calendar} color={color} size={size} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

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
          headerBackTitleVisible: false
        }} 
      />
      <Stack.Screen 
        name="TripBudget" 
        component={TripBudgetScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="CreateTrip" 
        component={CreateTripScreen} 
        options={{ 
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          headerShown: true,
          headerTitle: 'Notifications',
          headerStyle: { backgroundColor: '#111111' },
          headerTintColor: '#f5f5f5',
        }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          headerShown: true,
          headerTitle: 'Profile',
          headerStyle: { backgroundColor: '#111111' },
          headerTintColor: '#f5f5f5',
          headerBackTitleVisible: false
        }} 
      />
    </Stack.Navigator>
  );
}
