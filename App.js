import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { colors } from './src/constants/theme';
import { Storage } from './src/utils/storage';
import { t } from './src/utils/i18n';

import SetupScreen   from './src/screens/SetupScreen';
import HomeScreen    from './src/screens/HomeScreen';
import ChatScreen    from './src/screens/ChatScreen';
import SocialScreen  from './src/screens/SocialScreen';
import RoutineScreen from './src/screens/RoutineScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    border: colors.border,
    text: colors.text,
    primary: colors.accent,
  },
};

const TAB_ICONS = {
  Home: '🏠', Chat: '💬', Social: '📱', Routine: '✅', Settings: '⚙️',
};

export default function App() {
  const [appState, setAppState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Storage.get().then(s => {
      setAppState(s);
      setLoading(false);
    });
  }, []);

  const updateState = async (partial) => {
    const next = { ...appState, ...partial };
    // Deep merge for nested objects
    if (partial.apiKeys) next.apiKeys = { ...appState.apiKeys, ...partial.apiKeys };
    if (partial.stats) next.stats = { ...appState.stats, ...partial.stats };
    setAppState(next);
    await Storage.set(next);
    return next;
  };

  const handleSetupDone = async () => {
    const s = await Storage.get();
    setAppState(s);
  };

  const handleReset = async () => {
    const s = await Storage.get();
    setAppState({ ...s, configured: false });
  };

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!appState?.configured) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SetupScreen onDone={handleSetupDone} />
      </SafeAreaProvider>
    );
  }

  const lang = appState.lang || 'pt-BR';

  const screenProps = { appState, onUpdate: updateState };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={NAV_THEME}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              const icon = TAB_ICONS[route.name] || '●';
              return (
                <View style={{ alignItems: 'center' }}>
                  <View style={[styles.tabIconWrap, focused && styles.tabIconActive]}>
                    <View style={{ fontSize: 20 }}>
                      {/* Icon text rendered separately below */}
                    </View>
                  </View>
                </View>
              );
            },
            tabBarLabel: ({ focused, color }) => {
              const labels = {
                Home: t(lang, 'home'),
                Chat: t(lang, 'chat'),
                Social: t(lang, 'social'),
                Routine: t(lang, 'routine'),
                Settings: t(lang, 'settings'),
              };
              return null; // handled by tabBarIcon
            },
            tabBarStyle: {
              backgroundColor: colors.bg,
              borderTopColor: colors.border,
              height: 64,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarShowLabel: true,
          })}
        >
          <Tab.Screen name="Home" options={{ tabBarLabel: t(lang, 'home'), tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} /> }}>
            {(props) => <HomeScreen {...props} {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Chat" options={{ tabBarLabel: t(lang, 'chat'), tabBarIcon: ({ color }) => <TabIcon icon="💬" color={color} /> }}>
            {(props) => <ChatScreen {...props} {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Social" options={{ tabBarLabel: t(lang, 'social'), tabBarIcon: ({ color }) => <TabIcon icon="📱" color={color} /> }}>
            {(props) => <SocialScreen {...props} {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Routine" options={{ tabBarLabel: t(lang, 'routine'), tabBarIcon: ({ color }) => <TabIcon icon="✅" color={color} /> }}>
            {(props) => <RoutineScreen {...props} {...screenProps} />}
          </Tab.Screen>
          <Tab.Screen name="Settings" options={{ tabBarLabel: t(lang, 'settings'), tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} /> }}
          >
            {(props) => <SettingsScreen {...props} {...screenProps} onReset={handleReset} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function TabIcon({ icon, color }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22 }}>{icon}</Text>;
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  tabIconWrap: { alignItems: 'center', justifyContent: 'center' },
  tabIconActive: {},
});
