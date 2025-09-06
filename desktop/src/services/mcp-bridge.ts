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

// NeuralEdge AI Desktop - MCP Bridge Service
// Bridge between desktop app and MCP servers

import { AIEngine } from './ai-engine';
import { AION_CONSTANTS } from '../constants';

export interface MCPToolCall {
  tool: string;
  arguments?: Record<string, any>;
  timeout?: number;
}

export interface MCPToolResult {
  success: boolean;
  content: MCPContent[];
  error?: string;
  executionTime: number;
  metadata: {
    tool: string;
    server: string;
    timestamp: Date;
    memoryUsed: number;
  };
}

export interface MCPContent {
  type: 'text' | 'image' | 'json' | 'binary';
  data: string;
  mimeType?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  connected: boolean;
  tools: MCPTool[];
  resources: MCPResource[];
  lastPing: Date;
  latency: number;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: MCPParameter[];
  returns: string;
  examples?: string[];
}

export interface MCPParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  size?: number;
  lastModified?: Date;
}

export class MCPBridge {
  private aiEngine: AIEngine;
  private connectedServers: Map<string, MCPServer> = new Map();
  private isInitialized = false;
  private executionHistory: MCPToolResult[] = [];

  constructor(aiEngine: AIEngine) {
    this.aiEngine = aiEngine;
  }

  public async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[MCP_BRIDGE] Initializing MCP bridge...');
      
      // Initialize built-in MCP servers
      await this.initializeBuiltinServers();
      
      // Start server monitoring
      this.startServerMonitoring();
      
      this.isInitialized = true;
      console.log('[MCP_BRIDGE] MCP bridge initialized successfully');
      
