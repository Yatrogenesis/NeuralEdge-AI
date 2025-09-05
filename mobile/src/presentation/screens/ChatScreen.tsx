// NeuralEdge AI - Chat Screen
// AION Protocol Compliant Chat Interface with Vector Memory

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenProps, Interaction } from '../../shared/types';
import { PERFORMANCE } from '../../shared/constants';
import { withPerformanceMonitoring, performanceUtils } from '../../shared/utils/performance';

interface ChatScreenProps extends ScreenProps {}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  processing?: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your NeuralEdge AI assistant. I can help you with various tasks using local AI processing and vector memory. How can I assist you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const processAIResponse = withPerformanceMonitoring('ChatScreen.processAI', PERFORMANCE.MAX_RESPONSE_TIME)(
    async (userInput: string): Promise<string> => {
      // Simulate AI processing with local inference
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate inference time
      
      // Simple response generation (will be replaced with actual AI inference)
      const responses = [
        `I understand you're asking about "${userInput}". Let me process this with my vector memory system.`,
        `Based on our conversation history, I can help you with "${userInput}". Here's what I think...`,
        `Interesting question about "${userInput}". Using my local AI processing, here's my response...`,
        `I've analyzed your input "${userInput}" using context from our previous interactions. Here's my answer...`,
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
  );

  const handleSendMessage = performanceUtils.debounce(async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const processingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Processing...',
      isUser: false,
      timestamp: new Date(),
      processing: true,
    };

    setMessages(prev => [...prev, userMessage, processingMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const aiResponse = await processAIResponse(userMessage.text);
      
      // Replace processing message with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        const processingIndex = newMessages.findIndex(m => m.processing);
        if (processingIndex !== -1) {
          newMessages[processingIndex] = {
            id: Date.now().toString(),
            text: aiResponse,
            isUser: false,
            timestamp: new Date(),
          };
        }
        return newMessages;
      });
      
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Replace processing message with error message
      setMessages(prev => {
        const newMessages = [...prev];
        const processingIndex = newMessages.findIndex(m => m.processing);
        if (processingIndex !== -1) {
          newMessages[processingIndex] = {
            id: Date.now().toString(),
            text: 'Sorry, I encountered an error processing your request. Please try again.',
            isUser: false,
            timestamp: new Date(),
          };
        }
        return newMessages;
      });
      
      Alert.alert('Error', 'Failed to process your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, 200);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.aiMessageText,
            message.processing && styles.processingText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            message.isUser ? styles.userTimestamp : styles.aiTimestamp,
          ]}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Chat</Text>
          <View style={styles.headerRight}>
            <View style={[styles.statusDot, styles.onlineStatus]} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSendMessage}
            editable={!isProcessing}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isProcessing) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
          >
            <Text style={styles.sendButtonText}>
              {isProcessing ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineStatus: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#1f2937',
  },
  processingText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#e5e7eb',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    color: '#1f2937',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;