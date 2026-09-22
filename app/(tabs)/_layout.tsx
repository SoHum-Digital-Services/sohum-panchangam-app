import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme';

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? colors.maroon : colors.muted }}>
      {symbol}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.maroon,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ఈరోజు',
          tabBarIcon: ({ focused }) => <TabIcon symbol="☀" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'క్యాలెండర్',
          tabBarIcon: ({ focused }) => <TabIcon symbol="▦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="festivals"
        options={{
          title: 'పండుగలు',
          tabBarIcon: ({ focused }) => <TabIcon symbol="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="temple"
        options={{
          title: 'ఆలయం',
          tabBarIcon: ({ focused }) => <TabIcon symbol="🏛" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
