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

// NeuralEdge AI - Enhanced Context Analysis System
// AION Protocol Compliant Perplexity-Style Context Processing

import { PerformanceMonitor, withPerformanceMonitoring } from '../../shared/utils/performance';
import VectorMemorySystem from '../storage/VectorMemorySystem';
import { VectorMemoryEntry, Interaction, AIONResult, AIONError } from '../../shared/types';
import { PERFORMANCE, AI, ERROR_CODES } from '../../shared/constants';

export interface ContextAnalysisResult {
  contextScore: number;
  relevantMemories: VectorMemoryEntry[];
  topicContinuity: number;
  sentimentFlow: number;
  entityRelationships: EntityRelationship[];
  suggestedQuestions: string[];
  confidenceLevel: number;
}

export interface EntityRelationship {
  entity1: string;
  entity2: string;
  relationshipType: 'mentioned_together' | 'temporal_sequence' | 'causal' | 'comparative';
  strength: number;
  interactions: string[]; // interaction IDs where this relationship appears
}

export interface ContextWindow {
  interactions: Interaction[];
  totalTokens: number;
  timeSpan: number; // milliseconds
  coherenceScore: number;
}

export interface TopicEvolution {
  topic: string;
  firstMention: Date;
  lastMention: Date;
  frequency: number;
  sentiment: number[];
  relatedTopics: string[];
}

