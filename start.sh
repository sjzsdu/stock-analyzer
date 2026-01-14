#!/bin/bash

# Stock Analyzer 启动脚本
# 同时启动前端(Next.js)和后端(Python FastAPI)服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    log_info "正在停止服务..."
    
    if [ -n "$NEXT_PID" ]; then
        kill $NEXT_PID 2>/dev/null || true
        log_info "Next.js 服务已停止"
    fi
    
    if [ -n "$PYTHON_PID" ]; then
        kill $PYTHON_PID 2>/dev/null || true
        log_info "Python 服务已停止"
    fi
    
    exit 0
}

trap cleanup SIGINT SIGTERM

log_info "=========================================="
log_info "       Stock Analyzer 启动脚本"
log_info "=========================================="
echo

# 停止占用端口的进程
log_info "检查端口占用情况..."
for port in 8000 3000; do
    PID=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$PID" ]; then
        log_warning "端口 $port 已被进程 $PID 占用，正在停止..."
        kill $PID 2>/dev/null || true
        sleep 1
    fi
done

# 启动 Python FastAPI 服务 (后端)
log_info "启动 Python FastAPI 服务 (http://localhost:8000)..."
cd python-service
# 使用 macOS 兼容的方式启动后台服务，替代 setsid
python -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../logs/python-service.log 2>&1 &
PYTHON_PID=$!
cd ..

# 等待并验证 Python 服务启动
log_info "等待 Python 服务启动 (PID: $PYTHON_PID)..."
sleep 5
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    log_error "Python 服务启动失败"
    log_info "查看 Python 服务日志:"
    cat logs/python-service.log
    exit 1
else
    log_success "Python 服务已启动 (PID: $PYTHON_PID)"
fi

# 验证 Python 服务健康检查
log_info "开始 Python 服务健康检查..."
for i in {1..10}; do
    log_info "健康检查尝试 $i/10..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -q "200"; then
        log_success "Python 服务健康检查通过"
        break
    fi
    if [ $i -eq 10 ]; then
        log_error "Python 服务健康检查失败"
        log_info "查看 Python 服务日志:"
        cat logs/python-service.log
        kill $PYTHON_PID 2>/dev/null || true
        exit 1
    fi
    log_info "等待 2 秒后重试..."
    sleep 2
done

# 启动 Next.js 开发服务器 (前端)
log_info "启动 Next.js 开发服务器 (http://localhost:3000)..."
npm run dev > logs/nextjs.log 2>&1 &
NEXT_PID=$!

if kill -0 $NEXT_PID 2>/dev/null; then
    log_success "Next.js 服务已启动 (PID: $NEXT_PID)"
else
    log_error "Next.js 服务启动失败"
    kill $PYTHON_PID 2>/dev/null || true
    exit 1
fi

echo
log_info "=========================================="
log_success "所有服务已成功启动！"
log_info "=========================================="
echo
log_info "前端: http://localhost:3000"
log_info "后端: http://localhost:8000"
log_info "API文档: http://localhost:8000/docs"
echo
log_info "日志文件:"
log_info "  - 前端日志: logs/nextjs.log"
log_info "  - 后端日志: logs/python-service.log"
echo
log_info "按 Ctrl+C 停止所有服务"
echo

# 等待并监控服务
while true; do
    sleep 5
    
    # 检查 Python 服务
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        log_warning "Python 服务已意外停止"
        break
    fi
    
    # 检查 Next.js 服务
    if ! kill -0 $NEXT_PID 2>/dev/null; then
        log_warning "Next.js 服务已意外停止"
        break
    fi
done

log_error "服务意外停止"
cleanup
