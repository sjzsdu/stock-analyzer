# 🚀 股票智能分析系统

基于AI多Agent协作的股票分析平台，支持A股、港股、美股的深度分析。

**✅ 所有核心功能已完成实现！**

## 🏆 项目亮点

- 🤖 **AI多Agent协作**: 6个专业Agent深度分析
- 📊 **实时数据采集**: AkShare + yFinance + 财务指标
- 💾 **智能缓存**: 24小时分析缓存，性能优化
- 🔐 **完整用户系统**: 注册登录 + OAuth + 订阅管理
- 📱 **现代化UI**: 响应式设计，暗色主题
- ⚡ **高性能**: Next.js 16 + FastAPI + MongoDB

## 技术栈

### 前端
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS + Lucide Icons
- NextAuth.js (认证)
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

## 🚀 快速开始

### 前置要求

- Node.js 18+ (推荐 20+)
- Python 3.9+ (推荐 3.11+)
- MongoDB (本地或 MongoDB Atlas)
- DeepSeek API Key (用于AI分析)

### 1. 一键安装

```bash
# 克隆项目
git clone <repository-url>
cd stock-analyzer

# 安装所有依赖
pnpm install
cd python-service && pip install -r requirements.txt && cd ..
```

### 2. 配置环境变量

```bash
# 复制配置模板
cp .env.example .env.local

# 编辑必需配置（仅需3项）
# DEEPSEEK_API_KEY=sk-your_deepseek_api_key
# MONGODB_URI=mongodb://localhost:27017/stock_analyzer
# NEXTAUTH_SECRET=your_32_character_secret_key
```

### 3. 运行测试

```bash
# 验证配置和依赖
./test.sh all
```

### 4. 启动服务

```bash
# 一键启动所有服务
./start.sh

# 或分别启动
pnpm dev                    # 前端开发服务器
# 另一个终端:
cd python-service && python main.py  # 后端API服务器
```

### 5. 访问应用

- 🌐 **前端应用**: http://localhost:3000
- 🔌 **后端API**: http://localhost:8000
- 📚 **API文档**: http://localhost:8000/docs

### 🎯 立即体验

1. 访问 http://localhost:3000
2. 点击"注册"创建账户
3. 搜索股票代码（如: 000001）
4. 查看AI深度分析报告

## ✨ 完整功能特性

### 🎯 核心功能 (全部完成)
- ✅ **用户系统**: 注册登录、OAuth集成、个人设置、订阅管理
- ✅ **股票分析**: 6维度AI深度分析、置信度评估、推理过程
- ✅ **数据采集**: AkShare(yFinance集成、财务指标、杜邦分析
- ✅ **智能缓存**: 24小时分析缓存、性能优化、重复请求避免
- ✅ **历史管理**: 分析历史追踪、收藏功能、搜索过滤
- ✅ **可视化**: K线图展示、技术指标、响应式UI设计

### 🤖 AI分析能力
- 🧠 **估值分析**: DCF模型、相对估值、置信度评估
- 📈 **技术分析**: 趋势识别、支撑阻力、指标信号
- 🌱 **成长分析**: 营收利润趋势、可持续性评估
- 🏢 **基本面分析**: 盈利能力、运营效率、资产质量
- 🛡️ **风险评估**: 市场风险、行业风险、公司特有风险
- 🌐 **宏观分析**: 经济周期、利率、通胀政策影响

### 🔐 用户体验
- 📱 **现代化UI**: 暗色主题、响应式设计、流畅动画
- 🚀 **高性能**: 快速加载、智能缓存、优化体验
- 🛡️ **安全可靠**: 数据加密、输入验证、错误处理
- 🌍 **多语言**: 界面语言切换、国际化支持
- 📊 **数据可视化**: 图表展示、指标对比、趋势分析

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

## 🚀 生产部署

### 推荐方案：Vercel + Railway + MongoDB Atlas

```bash
# 一键部署所有服务
./deploy.sh all

# 或分别部署
./deploy.sh railway   # 部署Python后端
./deploy.sh vercel    # 部署Next.js前端
```

### 手动部署选项

#### 1. 数据库 (MongoDB Atlas)
访问 https://cloud.mongodb.com 创建免费集群

#### 2. 后端 (Railway)
```bash
railway login
railway init
railway up
```

#### 3. 前端 (Vercel)
```bash
vercel login
vercel
```

### 📖 详细部署指南

查看 [部署指南](./DEPLOYMENT.md) 了解完整部署流程、环境配置和故障排除。

## ✅ 开发完成状态

### Phase 1: 用户系统 ✅ 完成
- 🔐 完整用户认证系统 (NextAuth.js)
- 👤 用户注册和登录 (邮箱 + OAuth)
- ⚙️ 个人设置管理 (语言、模型偏好)
- 💳 订阅等级系统 (免费/基础/专业/企业)

### Phase 2: 增强数据 ✅ 完成
- 📊 股票基本信息扩展 (公司资料、财务数据)
- 🧮 财务指标计算 (杜邦分析、估值指标)
- 📈 实时数据采集 (AkShare + yFinance)
- 🏭 行业板块数据 (概念标签、区域信息)

### Phase 3: 分析历史 ✅ 完成
- 💾 智能缓存系统 (24小时分析缓存)
- 📚 分析历史管理 (收藏、标签、搜索)
- 🔄 缓存服务架构 (性能优化、重复请求避免)
- 📱 历史界面设计 (分页、过滤、排序)

### Phase 4: 增强AI分析 ✅ 完成
- 🤖 多Agent协作系统 (6个专业分析Agent)
- 📝 结构化分析报告 (推理过程、证据引用)
- 🎯 置信度评估 (多维度可靠性评分)
- 🛡️ 风险量化分析 (概率和影响评估)

---

## 🎯 核心价值

- **AI驱动**: 基于DeepSeek的智能分析
- **数据丰富**: 多源数据采集和处理
- **用户友好**: 现代化UI和流畅体验
- **高性能**: 智能缓存和优化架构
- **安全可靠**: 完整的安全措施和错误处理
- **易于扩展**: 模块化设计，支持功能扩展

## 🛠️ 开发工具

### 测试和验证
```bash
# 完整测试套件
./test.sh all

# 健康检查
./health-check.sh

# 单独测试
./test.sh env    # 环境变量
./test.sh build  # 构建测试
./test.sh api    # API测试
```

### 代码质量
- ✅ **TypeScript**: 完整类型覆盖
- ✅ **ESLint**: 代码规范检查
- ✅ **Prettier**: 自动格式化
- ✅ **测试覆盖**: 核心功能测试

## 📋 注意事项

1. **API密钥**: 需要有效的DeepSeek API密钥进行AI分析
2. **数据库**: 支持本地MongoDB或MongoDB Atlas云数据库
3. **网络**: 数据采集需要稳定的网络连接
4. **OAuth**: 可选配置，支持Google、微信、支付宝等OAuth登录
5. **缓存**: 24小时分析缓存可提高性能并减少API调用

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系我们

- 📧 **邮箱**: your-email@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 **文档**: [部署指南](./DEPLOYMENT.md)

---

## 🎉 项目状态

**✅ 所有核心功能已完成！**

🚀 **立即可用**: 完整的股票分析平台，支持用户注册、AI深度分析、历史管理等全部功能。

💡 **开始使用**: 运行 `./start.sh` 启动服务，访问 http://localhost:3000 开始您的智能投资之旅！

**祝您投资顺利，决策精准！** 📈💰