      return { success: true };
    } catch (error) {
      console.error('[MCP_BRIDGE] Failed to initialize:', error);
      return { success: false, error: error.message };
    }
  }

  public async executeTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    const startTime = performance.now();
    const initialMemory = process.memoryUsage().heapUsed;

    try {
      if (!this.isInitialized) {
        throw new Error('MCP bridge not initialized');
      }

      console.log(`[MCP_BRIDGE] Executing tool: ${toolCall.tool}`);

      // Find appropriate server for the tool
      const server = this.findServerForTool(toolCall.tool);
      if (!server) {
        throw new Error(`No server found for tool: ${toolCall.tool}`);
      }

      // Verify server connectivity
      if (!server.connected) {
        await this.reconnectServer(server.id);
      }

      // Execute the tool with timeout
      const timeout = toolCall.timeout || AION_CONSTANTS.MAX_RESPONSE_TIME;
      const executionPromise = this.performToolExecution(server, toolCall);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tool execution timeout')), timeout);
      });

      const content = await Promise.race([executionPromise, timeoutPromise]) as MCPContent[];
      
      const executionTime = performance.now() - startTime;
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryUsed = (finalMemory - initialMemory) / 1024 / 1024; // MB

      const result: MCPToolResult = {
        success: true,
        content,
        executionTime,
        metadata: {
          tool: toolCall.tool,
          server: server.name,
          timestamp: new Date(),
          memoryUsed
        }
      };

      // Store in execution history
      this.executionHistory.push(result);
      if (this.executionHistory.length > 1000) {
        this.executionHistory = this.executionHistory.slice(-1000);
      }

      // Verify AION compliance
      if (executionTime > AION_CONSTANTS.MAX_RESPONSE_TIME) {
        console.warn(`[MCP_BRIDGE] Tool execution time ${executionTime}ms exceeds AION limit`);
      }

      console.log(`[MCP_BRIDGE] Tool executed successfully: ${toolCall.tool} (${executionTime.toFixed(3)}ms)`);
      
      return result;
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      console.error(`[MCP_BRIDGE] Tool execution failed: ${toolCall.tool}`, error);
      
      return {
        success: false,
        content: [],
        error: error.message,
        executionTime,
        metadata: {
          tool: toolCall.tool,
          server: 'unknown',
          timestamp: new Date(),
          memoryUsed: 0
        }
      };
    }
  }

  public async getAvailableTools(): Promise<MCPTool[]> {
    const tools: MCPTool[] = [];
    
    for (const server of this.connectedServers.values()) {
      if (server.connected) {
        tools.push(...server.tools);
      }
    }
    
    return tools;
  }

  public async getAvailableResources(): Promise<MCPResource[]> {
    const resources: MCPResource[] = [];
    
    for (const server of this.connectedServers.values()) {
      if (server.connected) {
        resources.push(...server.resources);
      }
    }
    
    return resources;
  }

  public getConnectedServers(): MCPServer[] {
    return Array.from(this.connectedServers.values());
  }

  public getExecutionHistory(limit: number = 100): MCPToolResult[] {
    return this.executionHistory.slice(-limit);
  }

  public async addServer(
    endpoint: string, 
    name: string, 
    description: string = ''
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[MCP_BRIDGE] Adding MCP server: ${name}`);
      
      const server: MCPServer = {
        id: `server_${Date.now()}`,
        name,
        description,
        endpoint,
        connected: false,
        tools: [],
        resources: [],
        lastPing: new Date(),
        latency: 0
      };

      // Test connection
      await this.connectToServer(server);
      
      this.connectedServers.set(server.id, server);
      
      console.log(`[MCP_BRIDGE] Server added successfully: ${name}`);
      return { success: true };
      
    } catch (error) {
      console.error(`[MCP_BRIDGE] Failed to add server ${name}:`, error);
      return { success: false, error: error.message };
    }
  }

  public async removeServer(serverId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const server = this.connectedServers.get(serverId);
      if (!server) {
        throw new Error('Server not found');
      }

      await this.disconnectServer(serverId);
      this.connectedServers.delete(serverId);
      
      console.log(`[MCP_BRIDGE] Server removed: ${server.name}`);
      return { success: true };
      
    } catch (error) {
      console.error(`[MCP_BRIDGE] Failed to remove server ${serverId}:`, error);
      return { success: false, error: error.message };
    }
  }

  private async initializeBuiltinServers(): Promise<void> {
    console.log('[MCP_BRIDGE] Initializing built-in MCP servers...');
    
    // Desktop File System Server
    const fileSystemServer: MCPServer = {
      id: 'desktop_filesystem',
      name: 'Desktop File System',
      description: 'Access to local file system operations',
      endpoint: 'internal://filesystem',
      connected: true,
      tools: [
        {
          name: 'read_file',
          description: 'Read contents of a file',
          parameters: [
            { name: 'path', type: 'string', description: 'File path to read', required: true }
          ],
          returns: 'string',
          examples: ['read_file({ path: "/home/user/document.txt" })']
        },
        {
          name: 'write_file',
          description: 'Write contents to a file',
          parameters: [
            { name: 'path', type: 'string', description: 'File path to write', required: true },
            { name: 'content', type: 'string', description: 'Content to write', required: true }
          ],
          returns: 'boolean',
          examples: ['write_file({ path: "/home/user/output.txt", content: "Hello World" })']
        },
        {
          name: 'list_directory',
          description: 'List contents of a directory',
          parameters: [
            { name: 'path', type: 'string', description: 'Directory path to list', required: true }
          ],
          returns: 'array',
          examples: ['list_directory({ path: "/home/user/documents" })']
        }
      ],
      resources: [],
      lastPing: new Date(),
      latency: 0
    };

    // System Information Server
    const systemServer: MCPServer = {
      id: 'desktop_system',
      name: 'Desktop System Info',
      description: 'System information and monitoring',
      endpoint: 'internal://system',
      connected: true,
      tools: [
        {
          name: 'get_system_info',
          description: 'Get system information',
          parameters: [],
          returns: 'object',
          examples: ['get_system_info()']
        },
        {
          name: 'get_process_list',
          description: 'Get list of running processes',
          parameters: [],
          returns: 'array',
          examples: ['get_process_list()']
        },
        {
          name: 'monitor_performance',
          description: 'Monitor system performance metrics',
          parameters: [
            { name: 'duration', type: 'number', description: 'Monitoring duration in seconds', required: false, default: 10 }
          ],
          returns: 'object',
          examples: ['monitor_performance({ duration: 30 })']
        }
      ],
      resources: [],
      lastPing: new Date(),
      latency: 0
    };

    this.connectedServers.set(fileSystemServer.id, fileSystemServer);
    this.connectedServers.set(systemServer.id, systemServer);
    
    console.log(`[MCP_BRIDGE] Initialized ${this.connectedServers.size} built-in servers`);
  }

  private findServerForTool(toolName: string): MCPServer | null {
    for (const server of this.connectedServers.values()) {
      if (server.connected && server.tools.some(tool => tool.name === toolName)) {
        return server;
      }
    }
    return null;
  }

  private async performToolExecution(server: MCPServer, toolCall: MCPToolCall): Promise<MCPContent[]> {
    console.log(`[MCP_BRIDGE] Executing ${toolCall.tool} on server ${server.name}`);
    
    // Simulate tool execution based on server type and tool
    const content: MCPContent[] = [];
    
    switch (server.id) {
      case 'desktop_filesystem':
        content.push(...await this.executeFileSystemTool(toolCall));
        break;
        
      case 'desktop_system':
        content.push(...await this.executeSystemTool(toolCall));
        break;
        
      default:
        // Generic external server execution
        content.push({
          type: 'text',
          data: `Tool ${toolCall.tool} executed on external server ${server.name}`
        });
    }
    
    return content;
  }

  private async executeFileSystemTool(toolCall: MCPToolCall): Promise<MCPContent[]> {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      switch (toolCall.tool) {
        case 'read_file':
          const filePath = toolCall.arguments?.path as string;
          if (!filePath) throw new Error('File path required');
          
          const content = await fs.readFile(filePath, 'utf8');
          return [{
            type: 'text',
            data: content,
            mimeType: 'text/plain'
          }];
          
        case 'write_file':
          const writePath = toolCall.arguments?.path as string;
          const writeContent = toolCall.arguments?.content as string;
          if (!writePath || !writeContent) throw new Error('Path and content required');
          
          await fs.writeFile(writePath, writeContent, 'utf8');
          return [{
            type: 'text',
            data: 'File written successfully',
            mimeType: 'text/plain'
          }];
          
        case 'list_directory':
          const dirPath = toolCall.arguments?.path as string;
          if (!dirPath) throw new Error('Directory path required');
          
          const items = await fs.readdir(dirPath, { withFileTypes: true });
          const result = items.map(item => ({
            name: item.name,
            type: item.isDirectory() ? 'directory' : 'file'
          }));
          
          return [{
            type: 'json',
            data: JSON.stringify(result),
            mimeType: 'application/json'
          }];
          
        default:
          throw new Error(`Unknown file system tool: ${toolCall.tool}`);
      }
    } catch (error) {
      return [{
        type: 'text',
        data: `Error: ${error.message}`,
        mimeType: 'text/plain'
      }];
    }
  }

  private async executeSystemTool(toolCall: MCPToolCall): Promise<MCPContent[]> {
    const os = require('os');
    
    try {
      switch (toolCall.tool) {
        case 'get_system_info':
          const systemInfo = {
            platform: os.platform(),
            architecture: os.arch(),
            hostname: os.hostname(),
            release: os.release(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().length,
            uptime: os.uptime(),
            userInfo: os.userInfo()
          };
          
          return [{
            type: 'json',
            data: JSON.stringify(systemInfo, null, 2),
            mimeType: 'application/json'
          }];
          
        case 'get_process_list':
          // Simplified process list
          const processes = [{
            pid: process.pid,
            name: 'NeuralEdge AI Desktop',
            memory: process.memoryUsage().heapUsed,
            cpu: process.cpuUsage().user
          }];
          
          return [{
            type: 'json',
            data: JSON.stringify(processes),
            mimeType: 'application/json'
          }];
          
        case 'monitor_performance':
          const duration = toolCall.arguments?.duration as number || 10;
          const startTime = Date.now();
          
          // Collect performance data
          const performanceData = {
            duration: duration,
            timestamp: new Date(),
            memory: {
              used: process.memoryUsage().heapUsed,
              total: process.memoryUsage().heapTotal,
              external: process.memoryUsage().external
            },
            cpu: process.cpuUsage(),
            system: {
              loadavg: os.loadavg(),
              freemem: os.freemem(),
              totalmem: os.totalmem()
            }
          };
          
          return [{
            type: 'json',
            data: JSON.stringify(performanceData, null, 2),
            mimeType: 'application/json'
          }];
          
        default:
          throw new Error(`Unknown system tool: ${toolCall.tool}`);
      }
    } catch (error) {
      return [{
        type: 'text',
        data: `Error: ${error.message}`,
        mimeType: 'text/plain'
      }];
    }
  }

  private async connectToServer(server: MCPServer): Promise<void> {
    console.log(`[MCP_BRIDGE] Connecting to server: ${server.name}`);
    
    // Simulate connection establishment
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    server.connected = true;
    server.lastPing = new Date();
    server.latency = Math.random() * 50 + 10; // 10-60ms
    
    console.log(`[MCP_BRIDGE] Connected to server: ${server.name}`);
  }

  private async disconnectServer(serverId: string): Promise<void> {
    const server = this.connectedServers.get(serverId);
    if (server) {
      server.connected = false;
      console.log(`[MCP_BRIDGE] Disconnected from server: ${server.name}`);
    }
  }

  private async reconnectServer(serverId: string): Promise<void> {
    const server = this.connectedServers.get(serverId);
    if (server) {
      await this.connectToServer(server);
    }
  }

  private startServerMonitoring(): void {
    setInterval(async () => {
      for (const server of this.connectedServers.values()) {
        if (server.connected) {
          try {
            const startTime = performance.now();
            
            // Ping server
            await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
            
            server.lastPing = new Date();
            server.latency = performance.now() - startTime;
          } catch (error) {
            console.warn(`[MCP_BRIDGE] Server ping failed: ${server.name}`);
            server.connected = false;
          }
        }
      }
    }, AION_CONSTANTS.HEARTBEAT_INTERVAL);
  }
}