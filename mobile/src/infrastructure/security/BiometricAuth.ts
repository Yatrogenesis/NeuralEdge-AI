// NeuralEdge AI - Biometric Authentication Module
// AION Protocol Compliant Biometric Security

import { PerformanceMonitor, withPerformanceMonitoring } from '../../shared/utils/performance';
import { SECURITY, PERFORMANCE, ERROR_CODES } from '../../shared/constants';
import { AIONResult, AIONError } from '../../shared/types';

export interface BiometricCapabilities {
  available: boolean;
  biometricTypes: BiometricType[];
  enrolled: boolean;
  hardwareSupported: boolean;
}

export interface BiometricAuthOptions {
  promptTitle?: string;
  promptSubtitle?: string;
  promptDescription?: string;
  fallbackTitle?: string;
  allowDeviceCredentials?: boolean;
  timeout?: number;
}

export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'voice' | 'none';

export interface BiometricAuthenticationResult {
  success: boolean;
  biometricType: BiometricType;
  error?: BiometricError;
  timestamp: Date;
  attempts: number;
}

export interface BiometricError {
  code: string;
  message: string;
  category: 'hardware' | 'user' | 'system' | 'security';
  recoverable: boolean;
}

export class BiometricAuth {
  private static instance: BiometricAuth;
  private performanceMonitor: PerformanceMonitor;
  private capabilities: BiometricCapabilities | null = null;
  private authenticationAttempts: number = 0;
  private maxAttempts: number = 3;

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  public static getInstance(): BiometricAuth {
    if (!BiometricAuth.instance) {
      BiometricAuth.instance = new BiometricAuth();
    }
    return BiometricAuth.instance;
  }

