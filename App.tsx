import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStore, makeStore } from './src/store';
import { attachPersistence, loadPersistedState } from './src/store/persistence';
import { ThemeProvider, useTheme } from './src/theme';
import { initMonitoring, wrapRoot } from './src/utils/monitoring';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://fe3d7d5d485e67f99dad00065f42d659@o4511819925159936.ingest.de.sentry.io/4511819929485392',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

initMonitoring();

function Boot() {
  const { colors } = useTheme();
  return (
    <View style={[styles.boot, { backgroundColor: colors.bg }]}>
      <ActivityIndicator />
    </View>
  );
}

function AppShell() {
  const { scheme } = useTheme();
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    let detach: (() => void) | undefined;
    loadPersistedState().then((persisted) => {
      const created = makeStore(persisted);
      detach = attachPersistence(created);
      setStore(created);
    });
    return () => detach?.();
  }, []);

  if (!store) {
    return <Boot />;
  }

  return (
    <Provider store={store}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </Provider>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(wrapRoot(App));

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
