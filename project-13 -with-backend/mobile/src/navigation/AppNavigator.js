import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import { Home, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2e2e2e',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#525252',
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
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
        name="CreateTrip" 
        component={CreateTripScreen} 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Plan New Trip',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#f5f5f5',
        }} 
      />
    </Stack.Navigator>
  );
}
