# 部署指南

本文档介绍如何将股票智能分析系统部署到生产环境。

## 前置要求

- Node.js 18+
- Python 3.9+
- MongoDB（本地或MongoDB Atlas）
- DeepSeek API Key（可选，用于CrewAI分析）

## 本地开发环境

### 1. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的配置：

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/stock_analyzer

# Python服务URL
PYTHON_API_URL=http://localhost:8000

# DeepSeek API（可选）
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here

# Next.js
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 2. 启动MongoDB

**方式1：使用本地MongoDB**
```bash
mongod --dbpath ./data/db
```

**方式2：使用Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. 启动开发服务器

**方式1：使用启动脚本（推荐）**
```bash
chmod +x start.sh
./start.sh
```

**方式2：手动启动**
```bash
# 启动Python服务
cd python-service
pip install -r requirements.txt
python main.py

# 启动Next.js（新终端）
npm run dev
```

### 4. 访问应用

打开浏览器访问：
- 前端：http://localhost:3000
- 后端API：http://localhost:8000
- API文档：http://localhost:8000/docs

## 生产环境部署

### MongoDB Atlas部署

1. 访问 https://www.mongodb.com/cloud/atlas
2. 创建免费集群
3. 创建数据库用户
4. 选择连接方式：
   - 驱动程序：选择Node.js
   - 获取连接字符串
5. 更新生产环境变量：
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock_analyzer
   ```

### 前端部署（Vercel）

1. 安装Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 登录Vercel：
   ```bash
   vercel login
   ```

3. 部署项目：
   ```bash
   vercel
   ```

4. 配置环境变量（在Vercel控制台或使用CLI）：
   ```bash
   vercel env add MONGODB_URI
   vercel env add PYTHON_API_URL
   vercel env add DEEPSEEK_API_KEY  # 可选
   ```

5. Vercel会自动分配域名：`https://your-project.vercel.app`

### Python服务部署（Railway）

1. 安装Railway CLI：
   ```bash
   npm i -g @railway/cli
   ```

2. 登录Railway：
   ```bash
   railway login
   ```

3. 创建新项目：
   ```bash
   railway init
   ```

4. 选择部署环境（选择Python模板或配置）
5. 部署：
   ```bash
   railway up
   ```

6. 配置环境变量（在Railway控制台）：
   - DEEPSEEK_API_KEY
   - MONGODB_URI（如果使用Railway的MongoDB插件）

7. Railway会分配一个URL，例如：`https://your-app.railway.app`

8. 更新Vercel环境变量：
   ```bash
   vercel env add PYTHON_API_URL https://your-app.railway.app
   ```

### Python服务部署（Fly.io - 备选方案）

1. 安装Fly.io CLI：
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. 登录Fly.io：
   ```bash
   flyctl auth login
   ```

3. 创建并部署应用：
   ```bash
   flyctl launch
   ```

4. 配置环境变量：
   ```bash
   flyctl secrets set DEEPSEEK_API_KEY=sk-your_key
   ```

5. 查看应用URL：
   ```bash
   flyctl info
   ```

## Docker部署（可选）

### 前端Dockerfile

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g node --gid 1000 && \
    adduser -M -u 1000 -g node nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:node /app/.next/standalone ./.next/standalone
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

### Python服务Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  python-service:
    build: ./python-service
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/stock_analyzer
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    depends_on:
      - mongodb

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PYTHON_API_URL=http://python-service:8000
      - MONGODB_URI=mongodb://mongodb:27017/stock_analyzer
    depends_on:
      - python-service

volumes:
  mongodb_data:
```

一键启动所有服务：
```bash
docker-compose up -d
```

## 监控和日志

### 查看日志

**Vercel：**
```bash
vercel logs
```

**Railway：**
```bash
railway logs
```

**Docker：**
```bash
docker logs <container_name>
```

### 健康检查

定期检查服务健康状态：

```bash
# 检查Python服务
curl http://your-python-service-url/health

# 检查MongoDB连接
# 在应用日志中查看连接错误
```

## 性能优化建议

### 前端优化

1. 启用图片优化
2. 配置CDN
3. 启用Gzip压缩（Next.js自动处理）
4. 实现代码分割

### 后端优化

1. 实现Redis缓存层
2. 数据库索引优化
3. API响应时间监控
4. 添加请求限流

## 安全建议

1. 使用HTTPS（Vercel自动处理）
2. 验证所有输入
3. 限制API请求频率
4. 不要在代码中硬编码密钥
5. 使用环境变量管理敏感信息
6. 定期更新依赖包

## 故障排查

### 常见问题

**1. MongoDB连接失败**
- 检查MONGODB_URI是否正确
- 确认MongoDB服务正在运行
- 检查防火墙设置

**2. Python服务无法访问**
- 确认PYTHON_API_URL正确配置
- 检查后端服务是否正常运行
- 查看Vercel控制台的Function Logs

**3. 分析结果错误**
- 检查DeepSeek API密钥是否有效
- 查看Python服务日志
- 确认数据采集源是否正常

**4. 前端构建失败**
- 清除.next目录重新构建
- 检查Node.js版本是否匹配
- 查看构建日志

## 回滚策略

如果部署后发现问题：

1. **Vercel回滚：**
   ```bash
   vercel rollback <deployment_id>
   ```

2. **Railway回滚：**
   ```bash
   railway rollback
   ```

3. **手动回滚：**
   - 重新部署稳定版本
   - 使用git标签管理版本

## 成本估算

**Vercel（Hobby计划）：**
- 免费：100GB带宽/月
- Pro：$20/月

**Railway：**
- Starter: $5/月起
- 支持自动扩展

**MongoDB Atlas：**
- M0（共享）：免费512MB
- M10（专用）：$9/月起

**DeepSeek API：**
- 免费额度：500万tokens
- 超出：$0.42/百万tokens

预计总成本（月度，小规模应用）：
- Vercel Pro：$20
- Railway Starter：$5
- MongoDB Atlas M10：$9
- DeepSeek API：~$10-20
- **总计：$44-54/月**

## 后续优化

1. 添加用户认证
2. 实现分析历史记录
3. 添加批量分析功能
4. 实现实时通知
5. 添加数据导出功能
