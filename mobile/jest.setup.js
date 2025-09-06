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

// NeuralEdge AI - Jest Test Setup
// AION Protocol Compliant Testing Configuration

import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native Keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve(true)),
  getInternetCredentials: jest.fn(() => Promise.resolve({ username: 'test', password: 'test' })),
  resetInternetCredentials: jest.fn(() => Promise.resolve(true)),
  canImplyAuthentication: jest.fn(() => Promise.resolve(true)),
  getSupportedBiometryType: jest.fn(() => Promise.resolve('TouchID')),
}));

// Mock React Native Biometrics
jest.mock('react-native-biometrics', () => ({
  BiometryTypes: {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
  },
  createKeys: jest.fn(() => Promise.resolve({ publicKey: 'mockPublicKey' })),
  biometricKeysExist: jest.fn(() => Promise.resolve({ keysExist: true })),
  deleteKeys: jest.fn(() => Promise.resolve({ keysDeleted: true })),
  createSignature: jest.fn(() => Promise.resolve({ success: true, signature: 'mockSignature' })),
  simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
  isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'TouchID' })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock React Native Screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Performance monitoring mock for AION compliance testing
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
};

// Console setup for test environment
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Ignore known React Native warnings in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: React.createElement') ||
     args[0].includes('Warning: componentWillMount') ||
     args[0].includes('Warning: componentWillReceiveProps'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Ignore known React Native warnings in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated: `useNativeDriver`') ||
     args[0].includes('VirtualizedLists should never be nested'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Global test timeout for AION compliance (1ms requirement)
jest.setTimeout(30000);

// Custom matchers for AION Protocol compliance
expect.extend({
  toMeetAIONPerformanceRequirement(received, threshold = 1.0) {
    const pass = received <= threshold;
    if (pass) {
      return {
        message: () =>
          `expected ${received}ms to exceed AION performance threshold of ${threshold}ms`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received}ms to be within AION performance threshold of ${threshold}ms`,
        pass: false,
      };
    }
  },
  
  toHaveValidSecurityContext(received) {
    const pass = received &&
                 typeof received.userId === 'string' &&
                 typeof received.sessionId === 'string' &&
                 typeof received.biometricVerified === 'boolean';
    
    if (pass) {
      return {
        message: () => `expected security context to be invalid`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected valid security context with userId, sessionId, and biometricVerified`,
        pass: false,
      };
    }
  },
  
  toBeEncrypted(received) {
    const pass = typeof received === 'string' && 
                 received.includes(':') && // IV:ciphertext:authTag format
                 received.length > 32; // Minimum encrypted data length
    
    if (pass) {
      return {
        message: () => `expected data to not be encrypted`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected data to be encrypted in proper format`,
        pass: false,
      };
    }
  },
});

// Global setup for performance tests
global.setupPerformanceTest = (testName, maxDurationMs = 1.0) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - startTime;
      expect(duration).toMeetAIONPerformanceRequirement(maxDurationMs);
      return duration;
    },
  };
};

// Mock fetch for network requests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  // Clear performance measurements
  if (global.performance && global.performance.clearMarks) {
    global.performance.clearMarks();
    global.performance.clearMeasures();
  }
});

// Setup for React Testing Library
import '@testing-library/jest-native/extend-expect';