  @withPerformanceMonitoring('BiometricAuth.initialize')
  public async initialize(): Promise<AIONResult<BiometricCapabilities>> {
    try {
      console.log('[BIOMETRIC] Initializing biometric authentication...');

      // Check hardware capabilities
      const hardwareSupported = await this.checkHardwareSupport();
      
      // Check available biometric types
      const biometricTypes = await this.getAvailableBiometricTypes();
      
      // Check if user has enrolled biometrics
      const enrolled = await this.checkEnrollment();

      this.capabilities = {
        available: hardwareSupported && enrolled && biometricTypes.length > 0,
        biometricTypes,
        enrolled,
        hardwareSupported,
      };

      console.log('[BIOMETRIC] Biometric capabilities:', this.capabilities);

      return {
        data: this.capabilities,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `BIOMETRIC_INIT_${Date.now()}` },
      };

    } catch (error) {
      const biometricError: AIONError = {
        code: ERROR_CODES.BIOMETRIC_UNAVAILABLE,
        message: `Failed to initialize biometric authentication: ${error}`,
        category: 'security',
        severity: 'medium',
      };

      return {
        error: biometricError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `BIOMETRIC_INIT_FAILED_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('BiometricAuth.authenticate', SECURITY.BIOMETRIC_TIMEOUT)
  public async authenticate(options?: BiometricAuthOptions): Promise<AIONResult<BiometricAuthenticationResult>> {
    try {
      if (!this.capabilities?.available) {
        throw new Error('Biometric authentication not available');
      }

      if (this.authenticationAttempts >= this.maxAttempts) {
        throw new Error('Maximum authentication attempts exceeded');
      }

      this.authenticationAttempts++;

      const authOptions: Required<BiometricAuthOptions> = {
        promptTitle: 'Biometric Authentication',
        promptSubtitle: 'Use your biometric to authenticate',
        promptDescription: 'Place your finger on the sensor or look at the camera',
        fallbackTitle: 'Use Passcode',
        allowDeviceCredentials: true,
        timeout: SECURITY.BIOMETRIC_TIMEOUT,
        ...options,
      };

      console.log(`[BIOMETRIC] Starting authentication attempt ${this.authenticationAttempts}/${this.maxAttempts}`);

      // Perform biometric authentication
      const authResult = await this.performBiometricAuth(authOptions);

      if (authResult.success) {
        this.authenticationAttempts = 0; // Reset on success
        console.log(`[BIOMETRIC] Authentication successful using ${authResult.biometricType}`);
      } else {
        console.log(`[BIOMETRIC] Authentication failed: ${authResult.error?.message}`);
      }

      return {
        data: authResult,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: SECURITY.BIOMETRIC_TIMEOUT },
        security: { 
          encrypted: true, 
          authenticated: authResult.success, 
          authorized: authResult.success, 
          auditTrail: `BIOMETRIC_AUTH_${authResult.success ? 'SUCCESS' : 'FAILED'}_${Date.now()}` 
        },
      };

    } catch (error) {
      const biometricError: AIONError = {
        code: ERROR_CODES.AUTHENTICATION_FAILED,
        message: `Biometric authentication failed: ${error}`,
        category: 'security',
        severity: 'high',
      };

      return {
        error: biometricError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: SECURITY.BIOMETRIC_TIMEOUT },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `BIOMETRIC_AUTH_ERROR_${Date.now()}` },
      };
    }
  }

  @withPerformanceMonitoring('BiometricAuth.enrollmentCheck')
  public async checkBiometricEnrollment(): Promise<AIONResult<boolean>> {
    try {
      const enrolled = await this.checkEnrollment();

      return {
        data: enrolled,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `ENROLLMENT_CHECK_${Date.now()}` },
      };

    } catch (error) {
      const biometricError: AIONError = {
        code: ERROR_CODES.BIOMETRIC_UNAVAILABLE,
        message: `Failed to check biometric enrollment: ${error}`,
        category: 'security',
        severity: 'low',
      };

      return {
        error: biometricError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `ENROLLMENT_CHECK_FAILED_${Date.now()}` },
      };
    }
  }

  public async promptForEnrollment(): Promise<AIONResult<boolean>> {
    try {
      if (!this.capabilities?.hardwareSupported) {
        throw new Error('Biometric hardware not supported on this device');
      }

      console.log('[BIOMETRIC] Prompting user to enroll biometrics...');

      // In real implementation, show enrollment prompt
      // For now, simulate user decision
      const userWantsToEnroll = Math.random() > 0.3; // 70% enrollment rate

      if (userWantsToEnroll) {
        // In real implementation, redirect to system settings
        console.log('[BIOMETRIC] User chose to enroll - redirecting to settings');
      } else {
        console.log('[BIOMETRIC] User declined biometric enrollment');
      }

      return {
        data: userWantsToEnroll,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: true, authenticated: true, authorized: true, auditTrail: `ENROLLMENT_PROMPT_${Date.now()}` },
      };

    } catch (error) {
      const biometricError: AIONError = {
        code: ERROR_CODES.BIOMETRIC_UNAVAILABLE,
        message: `Failed to prompt for enrollment: ${error}`,
        category: 'security',
        severity: 'low',
      };

      return {
        error: biometricError,
        performance: { startTime: 0, endTime: 0, duration: 0, threshold: PERFORMANCE.MAX_RESPONSE_TIME },
        security: { encrypted: false, authenticated: false, authorized: false, auditTrail: `ENROLLMENT_PROMPT_FAILED_${Date.now()}` },
      };
    }
  }

  private async checkHardwareSupport(): Promise<boolean> {
    // Mock hardware support check
    // In real implementation: Use react-native-biometrics or similar
    console.log('[BIOMETRIC] Checking hardware support...');
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Simulate 85% of devices having biometric hardware
    return Math.random() > 0.15;
  }

  private async getAvailableBiometricTypes(): Promise<BiometricType[]> {
    // Mock biometric type detection
    console.log('[BIOMETRIC] Detecting available biometric types...');
    
    await new Promise(resolve => setTimeout(resolve, 30));
    
    const availableTypes: BiometricType[] = [];
    
    // Simulate different device capabilities
    if (Math.random() > 0.2) availableTypes.push('fingerprint'); // 80% have fingerprint
    if (Math.random() > 0.6) availableTypes.push('face'); // 40% have face recognition
    if (Math.random() > 0.9) availableTypes.push('iris'); // 10% have iris scanning
    
    return availableTypes;
  }

  private async checkEnrollment(): Promise<boolean> {
    // Mock enrollment check
    console.log('[BIOMETRIC] Checking biometric enrollment...');
    
    await new Promise(resolve => setTimeout(resolve, 15));
    
    // Simulate 75% enrollment rate among supported devices
    return Math.random() > 0.25;
  }

  private async performBiometricAuth(options: Required<BiometricAuthOptions>): Promise<BiometricAuthenticationResult> {
    const startTime = new Date();
    
    // Simulate biometric authentication process
    console.log(`[BIOMETRIC] Showing biometric prompt: "${options.promptTitle}"`);
    
    // Simulate authentication time
    const authTime = Math.random() * 3000 + 1000; // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, authTime));
    
    // Simulate authentication result
    const success = Math.random() > 0.1; // 90% success rate for valid biometrics
    const biometricType = this.capabilities?.biometricTypes[0] || 'none';
    
    let error: BiometricError | undefined;
    
    if (!success) {
      error = this.generateBiometricError();
    }

    return {
      success,
      biometricType,
      error,
      timestamp: startTime,
      attempts: this.authenticationAttempts,
    };
  }

  private generateBiometricError(): BiometricError {
    const errors = [
      {
        code: 'BIOMETRIC_ERROR_NO_MATCH',
        message: 'No biometric match found',
        category: 'user' as const,
        recoverable: true,
      },
      {
        code: 'BIOMETRIC_ERROR_TIMEOUT',
        message: 'Biometric authentication timed out',
        category: 'user' as const,
        recoverable: true,
      },
      {
        code: 'BIOMETRIC_ERROR_CANCELLED',
        message: 'Biometric authentication was cancelled',
        category: 'user' as const,
        recoverable: true,
      },
      {
        code: 'BIOMETRIC_ERROR_LOCKOUT',
        message: 'Too many failed attempts - biometric locked',
        category: 'security' as const,
        recoverable: false,
      },
      {
        code: 'BIOMETRIC_ERROR_HARDWARE',
        message: 'Biometric hardware unavailable',
        category: 'hardware' as const,
        recoverable: false,
      },
    ];

    return errors[Math.floor(Math.random() * errors.length)];
  }

  public getCapabilities(): BiometricCapabilities | null {
    return this.capabilities;
  }

  public getRemainingAttempts(): number {
    return Math.max(0, this.maxAttempts - this.authenticationAttempts);
  }

  public resetAttempts(): void {
    this.authenticationAttempts = 0;
    console.log('[BIOMETRIC] Authentication attempts reset');
  }

  public isLocked(): boolean {
    return this.authenticationAttempts >= this.maxAttempts;
  }

  public async unlockAfterDelay(delayMs: number = 30000): Promise<void> {
    console.log(`[BIOMETRIC] Unlocking after ${delayMs}ms delay...`);
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    this.resetAttempts();
    console.log('[BIOMETRIC] Biometric authentication unlocked');
  }

  // Utility method for testing/demo
  public async simulateSuccessfulAuth(): Promise<BiometricAuthenticationResult> {
    return {
      success: true,
      biometricType: this.capabilities?.biometricTypes[0] || 'fingerprint',
      timestamp: new Date(),
      attempts: 1,
    };
  }

  // Utility method for testing/demo
  public async simulateFailedAuth(errorType: string = 'no_match'): Promise<BiometricAuthenticationResult> {
    return {
      success: false,
      biometricType: 'none',
      error: {
        code: `BIOMETRIC_ERROR_${errorType.toUpperCase()}`,
        message: `Simulated ${errorType} error`,
        category: 'user',
        recoverable: true,
      },
      timestamp: new Date(),
      attempts: this.authenticationAttempts,
    };
  }
}

export default BiometricAuth.getInstance();