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

// NeuralEdge AI - Conversations History Screen
// AION Protocol Compliant with Vector Memory Integration

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenProps, Conversation } from '../../shared/types';
import { ROUTES, PERFORMANCE } from '../../shared/constants';
import { withPerformanceMonitoring, performanceUtils } from '../../shared/utils/performance';

interface ConversationsScreenProps extends ScreenProps {}

const ConversationsScreen: React.FC<ConversationsScreenProps> = ({ navigation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = withPerformanceMonitoring('ConversationsScreen.load', PERFORMANCE.MAX_RESPONSE_TIME)(
    async () => {
      try {
        // Simulate loading conversations from local storage/database
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock data - will be replaced with actual data loading
        const mockConversations: Conversation[] = [
          {
            id: '1',
            userId: 'user1',
            title: 'JavaScript Best Practices',
            summary: 'Discussed modern JavaScript patterns, async/await usage, and performance optimization techniques.',
            createdAt: new Date('2024-01-15T10:30:00'),
            lastInteraction: new Date('2024-01-15T11:15:00'),
            vectorCount: 15,
            interactions: [],
          },
          {
            id: '2',
            userId: 'user1',
            title: 'React Native Architecture',
            summary: 'Explored hexagonal architecture patterns for React Native apps and AION protocol compliance.',
            createdAt: new Date('2024-01-14T14:20:00'),
            lastInteraction: new Date('2024-01-14T15:45:00'),
            vectorCount: 23,
            interactions: [],
          },
          {
            id: '3',
            userId: 'user1',
            title: 'AI Model Optimization',
            summary: 'Talked about model quantization, ONNX runtime, and mobile AI inference optimization.',
            createdAt: new Date('2024-01-13T09:15:00'),
            lastInteraction: new Date('2024-01-13T10:30:00'),
            vectorCount: 18,
            interactions: [],
          },
          {
            id: '4',
            userId: 'user1',
            title: 'Vector Database Design',
            summary: 'Discussed ChromaDB integration, embedding strategies, and similarity search algorithms.',
            createdAt: new Date('2024-01-12T16:00:00'),
            lastInteraction: new Date('2024-01-12T17:20:00'),
            vectorCount: 31,
            interactions: [],
          },
          {
            id: '5',
            userId: 'user1',
            title: 'Security Implementation',
            summary: 'Covered biometric authentication, encryption strategies, and secure key storage.',
            createdAt: new Date('2024-01-11T13:45:00'),
            lastInteraction: new Date('2024-01-11T14:30:00'),
            vectorCount: 12,
            interactions: [],
          },
        ];

        setConversations(mockConversations);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        Alert.alert('Error', 'Failed to load conversations');
      }
    }
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadConversations();
      setIsLoading(false);
    };

    loadData();
  }, []);

  const onRefresh = performanceUtils.debounce(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, 500);

  const handleConversationPress = performanceUtils.debounce((conversation: Conversation) => {
    // Navigate to chat with the selected conversation context
    navigation.navigate(ROUTES.CHAT, { conversationId: conversation.id });
  }, 200);

  const handleDeleteConversation = (conversationId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setConversations(prev => prev.filter(c => c.id !== conversationId));
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.conversationDate}>
            {formatDate(item.lastInteraction)}
          </Text>
        </View>
        
        <Text style={styles.conversationSummary} numberOfLines={2}>
          {item.summary}
        </Text>
        
        <View style={styles.conversationFooter}>
          <View style={styles.vectorInfo}>
            <View style={styles.vectorDot} />
            <Text style={styles.vectorCount}>{item.vectorCount} memories</Text>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteConversation(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No conversations yet</Text>
      <Text style={styles.emptyStateText}>
        Start a new chat to begin building your AI conversation history.
      </Text>
      <TouchableOpacity
        style={styles.startChatButton}
        onPress={() => navigation.navigate(ROUTES.CHAT)}
      >
        <Text style={styles.startChatButtonText}>Start First Chat</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversations</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversations</Text>
        <Text style={styles.headerSubtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  conversationDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  conversationSummary: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vectorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginRight: 6,
  },
  vectorCount: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startChatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ConversationsScreen;