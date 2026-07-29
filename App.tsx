import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStore, makeStore } from './src/store';
import { attachPersistence, loadPersistedState } from './src/store/persistence';
import { colors } from './src/theme';

export default function App() {
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
    return (
      <View style={styles.boot}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <StatusBar style="dark" />
          <RootNavigator />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
