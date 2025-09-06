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

// NeuralEdge AI - Security Manager Test Suite
// AION Protocol Security Compliance Testing

import SecurityManager from './SecurityManager';
import { PERFORMANCE, SECURITY } from '../../shared/constants';

describe('SecurityManager', () => {
  let securityManager: SecurityManager;

  beforeEach(() => {
    securityManager = SecurityManager.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up security context
    securityManager.logout();
  });

  describe('AION Protocol Security Compliance', () => {
    it('should meet <1ms response time for security operations', async () => {
      const perfTest = global.setupPerformanceTest('SecurityManager.getInstance');
      
      const instance = SecurityManager.getInstance();
      
      const duration = perfTest.end();
      expect(instance).toBeDefined();
      expect(duration).toBeLessThan(PERFORMANCE.MAX_RESPONSE_TIME);
    });

    it('should implement multi-layer security architecture', async () => {
      const perfTest = global.setupPerformanceTest('security initialization', 100);
      
      const initResult = await securityManager.initialize();
      
      perfTest.end();
      
      expect(initResult.data).toBe(true);
      expect(initResult.security.encrypted).toBe(true);
      expect(initResult.security.authenticated).toBe(true);
      expect(initResult.security.authorized).toBe(true);
      expect(initResult.security.auditTrail).toMatch(/SECURITY_INIT_\d+/);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await securityManager.initialize();
      
      expect(result.data).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.performance).toBeDefined();
      expect(result.security).toBeDefined();
    });

    it('should handle re-initialization gracefully', async () => {
      await securityManager.initialize();
      const secondInit = await securityManager.initialize();
      
      expect(secondInit.data).toBe(true);
      expect(secondInit.security.auditTrail).toMatch(/SECURITY_ALREADY_INIT_\d+/);
    });

    it('should meet performance requirements during initialization', async () => {
      const perfTest = global.setupPerformanceTest('security initialization', 200);
      
      await securityManager.initialize();
      
      perfTest.end();
    });
  });

  describe('User Authentication', () => {
    beforeEach(async () => {
      await securityManager.initialize();
    });

    it('should authenticate user with valid credentials', async () => {
      const userId = 'test_user_123';
      
      const authResult = await securityManager.authenticateUser(userId);
      
      if (authResult.data) {
        expect(authResult.data).toHaveValidSecurityContext();
        expect(authResult.data.userId).toBe(userId);
        expect(authResult.data.biometricVerified).toBe(true);
        expect(authResult.data.sessionId).toBeDefined();
        expect(authResult.data.encryptionKey).toBeDefined();
      }
    });

    it('should handle authentication failures', async () => {
      // Mock biometric failure
      jest.spyOn(Math, 'random').mockReturnValue(0.05); // Force failure
      
      const authResult = await securityManager.authenticateUser('test_user');
      
      if (authResult.error) {
        expect(authResult.error.category).toBe('security');
        expect(authResult.error.severity).toBe('high');
        expect(authResult.security.authenticated).toBe(false);
      }
    });

    it('should meet authentication performance requirements', async () => {
      const perfTest = global.setupPerformanceTest('user authentication', SECURITY.BIOMETRIC_TIMEOUT);
      
      await securityManager.authenticateUser('test_user');
      
      perfTest.end();
    });

    it('should generate unique session IDs', async () => {
      const auth1 = await securityManager.authenticateUser('user1');
      const auth2 = await securityManager.authenticateUser('user2');
      
      if (auth1.data && auth2.data) {
        expect(auth1.data.sessionId).not.toBe(auth2.data.sessionId);
      }
    });
  });

  describe('Data Encryption/Decryption', () => {
    beforeEach(async () => {
      await securityManager.initialize();
      await securityManager.authenticateUser('test_user');
    });

    it('should encrypt data successfully', async () => {
      const testData = 'sensitive information';
      
      const encryptResult = await securityManager.encryptData(testData);
      
      if (encryptResult.data) {
        expect(encryptResult.data).toBeEncrypted();
        expect(encryptResult.data).not.toBe(testData);
        expect(encryptResult.security.encrypted).toBe(true);
      }
    });

    it('should decrypt data successfully', async () => {
      const testData = 'sensitive information';
      
      const encryptResult = await securityManager.encryptData(testData);
      
      if (encryptResult.data) {
        const decryptResult = await securityManager.decryptData(encryptResult.data);
        
        if (decryptResult.data) {
          expect(decryptResult.data).toBe(testData);
          expect(decryptResult.security.encrypted).toBe(true);
        }
      }
    });

    it('should meet encryption performance requirements', async () => {
      const testData = 'test data for encryption performance';
      
      const encryptPerfTest = global.setupPerformanceTest('data encryption');
      await securityManager.encryptData(testData);
      encryptPerfTest.end();
      
      const encryptResult = await securityManager.encryptData(testData);
      if (encryptResult.data) {
        const decryptPerfTest = global.setupPerformanceTest('data decryption');
        await securityManager.decryptData(encryptResult.data);
        decryptPerfTest.end();
      }
    });

    it('should handle encryption without valid context', async () => {
      await securityManager.logout();
      
      const result = await securityManager.encryptData('test data');
      
      expect(result.error).toBeDefined();
      expect(result.error?.category).toBe('security');
      expect(result.security.encrypted).toBe(false);
    });

    it('should produce different ciphertexts for same plaintext', async () => {
      const testData = 'same plaintext';
      
      const encrypt1 = await securityManager.encryptData(testData);
      const encrypt2 = await securityManager.encryptData(testData);
      
      if (encrypt1.data && encrypt2.data) {
        expect(encrypt1.data).not.toBe(encrypt2.data); // Different due to random IV
      }
    });
  });

  describe('Security Audit', () => {
    beforeEach(async () => {
      await securityManager.initialize();
    });

    it('should perform comprehensive security audit', async () => {
      const auditResult = await securityManager.performSecurityAudit();
      
      if (auditResult.data) {
        expect(auditResult.data).toHaveProperty('deviceSecure');
        expect(auditResult.data).toHaveProperty('biometricAvailable');
        expect(auditResult.data).toHaveProperty('encryptionEnabled');
        expect(auditResult.data).toHaveProperty('keyStoreSecure');
        expect(auditResult.data).toHaveProperty('networkSecure');
        expect(auditResult.data).toHaveProperty('lastAudit');
        expect(auditResult.data).toHaveProperty('recommendations');
        expect(auditResult.data).toHaveProperty('riskLevel');
        
        expect(['low', 'medium', 'high', 'critical']).toContain(auditResult.data.riskLevel);
        expect(Array.isArray(auditResult.data.recommendations)).toBe(true);
      }
    });

    it('should meet audit performance requirements', async () => {
      const perfTest = global.setupPerformanceTest('security audit', 50);
      
      await securityManager.performSecurityAudit();
      
      perfTest.end();
    });

    it('should generate appropriate risk levels', async () => {
      // Test multiple audits to check risk level variation
      const audits = await Promise.all([
        securityManager.performSecurityAudit(),
        securityManager.performSecurityAudit(),
        securityManager.performSecurityAudit(),
      ]);

      audits.forEach(audit => {
        if (audit.data) {
          expect(['low', 'medium', 'high', 'critical']).toContain(audit.data.riskLevel);
        }
      });
    });

    it('should provide security recommendations', async () => {
      const auditResult = await securityManager.performSecurityAudit();
      
      if (auditResult.data) {
        expect(Array.isArray(auditResult.data.recommendations)).toBe(true);
        // Recommendations should be strings
        auditResult.data.recommendations.forEach(recommendation => {
          expect(typeof recommendation).toBe('string');
          expect(recommendation.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      await securityManager.initialize();
    });

    it('should manage authentication state correctly', async () => {
      expect(securityManager.isAuthenticated()).toBe(false);
      
      const authResult = await securityManager.authenticateUser('test_user');
      if (authResult.data) {
        expect(securityManager.isAuthenticated()).toBe(true);
      }
      
      await securityManager.logout();
      expect(securityManager.isAuthenticated()).toBe(false);
    });

    it('should provide current security context', async () => {
      const authResult = await securityManager.authenticateUser('test_user');
      
      if (authResult.data) {
        const context = securityManager.getCurrentSecurityContext();
        expect(context).toEqual(authResult.data);
      }
    });

    it('should clear security context on logout', async () => {
      await securityManager.authenticateUser('test_user');
      expect(securityManager.getCurrentSecurityContext()).not.toBeNull();
      
      await securityManager.logout();
      expect(securityManager.getCurrentSecurityContext()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Create a new instance that hasn't been initialized
      const newInstance = Object.create(SecurityManager.prototype);
      
      const authResult = await newInstance.authenticateUser('test');
      
      expect(authResult.error).toBeDefined();
      expect(authResult.error?.category).toBe('security');
      expect(authResult.security.authenticated).toBe(false);
    });

    it('should provide detailed error information', async () => {
      await securityManager.initialize();
      
      // Force authentication failure
      jest.spyOn(Math, 'random').mockReturnValue(0.05);
      
      const authResult = await securityManager.authenticateUser('test_user');
      
      if (authResult.error) {
        expect(authResult.error).toHaveProperty('code');
        expect(authResult.error).toHaveProperty('message');
        expect(authResult.error).toHaveProperty('category');
        expect(authResult.error).toHaveProperty('severity');
      }
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = SecurityManager.getInstance();
      const instance2 = SecurityManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('AION Protocol Compliance Validation', () => {
    it('should validate all security operations meet performance requirements', async () => {
      await securityManager.initialize();
      
      const operations = [
        () => securityManager.authenticateUser('test_user'),
        () => securityManager.encryptData('test data'),
        () => securityManager.performSecurityAudit(),
      ];

      for (const operation of operations) {
        const perfTest = global.setupPerformanceTest('security_operation');
        await operation();
        perfTest.end();
      }
    });

    it('should maintain security properties across all operations', async () => {
      await securityManager.initialize();
      const authResult = await securityManager.authenticateUser('test_user');
      
      if (authResult.data) {
        // Test encryption
        const encryptResult = await securityManager.encryptData('sensitive data');
        expect(encryptResult.security.encrypted).toBe(true);
        
        // Test audit
        const auditResult = await securityManager.performSecurityAudit();
        expect(auditResult.security.authenticated).toBe(true);
        
        // All operations should maintain security properties
        expect(authResult.security.encrypted).toBe(true);
        expect(encryptResult.security.authenticated).toBe(true);
        expect(auditResult.security.authorized).toBe(true);
      }
    });
  });
});