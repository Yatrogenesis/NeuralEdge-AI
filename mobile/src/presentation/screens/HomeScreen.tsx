// NeuralEdge AI - Home Screen
// AION Protocol Compliant with Performance Monitoring

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ScreenProps } from '../../shared/types';
import { ROUTES, PERFORMANCE } from '../../shared/constants';
import { withPerformanceMonitoring, performanceUtils } from '../../shared/utils/performance';

interface HomeScreenProps extends ScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    vectorMemories: 0,
    lastSync: null as Date | null,
    aiModel: 'local',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = withPerformanceMonitoring('HomeScreen.loadData', PERFORMANCE.MAX_RESPONSE_TIME)(
      async () => {
        try {
          // Simulate loading dashboard data
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
          
          setMetrics({
            totalConversations: 12,
            vectorMemories: 1247,
            lastSync: new Date(),
            aiModel: 'local',
          });
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
          Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
          setIsLoading(false);
        }
      }
    );

    loadDashboardData();
  }, []);

  const handleQuickAction = performanceUtils.debounce((action: string) => {
    switch (action) {
      case 'newChat':
        navigation.navigate(ROUTES.CHAT);
        break;
      case 'viewHistory':
        navigation.navigate(ROUTES.CONVERSATIONS);
        break;
      case 'settings':
        navigation.navigate(ROUTES.SETTINGS);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, 200);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appName}>NeuralEdge AI</Text>
            <Text style={styles.subtitle}>Your Local AI Companion</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{metrics.totalConversations}</Text>
              <Text style={styles.statLabel}>Conversations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{metrics.vectorMemories.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{metrics.aiModel.toUpperCase()}</Text>
              <Text style={styles.statLabel}>AI Model</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => handleQuickAction('newChat')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionText}>Start New Chat</Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => handleQuickAction('viewHistory')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryActionText}>View History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => handleQuickAction('settings')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryActionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>System Status</Text>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.statusOnline]} />
              <Text style={styles.statusText}>AI Engine: Online</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.statusOnline]} />
              <Text style={styles.statusText}>Vector Memory: Active</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, 
                metrics.lastSync ? styles.statusOnline : styles.statusOffline
              ]} />
              <Text style={styles.statusText}>
                Cloud Sync: {metrics.lastSync ? 'Synced' : 'Offline'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  statusCard: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusOnline: {
    backgroundColor: '#10b981',
  },
  statusOffline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
  },
});

export default HomeScreen;