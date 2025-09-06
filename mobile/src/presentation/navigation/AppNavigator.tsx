/**
 * NeuralEdge AI - Enterprise AI Platform
 * 
 * Copyright (c) 2025 Francisco Molina <pako.molina@gmail.com>
 * All rights reserved.
 * 
 * This software is licensed under the NeuralEdge AI Enterprise License.
 * Commercial use requires attribution and royalty payments of 5% gross revenue,
 * with a minimum annual payment of $1,000 USD per commercial entity.
 * 
 * Contact: pako.molina@gmail.com for licensing inquiries.
 * Repository: https://github.com/Yatrogenesis/NeuralEdge-AI
 */

// NeuralEdge AI - Application Navigator
// AION Protocol Compliant Navigation with Performance Monitoring

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ROUTES } from '../../shared/constants';
import { PerformanceMonitor, withPerformanceMonitoring } from '../../shared/utils/performance';

// Import screens (will be created next)
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator with Performance Monitoring
const MainTabNavigator = withPerformanceMonitoring('MainTabNavigation')(
  () => {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            paddingBottom: 8,
            height: 60,
            backgroundColor: '#ffffff',
            borderTopColor: '#e5e7eb',
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#6b7280',
        }}
      >
        <Tab.Screen
          name={ROUTES.HOME}
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            // tabBarIcon: ({ color, size }) => (
            //   <Icon name="home" size={size} color={color} />
            // ),
          }}
        />
        <Tab.Screen
          name={ROUTES.CHAT}
          component={ChatScreen}
          options={{
            tabBarLabel: 'Chat',
            // tabBarIcon: ({ color, size }) => (
            //   <Icon name="message-circle" size={size} color={color} />
            // ),
          }}
        />
        <Tab.Screen
          name={ROUTES.CONVERSATIONS}
          component={ConversationsScreen}
          options={{
            tabBarLabel: 'History',
            // tabBarIcon: ({ color, size }) => (
            //   <Icon name="clock" size={size} color={color} />
            // ),
          }}
        />
        <Tab.Screen
          name={ROUTES.SETTINGS}
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            // tabBarIcon: ({ color, size }) => (
            //   <Icon name="settings" size={size} color={color} />
            // ),
          }}
        />
      </Tab.Navigator>
    );
  }
);

// Root Stack Navigator
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer
      onStateChange={(state) => {
        // Track navigation performance
        const monitor = PerformanceMonitor.getInstance();
        console.log('[NAVIGATION] State changed', state?.routes?.[state.index]?.name);
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          presentation: 'card',
        }}
      >
        {/* Main app flow */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
        
        {/* Modal screens */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen
            name={ROUTES.AI_MODELS}
            component={SettingsScreen} // Placeholder
            options={{
              title: 'AI Models',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name={ROUTES.CLOUD_SYNC}
            component={SettingsScreen} // Placeholder
            options={{
              title: 'Cloud Sync',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name={ROUTES.MCP_SERVERS}
            component={SettingsScreen} // Placeholder
            options={{
              title: 'MCP Servers',
              headerShown: true,
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;