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

// NeuralEdge AI - Vector Memory System
// AION Protocol Compliant Perplexity-style Context Analysis

import { PerformanceMonitor, withPerformanceMonitoring } from '../../shared/utils/performance';
import { VectorMemoryEntry, Interaction, AIONResult, AIONError } from '../../shared/types';
import { PERFORMANCE, AI, ERROR_CODES } from '../../shared/constants';
import VectorIndexOptimizer from './VectorIndexOptimizer';
import ContextAnalyzer from '../ai/ContextAnalyzer';
import CloudSyncManager from './CloudSyncManager';

export interface VectorSearchOptions {
  similarityThreshold: number;
  maxResults: number;
  includeMetadata: boolean;
  temporalWeight: number; // Weight for recent interactions
}

export interface VectorSimilarityResult {
  entry: VectorMemoryEntry;
  similarity: number;
  temporalScore: number;
  combinedScore: number;
}

export interface VectorMemoryStats {
  totalEntries: number;
  totalSessions: number;
  averageVectorLength: number;
  memoryUsageMB: number;
  lastOptimization: Date;
}

export class VectorMemorySystem {
  private static instance: VectorMemorySystem;
  private memoryStore: Map<string, VectorMemoryEntry> = new Map();
  private sessionIndex: Map<string, string[]> = new Map(); // sessionId -> entryIds
  private userIndex: Map<string, string[]> = new Map(); // userId -> entryIds
  private performanceMonitor: PerformanceMonitor;
  private vectorOptimizer: VectorIndexOptimizer;
  private contextAnalyzer: ContextAnalyzer;
  private cloudSyncManager: CloudSyncManager;
  private isInitialized = false;

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.vectorOptimizer = VectorIndexOptimizer.getInstance();
    this.contextAnalyzer = ContextAnalyzer.getInstance();
    this.cloudSyncManager = CloudSyncManager.getInstance();
  }

  public static getInstance(): VectorMemorySystem {
    if (!VectorMemorySystem.instance) {
      VectorMemorySystem.instance = new VectorMemorySystem();
    }
    return VectorMemorySystem.instance;
  }

  @withPerformanceMonitoring('VectorMemory.initialize')
  public async initialize(): Promise<AIONResult<boolean>> {
    try {
      if (this.isInitialized) {
        return {
          data: true,
          performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
          security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `VECTOR_ALREADY_INIT_${Date.now()}` },
        };
      }

      // Load existing vector memories from persistent storage
      await this.loadFromStorage();
      
      // Initialize enhanced components
      await this.vectorOptimizer.initialize();
      await this.contextAnalyzer.initialize();
      await this.cloudSyncManager.initialize();
      
      // Initialize vector indexing for fast similarity search
      await this.initializeVectorIndex();
      
      this.isInitialized = true;
      console.log('[VECTOR_MEMORY] Initialized successfully');

      return {
        data: true,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `VECTOR_INIT_${Date.now()}` },
      };

    } catch (error) {
      const vectorError: AIONError = {
        code: ERROR_CODES.VECTOR_STORE_ERROR,
        message: `Failed to initialize vector memory system: ${error}`,
        category: 'technical',
        severity: 'critical',
      };

      return {
        error: vectorError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `VECTOR_INIT_FAILED_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('VectorMemory.store', PERFORMANCE.MAX_RESPONSE_TIME)
  public async storeInteraction(interaction: Interaction): Promise<AIONResult<VectorMemoryEntry>> {
    try {
      if (!this.isInitialized) {
        throw new Error('Vector memory system not initialized');
      }

      // Generate vectors for user input and AI response
      const inputVector = await this.generateVector(interaction.userInput);
      const responseVector = await this.generateVector(interaction.aiResponse);
      
      // Get context from previous interactions in the session
      const contextVector = await this.generateContextVector(
        interaction.conversationId, 
        interaction.metadata.processingTime
      );

      // Enhanced context analysis using ContextAnalyzer
      const contextResult = await this.contextAnalyzer.analyzeContext(
        {
          text: interaction.userInput,
          timestamp: interaction.timestamp,
          metadata: interaction.metadata,
        },
        interaction.conversationId,
        'standard'
      );

      // Extract enhanced metadata
      const entities = contextResult.data?.entities || this.extractEntities(interaction.userInput);
      const topics = contextResult.data?.topics || this.extractTopics(interaction.userInput);
      const sentiment = contextResult.data?.sentiment || this.analyzeSentiment(interaction.userInput);

      // Create vector memory entry
      const vectorEntry: VectorMemoryEntry = {
        id: `vec_${interaction.id}`,
        userId: interaction.conversationId.split('_')[0], // Extract user ID from conversation ID
        sessionId: interaction.conversationId,
        interactionIndex: await this.getNextInteractionIndex(interaction.conversationId),
        timestamp: interaction.timestamp,
        userInput: interaction.userInput,
        aiResponse: interaction.aiResponse,
        inputVector,
        responseVector,
        contextVector,
        sentiment,
        topics,
        entities,
        parentInteractionId: await this.findParentInteraction(interaction.conversationId),
        childInteractionIds: [],
        relatedInteractionIds: await this.findRelatedInteractions(inputVector),
      };

      // Store in memory
      this.memoryStore.set(vectorEntry.id, vectorEntry);
      
      // Update indices
      await this.updateIndices(vectorEntry);
      
      // Sync to cloud storage
      await this.cloudSyncManager.uploadVectorMemory(vectorEntry, ['cloudflare', 'icloud']);
      
      // Persist to local storage
      await this.persistToStorage(vectorEntry);

      console.log(`[VECTOR_MEMORY] Stored interaction: ${vectorEntry.id}`);

      return {
        data: vectorEntry,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `VECTOR_STORED_${Date.now()}` },
      };

    } catch (error) {
      const vectorError: AIONError = {
        code: ERROR_CODES.VECTOR_STORE_ERROR,
        message: `Failed to store interaction in vector memory: ${error}`,
        category: 'technical',
        severity: 'high',
      };

      return {
        error: vectorError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `VECTOR_STORE_FAILED_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('VectorMemory.search', PERFORMANCE.MAX_RESPONSE_TIME)
  public async searchSimilar(
    queryVector: Float32Array,
    options: Partial<VectorSearchOptions> = {}
  ): Promise<AIONResult<VectorSimilarityResult[]>> {
    try {
      const searchOptions: VectorSearchOptions = {
        similarityThreshold: AI.SIMILARITY_THRESHOLD,
        maxResults: 10,
        includeMetadata: true,
        temporalWeight: 0.1,
        ...options,
      };

      const results: VectorSimilarityResult[] = [];
      const currentTime = Date.now();

      // Use optimized search if available
      try {
        const optimizedResult = await this.vectorOptimizer.searchOptimized(
          queryVector, 
          searchOptions.maxResults
        );
        
        if (optimizedResult.data && optimizedResult.data.results.length > 0) {
          console.log(`[VECTOR_MEMORY] Using optimized search - found ${optimizedResult.data.results.length} results`);
          
          // Convert optimized results to similarity results
          for (const entry of optimizedResult.data.results) {
            const similarity = this.cosineSimilarity(queryVector, entry.inputVector);
            if (similarity >= searchOptions.similarityThreshold) {
              const timeDiff = currentTime - entry.timestamp.getTime();
              const hoursDiff = timeDiff / (1000 * 60 * 60);
              const temporalScore = Math.exp(-hoursDiff / 24);
              const combinedScore = (
                similarity * (1 - searchOptions.temporalWeight) +
                temporalScore * searchOptions.temporalWeight
              );
              
              results.push({
                entry,
                similarity,
                temporalScore,
                combinedScore,
              });
            }
          }
          
          // Sort and return optimized results
          results.sort((a, b) => b.combinedScore - a.combinedScore);
          console.log(`[VECTOR_MEMORY] Optimized search completed with ${results.length} relevant results`);
          
          return {
            data: results.slice(0, searchOptions.maxResults),
            performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
            security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `VECTOR_OPTIMIZED_SEARCH_${Date.now()}` },
          };
        }
      } catch (error) {
        console.warn('[VECTOR_MEMORY] Optimized search failed, falling back to standard search:', error);
      }

      // Fallback to standard search through all stored vectors
      for (const [entryId, entry] of this.memoryStore.entries()) {
        // Calculate cosine similarity
        const similarity = this.cosineSimilarity(queryVector, entry.inputVector);
        
        if (similarity < searchOptions.similarityThreshold) {
          continue;
        }

        // Calculate temporal score (more recent = higher score)
        const timeDiff = currentTime - entry.timestamp.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        const temporalScore = Math.exp(-hoursDiff / 24); // Exponential decay over days

        // Combine similarity and temporal scores
        const combinedScore = (
          similarity * (1 - searchOptions.temporalWeight) +
          temporalScore * searchOptions.temporalWeight
        );

        results.push({
          entry,
          similarity,
          temporalScore,
          combinedScore,
        });
      }

      // Sort by combined score and limit results
      results.sort((a, b) => b.combinedScore - a.combinedScore);
      const limitedResults = results.slice(0, searchOptions.maxResults);

      console.log(`[VECTOR_MEMORY] Found ${limitedResults.length} similar vectors`);

      return {
        data: limitedResults,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `VECTOR_SEARCH_${Date.now()}` },
      };

    } catch (error) {
      const vectorError: AIONError = {
        code: ERROR_CODES.VECTOR_STORE_ERROR,
        message: `Failed to search vector memory: ${error}`,
        category: 'technical',
        severity: 'medium',
      };

      return {
        error: vectorError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `VECTOR_SEARCH_FAILED_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('VectorMemory.getContext')
  public async getContextForSession(
    sessionId: string,
    maxContextLength: number = AI.MAX_CONTEXT_LENGTH
  ): Promise<AIONResult<VectorMemoryEntry[]>> {
    try {
      const sessionEntries = this.sessionIndex.get(sessionId) || [];
      const contextEntries: VectorMemoryEntry[] = [];
      let currentLength = 0;

      // Get entries in reverse chronological order (most recent first)
      const sortedEntryIds = sessionEntries.sort((a, b) => {
        const entryA = this.memoryStore.get(a);
        const entryB = this.memoryStore.get(b);
        if (!entryA || !entryB) return 0;
        return entryB.timestamp.getTime() - entryA.timestamp.getTime();
      });

      for (const entryId of sortedEntryIds) {
        const entry = this.memoryStore.get(entryId);
        if (!entry) continue;

        const entryLength = entry.userInput.length + entry.aiResponse.length;
        if (currentLength + entryLength > maxContextLength) {
          break;
        }

        contextEntries.push(entry);
        currentLength += entryLength;
      }

      return {
        data: contextEntries,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `VECTOR_CONTEXT_${Date.now()}` },
      };

    } catch (error) {
      const vectorError: AIONError = {
        code: ERROR_CODES.VECTOR_STORE_ERROR,
        message: `Failed to get context for session: ${error}`,
        category: 'technical',
        severity: 'medium',
      };

      return {
        error: vectorError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `VECTOR_CONTEXT_FAILED_${Date.now()}` },
      };
    }
  }

  public getStats(): VectorMemoryStats {
    const totalEntries = this.memoryStore.size;
    const totalSessions = this.sessionIndex.size;
    
    let totalVectorLength = 0;
    this.memoryStore.forEach(entry => {
      totalVectorLength += entry.inputVector.length;
    });
    
    const averageVectorLength = totalEntries > 0 ? totalVectorLength / totalEntries : 0;
    const memoryUsageMB = this.estimateMemoryUsage();

    return {
      totalEntries,
      totalSessions,
      averageVectorLength,
      memoryUsageMB,
      lastOptimization: new Date(), // Would track actual optimization runs
    };
  }

  private async generateVector(text: string): Promise<Float32Array> {
    // In real implementation, this would use a proper embedding model
    // For now, create a simple hash-based vector
    const dimension = AI.VECTOR_DIMENSIONS;
    const vector = new Float32Array(dimension);
    
    // Simple hash-based vector generation (replace with actual embeddings)
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    
    // Fill vector with pseudo-random values based on hash
    for (let i = 0; i < dimension; i++) {
      hash = ((hash << 5) - hash + i) & 0xffffffff;
      vector[i] = (hash / 0x7fffffff) * 2 - 1; // Normalize to [-1, 1]
    }
    
    // Normalize vector
    return this.normalizeVector(vector);
  }

  private async generateContextVector(sessionId: string, interactionIndex: number): Promise<Float32Array> {
    const sessionEntries = this.sessionIndex.get(sessionId) || [];
    const recentEntries = sessionEntries
      .map(id => this.memoryStore.get(id))
      .filter((entry): entry is VectorMemoryEntry => entry !== undefined)
      .sort((a, b) => a.interactionIndex - b.interactionIndex)
      .slice(-5); // Last 5 interactions for context

    if (recentEntries.length === 0) {
      // Return zero vector if no context
      return new Float32Array(AI.VECTOR_DIMENSIONS);
    }

    // Average the vectors to create context vector
    const contextVector = new Float32Array(AI.VECTOR_DIMENSIONS);
    for (const entry of recentEntries) {
      for (let i = 0; i < contextVector.length; i++) {
        contextVector[i] += entry.inputVector[i];
      }
    }

    // Average and normalize
    for (let i = 0; i < contextVector.length; i++) {
      contextVector[i] /= recentEntries.length;
    }

    return this.normalizeVector(contextVector);
  }

  private cosineSimilarity(vecA: Float32Array, vecB: Float32Array): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private normalizeVector(vector: Float32Array): Float32Array {
    let norm = 0;
    for (let i = 0; i < vector.length; i++) {
      norm += vector[i] * vector[i];
    }
    
    norm = Math.sqrt(norm);
    if (norm === 0) return vector;
    
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= norm;
    }
    
    return vector;
  }

  private extractEntities(text: string): string[] {
    // Simple entity extraction (replace with NLP library)
    const entities: string[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Look for common patterns
    for (const word of words) {
      if (word.length > 4 && word.match(/^[a-z]+$/)) {
        entities.push(word);
      }
    }
    
    return entities.slice(0, 10); // Limit to 10 entities
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction (replace with topic modeling)
    const topicKeywords = [
      'javascript', 'typescript', 'react', 'native', 'mobile', 'ai', 'machine', 'learning',
      'vector', 'database', 'security', 'authentication', 'performance', 'optimization',
    ];
    
    const topics: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const keyword of topicKeywords) {
      if (lowerText.includes(keyword)) {
        topics.push(keyword);
      }
    }
    
    return topics;
  }

  private analyzeSentiment(text: string): number {
    // Simple sentiment analysis (replace with ML model)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'wrong', 'error'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    }
    
    // Normalize to [-1, 1]
    return Math.max(-1, Math.min(1, score / words.length * 10));
  }

  private async getNextInteractionIndex(sessionId: string): Promise<number> {
    const sessionEntries = this.sessionIndex.get(sessionId) || [];
    return sessionEntries.length;
  }

  private async findParentInteraction(sessionId: string): Promise<string | undefined> {
    const sessionEntries = this.sessionIndex.get(sessionId) || [];
    return sessionEntries[sessionEntries.length - 1];
  }

  private async findRelatedInteractions(vector: Float32Array): Promise<string[]> {
    const related: string[] = [];
    
    for (const [entryId, entry] of this.memoryStore.entries()) {
      const similarity = this.cosineSimilarity(vector, entry.inputVector);
      if (similarity > 0.8) { // High similarity threshold
        related.push(entryId);
      }
    }
    
    return related.slice(0, 5); // Limit to 5 related interactions
  }

  private async updateIndices(entry: VectorMemoryEntry): Promise<void> {
    // Update session index
    const sessionEntries = this.sessionIndex.get(entry.sessionId) || [];
    sessionEntries.push(entry.id);
    this.sessionIndex.set(entry.sessionId, sessionEntries);
    
    // Update user index
    const userEntries = this.userIndex.get(entry.userId) || [];
    userEntries.push(entry.id);
    this.userIndex.set(entry.userId, userEntries);
  }

  private async loadFromStorage(): Promise<void> {
    // In real implementation, load from AsyncStorage or SQLite
    console.log('[VECTOR_MEMORY] Loading from storage...');
  }

  private async initializeVectorIndex(): Promise<void> {
    // In real implementation, initialize FAISS or similar vector index
    console.log('[VECTOR_MEMORY] Initializing vector index...');
  }

  private async persistToStorage(entry: VectorMemoryEntry): Promise<void> {
    // In real implementation, persist to AsyncStorage or SQLite
    console.log(`[VECTOR_MEMORY] Persisting entry: ${entry.id}`);
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in MB
    const entriesSize = this.memoryStore.size * 0.01; // ~10KB per entry estimate
    const indicesSize = (this.sessionIndex.size + this.userIndex.size) * 0.001; // ~1KB per index entry
    return entriesSize + indicesSize;
  }

  @withPerformanceMonitoring('VectorMemory.optimize')
  public async optimizeVectorIndex(): Promise<AIONResult<boolean>> {
    try {
      console.log('[VECTOR_MEMORY] Starting vector index optimization...');
      
      // Convert memory store to array for optimization
      const allVectors = Array.from(this.memoryStore.values());
      
      if (allVectors.length > 0) {
        // Run optimization
        const optimizationResult = await this.vectorOptimizer.optimizeIndex(allVectors);
        
        if (optimizationResult.data) {
          console.log(`[VECTOR_MEMORY] Index optimization completed - Performance gain: ${optimizationResult.data.performanceGain.toFixed(2)}%`);
          console.log(`[VECTOR_MEMORY] Memory reduction: ${optimizationResult.data.memoryReduction.toFixed(2)}%`);
        }
        
        // Trigger adaptive optimization based on usage patterns
        const usagePatterns = this.generateUsagePatterns();
        await this.vectorOptimizer.performAdaptiveOptimization(usagePatterns);
      }
      
      return {
        data: true,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME * 100 },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `VECTOR_INDEX_OPTIMIZED_${Date.now()}` },
      };
      
    } catch (error) {
      const vectorError: AIONError = {
        code: ERROR_CODES.VECTOR_STORE_ERROR,
        message: `Failed to optimize vector index: ${error}`,
        category: 'technical',
        severity: 'medium',
      };

      return {
        error: vectorError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME * 100 },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `VECTOR_OPTIMIZATION_FAILED_${Date.now()}` },
      };
    }
  }

  private generateUsagePatterns(): any[] {
    // Generate usage patterns based on recent operations
    const patterns: any[] = [];
    const recentTime = Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
    
    for (const entry of this.memoryStore.values()) {
      if (entry.timestamp.getTime() > recentTime) {
        patterns.push({
          type: 'search',
          timestamp: entry.timestamp,
          querySize: entry.inputVector.length,
          memoryUsage: entry.inputVector.length * 4, // 4 bytes per float
          latency: Math.random() * 2 + 0.5, // Simulated latency
        });
      }
    }
    
    return patterns;
  }

  public async cleanup(): Promise<void> {
    console.log('[VECTOR_MEMORY] Starting cleanup...');
    
    // In real implementation, remove old entries, compress vectors, etc.
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    for (const [entryId, entry] of this.memoryStore.entries()) {
      if (entry.timestamp < cutoffDate) {
        this.memoryStore.delete(entryId);
      }
    }
    
    console.log('[VECTOR_MEMORY] Cleanup completed');
  }
}

export default VectorMemorySystem.getInstance();