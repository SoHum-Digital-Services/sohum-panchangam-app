import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme';

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? colors.maroon : colors.muted, opacity: focused ? 1 : 0.72 }}>
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
        tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          shadowColor: '#5b2a10',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 8,
        },
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
      <Tabs.Screen
        name="more"
        options={{
          title: 'మరిన్ని',
          tabBarIcon: ({ focused }) => <TabIcon symbol="☷" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
