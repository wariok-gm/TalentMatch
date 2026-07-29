import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Badge } from '../components';
import { DiscoverScreen } from '../features/discover/DiscoverScreen';
import { FavoritesScreen } from '../features/favorites/FavoritesScreen';
import { SavedJobsScreen } from '../features/favorites/SavedJobsScreen';
import { ChatScreen } from '../features/inbox/ChatScreen';
import { InboxScreen } from '../features/inbox/InboxScreen';
import { ApplySheet } from '../features/jobs/ApplySheet';
import { JobDetailScreen } from '../features/jobs/JobDetailScreen';
import { JobsScreen } from '../features/jobs/JobsScreen';
import { NotificationsScreen } from '../features/notifications/NotificationsScreen';
import { EditProfileScreen } from '../features/profile/EditProfileScreen';
import { MyProfileScreen } from '../features/profile/MyProfileScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { TalentProfileScreen } from '../features/talent/TalentProfileScreen';
import { useAppSelector } from '../store/hooks';
import { colors } from '../theme';
import { navigationIntegration } from '../utils/monitoring';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.label,
    primary: colors.tint,
    border: colors.separator,
  },
};

const TAB_ICONS: Record<keyof TabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Discover: ['sparkles-outline', 'sparkles'],
  Search: ['search-outline', 'search'],
  Castings: ['film-outline', 'film'],
  Inbox: ['chatbubble-outline', 'chatbubble'],
  Profile: ['person-circle-outline', 'person-circle'],
};

function Tabs() {
  const inboxUnread = useAppSelector((state) =>
    Object.values(state.inbox.conversations).reduce((sum, c) => sum + c.unread, 0),
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.label,
        tabBarInactiveTintColor: colors.tertiaryLabel,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="extraLight" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
          ),
        tabBarIcon: ({ focused, color, size }) => {
          const [outline, filled] = TAB_ICONS[route.name as keyof TabParamList];
          const icon = <Ionicons name={focused ? filled : outline} size={size - 2} color={color} />;
          if (route.name === 'Inbox' && inboxUnread > 0) {
            return (
              <View>
                {icon}
                <Badge count={inboxUnread} style={styles.tabBadge} />
              </View>
            );
          }
          return icon;
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Castings" component={JobsScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const containerRef = useNavigationContainerRef();
  return (
    <NavigationContainer
      ref={containerRef}
      theme={navTheme}
      onReady={() => navigationIntegration.registerNavigationContainer(containerRef)}
    >
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: colors.label,
          headerTitleStyle: { fontWeight: '600' },
          headerStyle: { backgroundColor: colors.bg },
          contentStyle: { backgroundColor: colors.bg },
          // Chevron-only back button: the labeled variant ("< Tabs") renders a
          // custom back item whose tap target is unreliable in
          // react-native-screens; minimal mode uses the stock item.
          headerBackButtonDisplayMode: 'minimal',
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="TalentProfile"
          component={TalentProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: '' }} />
        <Stack.Screen
          name="Apply"
          component={ApplySheet}
          options={{
            presentation: 'formSheet',
            headerShown: false,
            sheetAllowedDetents: [0.65, 1.0],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
          }}
        />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: '' }} />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ presentation: 'modal', title: 'Notifications' }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ presentation: 'modal', title: 'Edit Profile' }}
        />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorites' }} />
        <Stack.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved Jobs' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    transform: [{ scale: 0.85 }],
  },
});
