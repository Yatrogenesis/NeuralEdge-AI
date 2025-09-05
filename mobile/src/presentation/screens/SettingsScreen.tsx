// NeuralEdge AI - Settings Screen
// AION Protocol Compliant Settings with Security & Performance Controls

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenProps } from '../../shared/types';
import { ROUTES, FEATURES } from '../../shared/constants';
import { withPerformanceMonitoring, performanceUtils } from '../../shared/utils/performance';

interface SettingsScreenProps extends ScreenProps {}

interface SettingsState {
  biometricAuth: boolean;
  localAIInference: boolean;
  cloudSync: boolean;
  performanceMonitoring: boolean;
  offlineMode: boolean;
  autoBackup: boolean;
  dataEncryption: boolean;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<SettingsState>({
    biometricAuth: true,
    localAIInference: true,
    cloudSync: false,
    performanceMonitoring: true,
    offlineMode: false,
    autoBackup: true,
    dataEncryption: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = withPerformanceMonitoring('SettingsScreen.load')(
    async () => {
      try {
        // Load settings from secure storage
        // This would integrate with AsyncStorage/Keychain
        console.log('Loading settings...');
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleSetting = performanceUtils.debounce(
    (settingKey: keyof SettingsState, value: boolean) => {
      setSettings(prev => ({ ...prev, [settingKey]: value }));
      
      // Show confirmation for critical settings
      if (settingKey === 'dataEncryption' && !value) {
        Alert.alert(
          'Security Warning',
          'Disabling data encryption will make your data less secure. Are you sure?',
          [
            { text: 'Cancel', onPress: () => setSettings(prev => ({ ...prev, [settingKey]: true })) },
            { text: 'Disable', style: 'destructive' },
          ]
        );
      }
      
      console.log(`Setting ${settingKey} changed to:`, value);
    },
    200
  );

  const handleNavigateToScreen = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    disabled = false
  ) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, disabled && styles.settingDescriptionDisabled]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
        thumbColor={value ? '#ffffff' : '#f4f4f5'}
      />
    </View>
  );

  const renderNavigationItem = (
    title: string,
    description: string,
    routeName: string,
    badge?: string
  ) => (
    <TouchableOpacity
      style={styles.navigationItem}
      onPress={() => handleNavigateToScreen(routeName)}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View style={styles.navigationHeader}>
          <Text style={styles.settingTitle}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Text style={styles.navigationArrow}>›</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure your NeuralEdge AI experience</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Settings */}
        {renderSectionHeader('Security & Privacy')}
        {renderSettingItem(
          'Biometric Authentication',
          'Use fingerprint or face recognition for secure access',
          settings.biometricAuth,
          (value) => handleToggleSetting('biometricAuth', value),
          !FEATURES.BIOMETRIC_AUTH
        )}
        {renderSettingItem(
          'Data Encryption',
          'Encrypt all local data and conversations',
          settings.dataEncryption,
          (value) => handleToggleSetting('dataEncryption', value)
        )}

        {/* AI Settings */}
        {renderSectionHeader('AI Configuration')}
        {renderSettingItem(
          'Local AI Inference',
          'Process AI requests locally for privacy',
          settings.localAIInference,
          (value) => handleToggleSetting('localAIInference', value),
          !FEATURES.LOCAL_AI_INFERENCE
        )}
        {renderNavigationItem(
          'AI Models',
          'Manage downloaded AI models and performance settings',
          ROUTES.AI_MODELS,
          'Local'
        )}
        {renderNavigationItem(
          'Vector Memory',
          'Configure context analysis and memory retention',
          ROUTES.VECTOR_MEMORY
        )}

        {/* Cloud & Sync Settings */}
        {renderSectionHeader('Cloud & Backup')}
        {renderSettingItem(
          'Cloud Sync',
          'Sync conversations across devices securely',
          settings.cloudSync,
          (value) => handleToggleSetting('cloudSync', value),
          !FEATURES.CLOUD_SYNC
        )}
        {renderSettingItem(
          'Auto Backup',
          'Automatically backup conversations to cloud',
          settings.autoBackup,
          (value) => handleToggleSetting('autoBackup', value)
        )}
        {renderNavigationItem(
          'Cloud Providers',
          'Manage CloudFlare, iCloud, Dropbox, and other providers',
          ROUTES.CLOUD_SYNC
        )}

        {/* Performance & Monitoring */}
        {renderSectionHeader('Performance')}
        {renderSettingItem(
          'Performance Monitoring',
          'Track app performance and AION compliance',
          settings.performanceMonitoring,
          (value) => handleToggleSetting('performanceMonitoring', value),
          !FEATURES.PERFORMANCE_MONITORING
        )}
        {renderSettingItem(
          'Offline Mode',
          'Enable full functionality without internet',
          settings.offlineMode,
          (value) => handleToggleSetting('offlineMode', value),
          !FEATURES.OFFLINE_MODE
        )}
        {renderNavigationItem(
          'Performance Monitor',
          'View detailed performance metrics and diagnostics',
          ROUTES.PERFORMANCE_MONITOR
        )}

        {/* Integration Settings */}
        {renderSectionHeader('Integrations')}
        {renderNavigationItem(
          'MCP Servers',
          'Connect to Model Context Protocol servers',
          ROUTES.MCP_SERVERS,
          FEATURES.MCP_INTEGRATION ? 'Available' : 'Coming Soon'
        )}

        {/* System Settings */}
        {renderSectionHeader('System')}
        {renderNavigationItem(
          'Security Audit',
          'View security status and recommendations',
          ROUTES.SECURITY_AUDIT
        )}

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>NeuralEdge AI v1.0.0</Text>
          <Text style={styles.versionSubtext}>AION Protocol v2.0 Compliant</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingTitleDisabled: {
    color: '#9ca3af',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  settingDescriptionDisabled: {
    color: '#d1d5db',
  },
  navigationArrow: {
    fontSize: 20,
    color: '#9ca3af',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default SettingsScreen;