# Claude Development Guide - NeuralEdge AI

## 🤖 Claude Assistant Instructions

This guide provides specific instructions for Claude when working on the NeuralEdge AI project to ensure consistent, high-quality development that follows AION Protocol standards.

## 📋 Current Project Status

**Repository**: https://github.com/Yatrogenesis/NeuralEdge-AI  
**Current Phase**: Phase 1 Complete ✅, Phase 2 In Progress 🔄  
**AION Protocol Compliance**: Required for all development  

## 🎯 Development Priorities

### Always Follow These Principles:
1. **Performance First**: Every feature must meet <1ms response time (99.999th percentile)
2. **Security by Design**: Multi-layer security implementation
3. **Cross-Platform Compatibility**: iOS, Android, Desktop support
4. **Future-Proof Architecture**: Built for 5+ year technology evolution
5. **Enterprise Grade**: Scalable, maintainable, documented code

## 📊 Current TODO Status

Use the TodoWrite tool to track progress on these active items:

### Phase 2: Core Infrastructure (IN PROGRESS)
- [ ] Create mobile app framework (React Native) - ACTIVE
- [ ] Implement local AI inference engine
- [ ] Create vector memory system foundation
- [ ] Basic security implementation
- [ ] Development tools setup

### Upcoming Phases (PENDING)
- [ ] Perplexity-style context analysis
- [ ] Multi-cloud storage integration
- [ ] MCP servers integration
- [ ] User collaboration features
- [ ] Desktop companion app
- [ ] Enterprise governance
- [ ] Comprehensive testing
- [ ] App store compliance
- [ ] CI/CD pipeline setup

## 🏗️ Architecture Guidelines

### Mobile Development (React Native - Selected)
```typescript
// Follow this structure for all mobile components
interface ComponentStructure {
  // 1. Domain Layer (Core business logic)
  domain: {
    entities: "Pure business objects"
    useCases: "Application-specific business rules"
    repositories: "Interface definitions"
  }
  
  // 2. Infrastructure Layer (External concerns)  
  infrastructure: {
    api: "Network requests and responses"
    storage: "Local database and file system"
    ai: "AI inference and vector operations"
    security: "Encryption and authentication"
  }
  
  // 3. Presentation Layer (UI components)
  presentation: {
    screens: "Full screen components"
    components: "Reusable UI elements"
    hooks: "Custom React hooks"
    context: "State management"
  }
}
```

### Performance Requirements (AION Compliance)
```typescript
// All functions must include performance monitoring
async function exampleFunction(param: string): Promise<Result> {
  const startTime = performance.now()
  
  try {
    // Your implementation here
    const result = await businessLogic(param)
    
    // Performance validation
    const elapsed = performance.now() - startTime
    if (elapsed > 1.0) { // 1ms threshold
      throw new PerformanceException(
        `Function exceeded 1ms threshold: ${elapsed}ms`
      )
    }
    
    return result
  } catch (error) {
    // Error handling with telemetry
    reportError('exampleFunction', error, performance.now() - startTime)
    throw error
  }
}
```

### Security Implementation
```typescript
// All sensitive data must be encrypted
interface SecurityRequirements {
  // Device-level security
  deviceSecurity: {
    biometrics: "Always required for sensitive operations"
    keystore: "Use platform-specific secure storage"
    rootDetection: "Block on compromised devices"
  }
  
  // Data encryption
  encryption: {
    algorithm: "AES-256-GCM"
    keyDerivation: "PBKDF2 with salt"
    vectorEncryption: "Context-aware encryption for AI data"
  }
  
  // Network security
  transport: {
    protocol: "TLS 1.3 minimum"
    certificatePinning: "Enabled for production"
    hsts: "Always enabled"
  }
}
```

## 🔧 Development Standards

### Code Quality Requirements
```yaml
ESLint: 
  - errors: 0
  - warnings: <10 total
  
TypeScript:
  - strict: true
  - noImplicitAny: true
  - exactOptionalPropertyTypes: true
  
Testing:
  - coverage: >90%
  - performance_tests: required
  - integration_tests: required
  
Documentation:
  - inline_comments: for complex logic only
  - api_documentation: auto-generated
  - architecture_docs: updated with changes
```

### File Structure Conventions
```
mobile/
├── src/
│   ├── domain/
│   │   ├── entities/          # Business objects
│   │   ├── useCases/         # Business logic
│   │   └── repositories/     # Interface definitions
│   ├── infrastructure/
│   │   ├── api/              # Network layer
│   │   ├── storage/          # Local persistence
│   │   ├── ai/               # AI inference
│   │   └── security/         # Security services
│   ├── presentation/
│   │   ├── screens/          # Screen components
│   │   ├── components/       # Reusable components  
│   │   ├── navigation/       # Navigation config
│   │   └── hooks/           # Custom hooks
│   └── shared/
│       ├── constants/        # App constants
│       ├── types/           # TypeScript types
│       └── utils/           # Helper functions
```

