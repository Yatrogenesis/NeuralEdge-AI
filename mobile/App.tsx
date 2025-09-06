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

// NeuralEdge AI - Main Application Entry Point
// AION Protocol Compliant Mobile Application

import React, { useEffect, useState } from 'react';
import { StatusBar, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/presentation/navigation/AppNavigator';
import { PerformanceMonitor, performanceUtils } from './src/shared/utils/performance';
import { PERFORMANCE } from './src/shared/constants';

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const monitor = PerformanceMonitor.getInstance();
      const operationId = 'app_initialization';
      
      try {
        monitor.startMeasure(operationId, PERFORMANCE.MAX_COLD_START);
        
        // Preload critical resources for cold start optimization
        await performanceUtils.preloadCriticalResources();
        
        // Initialize security systems
        // await SecurityManager.initialize();
        
        // Initialize AI engine
        // await AIEngine.initialize();
        
        // Initialize vector memory system
        // await VectorMemorySystem.initialize();
        
        const metrics = monitor.endMeasure(operationId);
        monitor.validatePerformance(metrics);
        
        console.log(`[APP] Initialized in ${metrics.duration}ms`);
        setIsAppReady(true);
        
      } catch (error) {
        console.error('[APP] Initialization failed:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize the application. Please restart the app.',
          [{ text: 'OK' }]
        );
      }
    };

    initializeApp();
  }, []);

  if (!isAppReady) {
    // Show minimal loading screen to meet cold start requirements
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#ffffff" 
        translucent={false}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