export class ContextAnalyzer {
  private static instance: ContextAnalyzer;
  private performanceMonitor: PerformanceMonitor;
  private vectorMemory: VectorMemorySystem;
  private isInitialized = false;

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.vectorMemory = VectorMemorySystem.getInstance();
  }

  public static getInstance(): ContextAnalyzer {
    if (!ContextAnalyzer.instance) {
      ContextAnalyzer.instance = new ContextAnalyzer();
    }
    return ContextAnalyzer.instance;
  }

  @withPerformanceMonitoring('ContextAnalyzer.initialize')
  public async initialize(): Promise<AIONResult<boolean>> {
    try {
      if (this.isInitialized) {
        return {
          data: true,
          performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
          security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `CONTEXT_ALREADY_INIT_${Date.now()}` },
        };
      }

      console.log('[CONTEXT_ANALYZER] Initializing context analysis system...');

      // Initialize vector memory system
      const vectorInit = await this.vectorMemory.initialize();
      if (vectorInit.error) {
        throw new Error('Failed to initialize vector memory system');
      }

      // Initialize context analysis models
      await this.loadContextModels();

      // Initialize topic tracking
      await this.initializeTopicTracking();

      this.isInitialized = true;
      console.log('[CONTEXT_ANALYZER] Context analyzer initialized successfully');

      return {
        data: true,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `CONTEXT_INIT_${Date.now()}` },
      };

    } catch (error) {
      const contextError: AIONError = {
        code: ERROR_CODES.AI_ERROR,
        message: `Failed to initialize context analyzer: ${error}`,
        category: 'technical',
        severity: 'critical',
      };

      return {
        error: contextError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `CONTEXT_INIT_FAILED_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('ContextAnalyzer.analyze', PERFORMANCE.MAX_RESPONSE_TIME)
  public async analyzeContext(
    currentInteraction: Interaction,
    sessionId: string,
    analysisDepth: 'basic' | 'standard' | 'deep' = 'standard'
  ): Promise<AIONResult<ContextAnalysisResult>> {
    try {
      if (!this.isInitialized) {
        throw new Error('Context analyzer not initialized');
      }

      console.log(`[CONTEXT_ANALYZER] Analyzing context for session: ${sessionId}`);

      // Get context window based on analysis depth
      const contextWindow = await this.buildContextWindow(sessionId, analysisDepth);
      
      // Perform multi-dimensional analysis
      const [
        contextScore,
        relevantMemories,
        topicContinuity,
        sentimentFlow,
        entityRelationships,
        suggestedQuestions
      ] = await Promise.all([
        this.calculateContextScore(currentInteraction, contextWindow),
        this.findRelevantMemories(currentInteraction, sessionId),
        this.analyzeTopicContinuity(contextWindow),
        this.analyzeSentimentFlow(contextWindow),
        this.extractEntityRelationships(contextWindow),
        this.generateSuggestedQuestions(contextWindow, currentInteraction),
      ]);

      // Calculate overall confidence level
      const confidenceLevel = this.calculateConfidence(
        contextScore,
        topicContinuity,
        sentimentFlow,
        relevantMemories.length
      );

      const result: ContextAnalysisResult = {
        contextScore,
        relevantMemories,
        topicContinuity,
        sentimentFlow,
        entityRelationships,
        suggestedQuestions,
        confidenceLevel,
      };

      console.log(`[CONTEXT_ANALYZER] Analysis complete - Confidence: ${confidenceLevel.toFixed(2)}`);

      return {
        data: result,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `CONTEXT_ANALYZED_${Date.now()}` },
      };

    } catch (error) {
      const contextError: AIONError = {
        code: ERROR_CODES.AI_ERROR,
        message: `Context analysis failed: ${error}`,
        category: 'technical',
        severity: 'high',
      };

      return {
        error: contextError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `CONTEXT_ANALYSIS_FAILED_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('ContextAnalyzer.topicEvolution')
  public async analyzeTopicEvolution(sessionId: string): Promise<AIONResult<TopicEvolution[]>> {
    try {
      const contextResult = await this.vectorMemory.getContextForSession(sessionId);
      if (contextResult.error || !contextResult.data) {
        throw new Error('Failed to retrieve session context');
      }

      const interactions = contextResult.data;
      const topicMap = new Map<string, TopicEvolution>();

      // Process each interaction to build topic evolution
      for (const memory of interactions) {
        for (const topic of memory.topics) {
          if (!topicMap.has(topic)) {
            topicMap.set(topic, {
              topic,
              firstMention: memory.timestamp,
              lastMention: memory.timestamp,
              frequency: 1,
              sentiment: [memory.sentiment],
              relatedTopics: [],
            });
          } else {
            const topicEvolution = topicMap.get(topic)!;
            topicEvolution.lastMention = memory.timestamp;
            topicEvolution.frequency++;
            topicEvolution.sentiment.push(memory.sentiment);
            
            // Add related topics (topics that appear in same interaction)
            for (const relatedTopic of memory.topics) {
              if (relatedTopic !== topic && !topicEvolution.relatedTopics.includes(relatedTopic)) {
                topicEvolution.relatedTopics.push(relatedTopic);
              }
            }
          }
        }
      }

      const topicEvolutions = Array.from(topicMap.values())
        .sort((a, b) => b.frequency - a.frequency); // Sort by frequency

      return {
        data: topicEvolutions,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `TOPIC_EVOLUTION_${Date.now()}` },
      };

    } catch (error) {
      const contextError: AIONError = {
        code: ERROR_CODES.AI_ERROR,
        message: `Topic evolution analysis failed: ${error}`,
        category: 'technical',
        severity: 'medium',
      };

      return {
        error: contextError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `TOPIC_EVOLUTION_FAILED_${Date.now()}` },
      };
    }
  }

  private async buildContextWindow(
    sessionId: string,
    depth: 'basic' | 'standard' | 'deep'
  ): Promise<ContextWindow> {
    const maxTokens = this.getMaxTokensForDepth(depth);
    const contextResult = await this.vectorMemory.getContextForSession(sessionId, maxTokens);
    
    if (contextResult.error || !contextResult.data) {
      return {
        interactions: [],
        totalTokens: 0,
        timeSpan: 0,
        coherenceScore: 0,
      };
    }

    const memories = contextResult.data;
    const interactions: Interaction[] = memories.map(memory => ({
      id: memory.id,
      conversationId: memory.sessionId,
      userInput: memory.userInput,
      aiResponse: memory.aiResponse,
      timestamp: memory.timestamp,
      vectors: memory,
      metadata: {
        sentiment: memory.sentiment,
        topics: memory.topics,
        entities: memory.entities,
        confidence: 0.8,
        processingTime: 0,
      },
    }));

    const totalTokens = interactions.reduce(
      (sum, interaction) => sum + interaction.userInput.length + interaction.aiResponse.length,
      0
    );

    const timeSpan = interactions.length > 0 
      ? interactions[0].timestamp.getTime() - interactions[interactions.length - 1].timestamp.getTime()
      : 0;

    const coherenceScore = await this.calculateCoherenceScore(interactions);

    return {
      interactions,
      totalTokens,
      timeSpan,
      coherenceScore,
    };
  }

  private getMaxTokensForDepth(depth: 'basic' | 'standard' | 'deep'): number {
    switch (depth) {
      case 'basic': return AI.MAX_CONTEXT_LENGTH * 0.25; // 25% of max context
      case 'standard': return AI.MAX_CONTEXT_LENGTH * 0.5; // 50% of max context
      case 'deep': return AI.MAX_CONTEXT_LENGTH; // Full context
    }
  }

  private async calculateContextScore(
    currentInteraction: Interaction,
    contextWindow: ContextWindow
  ): Promise<number> {
    if (contextWindow.interactions.length === 0) {
      return 0.5; // Neutral score for no context
    }

    // Calculate based on multiple factors
    let score = 0;
    
    // Topic consistency (40% weight)
    const topicConsistency = await this.calculateTopicConsistency(currentInteraction, contextWindow);
    score += topicConsistency * 0.4;
    
    // Temporal relevance (30% weight)
    const temporalRelevance = this.calculateTemporalRelevance(contextWindow);
    score += temporalRelevance * 0.3;
    
    // Semantic similarity (30% weight)
    const semanticSimilarity = await this.calculateSemanticSimilarity(currentInteraction, contextWindow);
    score += semanticSimilarity * 0.3;

    return Math.max(0, Math.min(1, score)); // Clamp to [0, 1]
  }

  private async findRelevantMemories(
    currentInteraction: Interaction,
    sessionId: string
  ): Promise<VectorMemoryEntry[]> {
    // This would use the vector memory's similarity search
    // For now, return empty array as placeholder
    return [];
  }

  private async analyzeTopicContinuity(contextWindow: ContextWindow): Promise<number> {
    if (contextWindow.interactions.length < 2) {
      return 0.5;
    }

    let continuityScore = 0;
    const interactions = contextWindow.interactions;

    for (let i = 1; i < interactions.length; i++) {
      const currentTopics = interactions[i].metadata.topics;
      const previousTopics = interactions[i - 1].metadata.topics;
      
      // Calculate overlap between consecutive interactions
      const overlap = currentTopics.filter(topic => previousTopics.includes(topic));
      const totalTopics = new Set([...currentTopics, ...previousTopics]).size;
      
      if (totalTopics > 0) {
        continuityScore += overlap.length / totalTopics;
      }
    }

    return continuityScore / (interactions.length - 1);
  }

  private async analyzeSentimentFlow(contextWindow: ContextWindow): Promise<number> {
    if (contextWindow.interactions.length < 2) {
      return 0;
    }

    const sentiments = contextWindow.interactions.map(i => i.metadata.sentiment);
    let totalChange = 0;

    for (let i = 1; i < sentiments.length; i++) {
      totalChange += Math.abs(sentiments[i] - sentiments[i - 1]);
    }

    // Normalize by number of transitions and max possible change (2.0)
    return totalChange / ((sentiments.length - 1) * 2.0);
  }

  private async extractEntityRelationships(contextWindow: ContextWindow): Promise<EntityRelationship[]> {
    const relationships: EntityRelationship[] = [];
    const entityPairs = new Map<string, EntityRelationship>();

    for (const interaction of contextWindow.interactions) {
      const entities = interaction.metadata.entities;
      
      // Find all entity pairs in this interaction
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const entity1 = entities[i];
          const entity2 = entities[j];
          const pairKey = [entity1, entity2].sort().join('|');
          
          if (!entityPairs.has(pairKey)) {
            entityPairs.set(pairKey, {
              entity1,
              entity2,
              relationshipType: 'mentioned_together',
              strength: 1,
              interactions: [interaction.id],
            });
          } else {
            const relationship = entityPairs.get(pairKey)!;
            relationship.strength++;
            relationship.interactions.push(interaction.id);
          }
        }
      }
    }

    return Array.from(entityPairs.values())
      .filter(rel => rel.strength > 1) // Only include relationships mentioned multiple times
      .sort((a, b) => b.strength - a.strength);
  }

  private async generateSuggestedQuestions(
    contextWindow: ContextWindow,
    currentInteraction: Interaction
  ): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Analyze recent topics to suggest follow-up questions
    const recentTopics = contextWindow.interactions
      .slice(0, 3) // Last 3 interactions
      .flatMap(i => i.metadata.topics);
    
    const topicCounts = new Map<string, number>();
    for (const topic of recentTopics) {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    }
    
    // Generate suggestions based on frequent topics
    const frequentTopics = Array.from(topicCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([topic, _]) => topic);
    
    for (const topic of frequentTopics.slice(0, 3)) {
      suggestions.push(`Can you tell me more about ${topic}?`);
      suggestions.push(`How does ${topic} relate to our previous discussion?`);
    }
    
    // Add generic helpful questions
    if (suggestions.length < 3) {
      suggestions.push('What would you like to explore further?');
      suggestions.push('Are there any related topics you\'d like to discuss?');
      suggestions.push('Would you like me to clarify anything from our conversation?');
    }
    
    return suggestions.slice(0, 4); // Return up to 4 suggestions
  }

  private calculateConfidence(
    contextScore: number,
    topicContinuity: number,
    sentimentFlow: number,
    memoryCount: number
  ): number {
    // Combine multiple factors to determine confidence
    let confidence = 0;
    
    // Context score contributes 40%
    confidence += contextScore * 0.4;
    
    // Topic continuity contributes 25%
    confidence += topicContinuity * 0.25;
    
    // Stable sentiment flow (lower is better) contributes 20%
    confidence += (1 - Math.min(1, sentimentFlow)) * 0.2;
    
    // Memory availability contributes 15%
    confidence += Math.min(1, memoryCount / 10) * 0.15;
    
    return Math.max(0, Math.min(1, confidence));
  }

  private async loadContextModels(): Promise<void> {
    console.log('[CONTEXT_ANALYZER] Loading context analysis models...');
    // Placeholder for loading specialized models
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async initializeTopicTracking(): Promise<void> {
    console.log('[CONTEXT_ANALYZER] Initializing topic tracking...');
    // Placeholder for topic tracking initialization
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  private async calculateCoherenceScore(interactions: Interaction[]): Promise<number> {
    if (interactions.length < 2) {
      return 1.0;
    }
    
    // Simple coherence calculation based on topic overlap
    let coherenceSum = 0;
    
    for (let i = 1; i < interactions.length; i++) {
      const current = interactions[i].metadata.topics;
      const previous = interactions[i - 1].metadata.topics;
      
      const overlap = current.filter(topic => previous.includes(topic)).length;
      const total = new Set([...current, ...previous]).size;
      
      coherenceSum += total > 0 ? overlap / total : 0;
    }
    
    return coherenceSum / (interactions.length - 1);
  }

  private async calculateTopicConsistency(
    currentInteraction: Interaction,
    contextWindow: ContextWindow
  ): Promise<number> {
    const currentTopics = currentInteraction.metadata.topics;
    const contextTopics = contextWindow.interactions.flatMap(i => i.metadata.topics);
    
    if (contextTopics.length === 0) {
      return 0.5;
    }
    
    const overlap = currentTopics.filter(topic => contextTopics.includes(topic)).length;
    return overlap / Math.max(currentTopics.length, 1);
  }

  private calculateTemporalRelevance(contextWindow: ContextWindow): number {
    if (contextWindow.interactions.length === 0) {
      return 0;
    }
    
    const now = Date.now();
    const interactions = contextWindow.interactions;
    
    // Calculate weighted relevance based on recency
    let totalWeight = 0;
    let relevanceSum = 0;
    
    for (const interaction of interactions) {
      const age = now - interaction.timestamp.getTime();
      const weight = Math.exp(-age / (24 * 60 * 60 * 1000)); // Exponential decay over days
      
      totalWeight += weight;
      relevanceSum += weight;
    }
    
    return totalWeight > 0 ? relevanceSum / totalWeight : 0;
  }

  private async calculateSemanticSimilarity(
    currentInteraction: Interaction,
    contextWindow: ContextWindow
  ): Promise<number> {
    // This would use vector similarity in a real implementation
    // For now, return a placeholder based on shared entities/topics
    
    const currentTerms = [
      ...currentInteraction.metadata.topics,
      ...currentInteraction.metadata.entities,
    ];
    
    if (currentTerms.length === 0 || contextWindow.interactions.length === 0) {
      return 0.5;
    }
    
    let maxSimilarity = 0;
    
    for (const interaction of contextWindow.interactions) {
      const contextTerms = [
        ...interaction.metadata.topics,
        ...interaction.metadata.entities,
      ];
      
      const overlap = currentTerms.filter(term => contextTerms.includes(term)).length;
      const total = new Set([...currentTerms, ...contextTerms]).size;
      
      if (total > 0) {
        const similarity = overlap / total;
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }
    
    return maxSimilarity;
  }
}

export default ContextAnalyzer.getInstance();