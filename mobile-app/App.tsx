import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WatchlistProvider } from './src/context/WatchlistContext';
import { ProfileProvider, useProfile, getAvatarOption } from './src/context/ProfileContext';
import { Feather } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import AuthScreen from './src/screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─────────────────────────────────────────────────────────────
// Exact replica of website's mobile-nav.tsx:
// Home | Search | Library | History | Stats | Profile/Avatar
// ─────────────────────────────────────────────────────────────

interface TabItemProps {
  focused: boolean;
  label: string;
  icon: string; // SVG path alternative: use emoji/text icons
}

function TabIcon({ focused, label, icon }: TabItemProps) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
        <Feather name={icon as any} style={[tabStyles.icon, focused && tabStyles.iconActive]} />
        {focused && <View style={tabStyles.activeDot} />}
      </View>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

function ProfileTabIcon({ focused }: { focused: boolean }) {
  const { user } = useAuth();
  const { profile } = useProfile();
  
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.iconWrap}>
        {user ? (
          <View style={[tabStyles.avatarCircle, focused && tabStyles.avatarCircleFocused]}>
            {profile?.avatarUrl ? (
              <Image 
                source={{ uri: getAvatarOption(profile.avatarUrl).url }} 
                style={tabStyles.avatarImg} 
              />
            ) : (
              <Text style={tabStyles.avatarText}>{user.email?.[0]?.toUpperCase() || '?'}</Text>
            )}
          </View>
        ) : (
          <Feather name="user" style={[tabStyles.icon, focused && tabStyles.iconActive]} />
        )}
      </View>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]} numberOfLines={1}>
        {user ? (profile?.name || user.email?.split('@')[0]?.slice(0, 8)) : 'Sign In'}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingTop: 2 },
  iconWrap: { position: 'relative', padding: 4, borderRadius: 10 },
  iconWrapActive: { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
  icon: { fontSize: 19, color: '#52525B' },
  iconActive: { color: '#EF4444' },
  activeDot: {
    position: 'absolute', top: 0, right: 0,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  label: { fontSize: 10, color: '#52525B', marginTop: 1, fontWeight: '600', letterSpacing: -0.2 },
  labelActive: { color: '#EF4444' },
  avatarCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#27272A', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#3F3F46', overflow: 'hidden',
  },
  avatarImg: {
    width: '100%', height: '100%', resizeMode: 'cover',
  },
  avatarCircleFocused: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
});

// ── Tab Navigator ────────────────────────────────────────────
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(9, 9, 11, 0.96)',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 62,
          paddingBottom: Platform.OS === 'ios' ? 22 : 6,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Home" icon="home" /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Search" icon="search" /> }}
      />
      <Tab.Screen
        name="Library"
        component={WatchlistScreen}
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Library" icon="bookmark" /> }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="History" icon="clock" /> }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon focused={focused} label="Stats" icon="bar-chart-2" /> }}
      />
      <Tab.Screen
        name="Profile"
        component={AuthScreen}
        options={{ tabBarIcon: ({ focused }: { focused: boolean }) => <ProfileTabIcon focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ── Root Stack ───────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <WatchlistProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={BottomTabs} />
                <Stack.Screen name="Details" component={DetailsScreen} options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="Player" component={PlayerScreen} options={{ animation: 'fade' }} />
                <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'slide_from_bottom' }} />
              </Stack.Navigator>
            </NavigationContainer>
          </WatchlistProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