## 🧪 Testing Strategy

### Testing Requirements for Every Feature
```typescript
// 1. Unit Tests (Required)
describe('FeatureName', () => {
  it('should meet performance requirements', async () => {
    const startTime = performance.now()
    await featureFunction()
    const elapsed = performance.now() - startTime
    expect(elapsed).toBeLessThan(1.0) // 1ms threshold
  })
  
  it('should handle errors gracefully', async () => {
    // Error handling tests
  })
  
  it('should maintain security properties', async () => {
    // Security validation tests
  })
})

// 2. Integration Tests (Required for API interactions)
describe('API Integration', () => {
  it('should encrypt sensitive data before transmission', () => {
    // Integration security tests
  })
})

// 3. Performance Tests (Required for all features)
describe('Performance Requirements', () => {
  it('should handle 10,000 operations under 1ms each', () => {
    // Load testing
  })
})
```

## 📱 Platform-Specific Guidelines

### iOS Development
```typescript
interface IOSRequirements {
  deployment_target: "iOS 12.0+"
  architecture: "arm64, x86_64 (simulator)"
  frameworks: {
    ui: "React Native + Native modules"
    security: "iOS Keychain, Secure Enclave"
    ai: "Core ML + ONNX Runtime"
    storage: "SQLite + Realm"
  }
  compliance: {
    app_store: "App Review Guidelines 2.1, 4.3, 5.1.1"
    privacy: "App Tracking Transparency required"
    security: "Certificate pinning, biometric auth"
  }
}
```

### Android Development
```typescript
interface AndroidRequirements {
  min_sdk: "API 21 (Android 5.0)"
  target_sdk: "API 34 (Android 14)"
  architecture: "arm64-v8a, armeabi-v7a, x86_64"
  frameworks: {
    ui: "React Native + Native modules"
    security: "Android Keystore, BiometricPrompt"
    ai: "TensorFlow Lite + ONNX Runtime"
    storage: "Room + SQLCipher"
  }
  compliance: {
    google_play: "Target SDK 33+, 64-bit compliance"
    permissions: "Minimal necessary permissions"
    security: "Google Play Protect compatible"
  }
}
```

## 🚀 Performance Optimization Checklist

Before implementing any feature, verify:
- [ ] Code follows clean architecture principles
- [ ] Performance monitoring is implemented
- [ ] Security requirements are met
- [ ] Cross-platform compatibility is ensured
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Error handling is comprehensive

## 🔄 Git Workflow

### Branch Strategy
```bash
main           # Production-ready code
develop        # Integration branch
feature/*      # Feature development
hotfix/*       # Production fixes
release/*      # Release preparation
```

### Commit Messages
Follow conventional commits:
```
feat: add vector memory search optimization
fix: resolve iOS biometric authentication issue
docs: update API documentation for MCP integration
perf: optimize AI inference response time to <1ms
security: implement end-to-end encryption for cloud sync
test: add performance tests for vector operations
```

### Repository Updates
After completing each TODO item:
1. Commit code changes with descriptive message
2. Update documentation if needed
3. Run performance and security tests
4. Push to GitHub repository
5. Update project management docs

## 🎯 Next Steps Instructions

**Current Priority**: Create React Native mobile app framework

When working on this:
1. Set up React Native project with TypeScript
2. Implement hexagonal architecture structure
3. Add performance monitoring framework
4. Integrate security layer (biometrics, encryption)
5. Create basic UI components
6. Add comprehensive testing suite
7. Ensure AION Protocol compliance

**Performance Target**: Cold start <500ms, response time <1ms
**Security Requirement**: Biometric auth + end-to-end encryption
**Testing Requirement**: >90% code coverage

## 🔍 Quality Checks

Before marking any TODO as complete:
- [ ] Performance benchmarks meet AION standards
- [ ] Security audit passes
- [ ] All tests pass (unit, integration, e2e)
- [ ] Cross-platform compatibility verified
- [ ] Documentation updated
- [ ] Repository committed and pushed

## 📞 Support & Resources

- **AION Protocol**: Reference D:\aion_protocol_master.md for standards
- **Repository**: https://github.com/Yatrogenesis/NeuralEdge-AI
- **Documentation**: See docs/ directory for detailed guides
- **Architecture**: Follow patterns in docs/ARCHITECTURE.md

---

**Remember**: Every feature must meet AION Protocol performance and security standards. Quality over speed, but optimized for both.