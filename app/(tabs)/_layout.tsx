import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
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
          title: telugu ? 'హోమ్' : 'Home',
          tabBarIcon: ({ focused }) => <TabIcon symbol="☀" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: telugu ? 'శోధన' : 'Search',
          tabBarIcon: ({ color }) => <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Circle cx={10} cy={10} r={7} stroke={color} strokeWidth={2} /><Path d="m15 15 6 6" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: telugu ? 'పంచాంగం' : 'Panchangam',
          tabBarIcon: ({ focused }) => <TabIcon symbol="▦" focused={focused} />,
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
