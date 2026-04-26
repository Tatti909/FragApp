import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';
import FragranceDetailScreen from '../screens/FragranceDetailScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="FragranceDetail"
        component={FragranceDetailScreen}
        options={{
          title: 'Fragrance',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTitleStyle: {
            color: colors.text,
          },
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}
