# 股票智能分析系统

基于AI多Agent协作的股票分析平台，支持A股、港股、美股的深度分析。

## 技术栈

### 前端
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- MongoDB (Mongoose)

### 后端
- Python FastAPI
- AkShare (A股数据)
- yFinance (港股/美股数据)
- CrewAI (多Agent AI分析)
- DeepSeek (LLM模型)

## 项目结构

```
stock-analyzer/
├── app/                      # Next.js App Router
│   ├── analyze/             # 分析结果页面
│   ├── api/                 # API Routes
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/              # React组件
├── lib/                   # 工具库
│   └── mongodb.ts         # MongoDB连接
├── models/                # MongoDB数据模型
├── python-service/         # Python数据采集和AI分析服务
│   ├── main.py           # FastAPI主服务
│   ├── agents/           # CrewAI Agents
│   ├── data/             # 数据采集工具
│   └── utils/            # 工具函数
├── public/               # 静态资源
├── styles/               # 全局样式
└── package.json          # 依赖配置
```

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.9+
- MongoDB (本地或MongoDB Atlas)

### 1. 安装依赖

```bash
# 前端依赖
cd stock-analyzer
npm install

# Python依赖
cd python-service
pip install -r requirements.txt
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/stock_analyzer

# 或者使用MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock_analyzer

# Python服务URL
PYTHON_API_URL=http://localhost:8000

# DeepSeek API (Python服务使用)
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

在 `python-service/.env` 文件中配置：

```bash
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
```

### 3. 启动MongoDB

**本地MongoDB：**
```bash
mongod --dbpath /path/to/data
```

**或使用Docker：**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. 启动Python服务

```bash
cd python-service
python main.py
```

服务将在 http://localhost:8000 启动

### 5. 启动Next.js前端

```bash
# 返回根目录
cd ..
npm run dev
```

前端将在 http://localhost:3000 启动

## 功能说明

### 当前MVP功能
- [x] 股票代码输入和查询
- [x] 多角色AI分析（6个专业Agent）
- [x] 综合评分和投资建议
- [x] 风险和机会提示
- [x] 分析结果缓存（24小时）
- [x] 响应式UI设计

### 待实现功能
- [ ] 实际数据采集（AkShare、yFinance）
- [ ] CrewAI多Agent深度分析
- [ ] K线图展示（Highcharts）
- [ ] 新闻情感分析
- [ ] 技术指标计算（MACD、RSI、KDJ等）
- [ ] 用户认证和配额管理

## API接口

### POST /api/analyze
分析股票

请求：
```json
{
  "symbol": "000001"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "overallScore": 78.5,
    "recommendation": "buy",
    "confidence": 85.2,
    "summary": "...",
    "roleAnalysis": [...],
    "risks": [...],
    "opportunities": [...]
  }
}
```

### GET /health
健康检查

## 部署

### 前端部署（Vercel）
```bash
npm run build
vercel deploy
```

### Python服务部署（Railway/Fly.io）
```bash
# 使用Railway CLI
railway login
railway init
railway up

# 或使用Fly.io CLI
fly launch
fly deploy
```

### MongoDB部署（MongoDB Atlas）
1. 访问 https://www.mongodb.com/cloud/atlas
2. 创建免费集群
3. 获取连接字符串
4. 更新 `.env.local` 中的 `MONGODB_URI`

## 开发计划

### Phase 1: MVP (已完成)
- 基础架构搭建
- 模拟数据和分析
- 前端UI实现

### Phase 2: 数据采集 (进行中)
- 集成AkShare采集A股数据
- 集成yFinance采集港股/美股数据
- 实现技术指标计算

### Phase 3: AI分析
- 实现CrewAI多Agent系统
- 集成DeepSeek API
- 优化分析prompt

### Phase 4: 完善优化
- K线图展示
- 性能优化
- 用户体验改进

## 注意事项

1. **MongoDB连接**：确保MongoDB正在运行或使用MongoDB Atlas
2. **Python依赖**：AkShare和yFinance需要网络连接访问数据源
3. **DeepSeek API**：需要有效的API密钥才能进行真实分析
4. **数据准确性**：MVP阶段使用模拟数据，生产环境需验证数据准确性

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
