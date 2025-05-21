import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const app = express();
app.use(express.json());

// 初始化 MCP 服务器
const server = new Server(
  {
    name: "example-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // 启用工具支持
    },
  }
);

// 定义工具列表
const TOOLS = [
  {
    name: "get_time",
    description: "返回当前的服务器时间",
    inputSchema: {
      type: "object",
      properties: {},
    },
    run: async () => {
      const now = new Date().toISOString();
      return {
        content: [
          {
            type: "text",
            text: `当前时间是：${now}`,
          },
        ],
      };
    },
  },
  {
    name: "random_number",
    description: "返回一个0到100之间的随机整数",
    inputSchema: {
      type: "object",
      properties: {},
    },
    run: async () => {
      const number = Math.floor(Math.random() * 101);
      return {
        content: [
          {
            type: "text",
            text: `随机数：${number}`,
          },
        ],
      };
    },
  },
];

// 设置请求处理器
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // 支持JSON-RPC格式请求
  const tool = request.params
  
  const matchedTool = TOOLS.find((t) => t.name === tool.name);
  if (!matchedTool) {
    return {
      error: `未找到名为 ${tool.name} 的工具`,
    };
  }
  const result = await matchedTool.run(tool.input);
  return { result };
});

// 存储会话 ID 到传输实例的映射
const transports = new Map();

// 设置 SSE 路由
app.get("/sse", (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  console.log(`[${new Date().toISOString()}] 收到SSE连接请求,来自:`, req.headers);
  console.log(`[${new Date().toISOString()}] 新的SSE连接建立: ${sessionId}`);
  transports.set(transport.sessionId, transport);
  res.on("close", () => {
    transports.delete(transport.sessionId);
    console.log(`[${new Date().toISOString()}] SSE连接关闭: ${sessionId}`);
  });
  server.connect(transport);
  console.log(`[${new Date().toISOString()}] MCP服务器连接成功: ${sessionId}`);
});

// 处理 POST 消息
app.post("/messages", (req, res) => {
  console.log(`[${new Date().toISOString()}] 收到客户端消息:`, req.query);
  const sessionId = req.query.sessionId;
  const transport = transports.get(sessionId);
  if (transport) {
    console.log(`[${new Date().toISOString()}] 消息路由到: ${sessionId}`);
    transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send("No transport found for sessionId");
  }
});

// 启动服务器
app.listen(3000, () => {
  console.log("MCP 服务器已启动，监听端口 3000");
});
