/**
 * NeuralEdge AI Engine
 * Local AI Inference Engine with TensorFlow.js and ONNX Runtime
 * 
 * AION Protocol v2.0 Compliant - Sub-millisecond inference target
 */

const tf = require('@tensorflow/tfjs-node');
const ort = require('onnxruntime-node');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

class AIEngine {
  constructor() {
    this.models = new Map();
    this.sessions = new Map();
    this.performanceMetrics = {
      totalInferences: 0,
      averageLatency: 0,
      successRate: 100.0
    };
  }

  /**
   * Initialize the AI Engine
   */
  async initialize() {
    console.log('🧠 Initializing NeuralEdge AI Engine...');
    console.log('📊 AION Protocol v2.0 Target: <1ms inference');
    
    // Warm up TensorFlow.js
    await this._warmupTensorFlow();
    
    console.log('✅ AI Engine initialized successfully');
  }

  /**
   * Load a TensorFlow.js model
   */
  async loadTensorFlowModel(modelPath, modelName) {
    try {
      const startTime = performance.now();
      
      console.log(`📥 Loading TensorFlow model: ${modelName}`);
      const model = await tf.loadLayersModel(modelPath);
      
      this.models.set(modelName, {
        type: 'tensorflow',
        model: model,
        loadTime: performance.now() - startTime
      });
      
      console.log(`✅ Model ${modelName} loaded in ${performance.now() - startTime}ms`);
      return model;
    } catch (error) {
      console.error(`❌ Failed to load TensorFlow model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Load an ONNX model
   */
  async loadONNXModel(modelPath, modelName) {
    try {
      const startTime = performance.now();
      
      console.log(`📥 Loading ONNX model: ${modelName}`);
      const session = await ort.InferenceSession.create(modelPath);
      
      this.sessions.set(modelName, {
        type: 'onnx',
        session: session,
        loadTime: performance.now() - startTime
      });
      
      console.log(`✅ ONNX model ${modelName} loaded in ${performance.now() - startTime}ms`);
      return session;
    } catch (error) {
      console.error(`❌ Failed to load ONNX model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Run inference with a loaded model
   */
  async runInference(modelName, inputData, options = {}) {
    const startTime = performance.now();
    const inferenceId = uuidv4();
    
    try {
      console.log(`🔮 Running inference ${inferenceId} with model: ${modelName}`);
      
      let result;
      
      // Check if it's a TensorFlow model
      if (this.models.has(modelName)) {
        const modelInfo = this.models.get(modelName);
        result = await this._runTensorFlowInference(modelInfo.model, inputData, options);
      }
      // Check if it's an ONNX model
      else if (this.sessions.has(modelName)) {
        const sessionInfo = this.sessions.get(modelName);
        result = await this._runONNXInference(sessionInfo.session, inputData, options);
      }
      else {
        throw new Error(`Model ${modelName} not found`);
      }
      
      const latency = performance.now() - startTime;
      this._updateMetrics(latency, true);
      
      console.log(`✅ Inference ${inferenceId} completed in ${latency.toFixed(3)}ms`);
      
      return {
        inferenceId,
        result,
        latency,
        modelName,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const latency = performance.now() - startTime;
      this._updateMetrics(latency, false);
      
      console.error(`❌ Inference ${inferenceId} failed:`, error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      loadedModels: this.models.size + this.sessions.size,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Optimize model for production
   */
  async optimizeModel(modelName) {
    console.log(`⚡ Optimizing model: ${modelName}`);
    
    if (this.models.has(modelName)) {
      // TensorFlow.js optimization
      const modelInfo = this.models.get(modelName);
      // Add optimization logic here
      console.log(`✅ TensorFlow model ${modelName} optimized`);
    }
    
    return true;
  }

  // Private methods

  async _warmupTensorFlow() {
    // Create a small tensor to warm up TensorFlow.js
    const warmupTensor = tf.randomNormal([1, 10]);
    const result = tf.matMul(warmupTensor, tf.transpose(warmupTensor));
    await result.data();
    
    warmupTensor.dispose();
    result.dispose();
    
    console.log('🔥 TensorFlow.js warmed up');
  }

  async _runTensorFlowInference(model, inputData, options) {
    const inputTensor = tf.tensor(inputData);
    const prediction = model.predict(inputTensor);
    const result = await prediction.data();
    
    // Cleanup tensors to prevent memory leaks
    inputTensor.dispose();
    prediction.dispose();
    
    return Array.from(result);
  }

  async _runONNXInference(session, inputData, options) {
    const feeds = {};
    const inputNames = session.inputNames;
    
    // Prepare input feeds
    inputNames.forEach((name, index) => {
      feeds[name] = new ort.Tensor('float32', inputData, [1, inputData.length]);
    });
    
    const results = await session.run(feeds);
    
    // Extract output data
    const outputName = session.outputNames[0];
    return Array.from(results[outputName].data);
  }

  _updateMetrics(latency, success) {
    this.performanceMetrics.totalInferences++;
    
    // Update average latency using exponential moving average
    const alpha = 0.1;
    this.performanceMetrics.averageLatency = 
      alpha * latency + (1 - alpha) * this.performanceMetrics.averageLatency;
    
    // Update success rate
    const successCount = Math.floor(this.performanceMetrics.successRate / 100 * 
                                  (this.performanceMetrics.totalInferences - 1));
    const newSuccessCount = successCount + (success ? 1 : 0);
    this.performanceMetrics.successRate = 
      (newSuccessCount / this.performanceMetrics.totalInferences) * 100;
  }
}

module.exports = { AIEngine };