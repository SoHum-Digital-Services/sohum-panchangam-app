import { Tabs } from 'expo-router';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../src/theme';
import { usePanchangamSettings } from '../../src/settings';

function TabIcon({ name, focused }: { name: 'home' | 'search' | 'calendar' | 'temple' | 'more'; focused: boolean }) {
  const color = focused ? colors.maroon : colors.muted;
  return <View style={{ width: 32, alignItems: 'center' }}>
    {focused && <View style={{ position: 'absolute', top: -8, width: 32, height: 3, borderRadius: 2, backgroundColor: color }} />}
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {name === 'home' && <Path d="m3 10 9-7 9 7v10H15v-7H9v7H3Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />}
      {name === 'search' && <><Circle cx={10} cy={10} r={7} stroke={color} strokeWidth={1.8} /><Path d="m15 15 6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" /></>}
      {name === 'calendar' && <Path d="M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2ZM7 3v4m10-4v4M3 10h18M7 14h2m6 0h2M7 17h2m6 0h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />}
      {name === 'temple' && <Path d="M3 21h18M5 21V11h14v10M3 11l9-7 9 7M12 4V2m-3 19v-6h6v6M8 8h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />}
      {name === 'more' && <><Circle cx={5} cy={12} r={1.5} stroke={color} strokeWidth={1.8} /><Circle cx={12} cy={12} r={1.5} stroke={color} strokeWidth={1.8} /><Circle cx={19} cy={12} r={1.5} stroke={color} strokeWidth={1.8} /></>}
    </Svg>
  </View>;
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
          shadowColor: colors.shadow,
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
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: telugu ? 'శోధన' : 'Search',
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: telugu ? 'పంచాంగం' : 'Panchangam',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="temple"
        options={{
          title: telugu ? 'ఆలయం' : 'Temple',
          tabBarIcon: ({ focused }) => <TabIcon name="temple" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: telugu ? 'మరిన్ని' : 'More',
          tabBarIcon: ({ focused }) => <TabIcon name="more" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
