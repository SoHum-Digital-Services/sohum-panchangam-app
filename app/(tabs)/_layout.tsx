import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme';
import { usePanchangamSettings } from '../../src/settings';

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? colors.maroon : colors.muted, opacity: focused ? 1 : 0.72 }}>
      {symbol}
    </Text>
  );
}

export default function TabsLayout() {
  const { language } = usePanchangamSettings();
  const telugu = language === 'te';
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
          title: telugu ? 'ఈరోజు' : 'Today',
          tabBarIcon: ({ focused }) => <TabIcon symbol="☀" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: telugu ? 'క్యాలెండర్' : 'Calendar',
          tabBarIcon: ({ focused }) => <TabIcon symbol="▦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="festivals"
        options={{
          title: telugu ? 'పండుగలు' : 'Festivals',
          tabBarIcon: ({ focused }) => <TabIcon symbol="🪔" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="temple"
        options={{
          title: telugu ? 'ఆలయం' : 'Temple',
          tabBarIcon: ({ focused }) => <TabIcon symbol="🛕" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: telugu ? 'మరిన్ని' : 'More',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⋯" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
