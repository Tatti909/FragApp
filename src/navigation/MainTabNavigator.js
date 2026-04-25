import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

function getTabIcon(routeName, focused) {
  if (routeName === 'Home') {
    return focused ? 'home' : 'home-outline';
  }

  if (routeName === 'Search') {
    return focused ? 'search' : 'search-outline';
  }

  if (routeName === 'Recommendations') {
    return focused ? 'sparkles' : 'sparkles-outline';
  }

  return focused ? 'person' : 'person-outline';
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={getTabIcon(route.name, focused)} size={size} color={color} />
        ),
        headerTitle: 'Frag-App',
        tabBarActiveTintColor: '#2e7d6e',
        tabBarInactiveTintColor: '#64748b',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
