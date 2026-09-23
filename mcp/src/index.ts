#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const API_BASE_URL = process.env.GECICI_API_URL || 'https://gecici.email/api/v1';

const server = new Server(
  {
    name: 'gecici-email-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools for AI Agents
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'gecici_create_inbox',
        description: 'Creates a new disposable temporary email inbox for receiving signups, verifications, or test emails.',
        inputSchema: {
          type: 'object',
          properties: {
            prefix: {
              type: 'string',
              description: 'Optional custom username prefix (e.g. "myagent_99"). If omitted, a random address is generated.',
            },
            domain: {
              type: 'string',
              description: 'Optional domain name. Defaults to "gecici.email".',
            },
          },
        },
      },
      {
        name: 'gecici_wait_for_otp',
        description: 'Waits for an incoming verification email and directly extracts the 4-8 digit OTP code / SMS-like code.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'The disposable email address to monitor (e.g. "agent123@gecici.email").',
            },
            timeout_seconds: {
              type: 'number',
              description: 'Maximum time to wait in seconds (default: 30, max: 60).',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'gecici_wait_for_magic_link',
        description: 'Waits for an incoming email and directly extracts the account verification button URL / magic login link.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'The disposable email address to monitor.',
            },
            timeout_seconds: {
              type: 'number',
              description: 'Maximum time to wait in seconds (default: 30, max: 60).',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'gecici_get_inbox_messages',
        description: 'Lists all received messages in a disposable inbox, including senders, subjects, and extracted summaries.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'The disposable email address to inspect.',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'gecici_get_ai_summary',
        description: 'Returns a token-optimized, high-signal clean text summary of the latest email for LLMs.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'The disposable email address.',
            },
          },
          required: ['address'],
        },
      },
    ],
  };
});

// Handle tool executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'gecici_create_inbox') {
      const prefix = args?.prefix as string | undefined;
      const domain = args?.domain as string | undefined;
      
      const endpoint = prefix ? `${API_BASE_URL}/inbox/custom` : `${API_BASE_URL}/inbox/generate`;
      const body = prefix ? { prefix, domain } : { domain };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === 'gecici_wait_for_otp') {
      const address = encodeURIComponent(args?.address as string);
      const timeout = Math.min(((args?.timeout_seconds as number) || 30) * 1000, 60000);

      const response = await fetch(`${API_BASE_URL}/inbox/${address}/otp?timeout=${timeout}`);
      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === 'gecici_wait_for_magic_link') {
      const address = encodeURIComponent(args?.address as string);
      const timeout = Math.min(((args?.timeout_seconds as number) || 30) * 1000, 60000);

      const response = await fetch(`${API_BASE_URL}/inbox/${address}/links?timeout=${timeout}`);
      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === 'gecici_get_inbox_messages') {
      const address = encodeURIComponent(args?.address as string);
      const response = await fetch(`${API_BASE_URL}/inbox/${address}/messages`);
      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === 'gecici_get_ai_summary') {
      const address = encodeURIComponent(args?.address as string);
      const response = await fetch(`${API_BASE_URL}/inbox/${address}/ai-summary`);
      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    throw new Error(`Bilinmeyen araç (Unknown tool): ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Hata (Error): ${error.message}`,
        },
      ],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 gecici.email MCP Server running on stdio');
}

run().catch((error) => {
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});
