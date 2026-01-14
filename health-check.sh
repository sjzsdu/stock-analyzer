#!/bin/bash

# ================================================
# 股票智能分析系统 - 健康检查脚本
# ================================================
#
# 检查系统各组件的健康状态:
# - 数据库连接
# - Python API 服务
# - Next.js 前端服务
# - AI 服务可用性
#
# 使用方法:
# ./health-check.sh
# ================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查数据库连接
check_database() {
    log_info "🔍 检查数据库连接..."

    # 加载环境变量
    if [[ -f ".env.local" ]]; then
        set -a
        source .env.local
        set +a
    fi

    if [[ -z "$MONGODB_URI" ]]; then
        log_error "❌ MONGODB_URI 未配置"
        return 1
    fi

    # 使用 Node.js 测试连接
    if node -e "
    const mongoose = require('mongoose');
    mongoose.connect('$MONGODB_URI', {
        serverSelectionTimeoutMS: 5000,
    }).then(() => {
        console.log('✅ 数据库连接正常');
        return mongoose.connection.close();
    }).catch(err => {
        console.error('❌ 数据库连接失败:', err.message);
        process.exit(1);
    });
    "; then
        log_success "✅ 数据库连接正常"
        return 0
    else
        log_error "❌ 数据库连接失败"
        return 1
    fi
}

# 检查 Python API 服务
check_python_api() {
    log_info "🔍 检查 Python API 服务..."

    local api_url="${PYTHON_API_URL:-http://localhost:8000}"

    if curl -s -f --max-time 10 "$api_url/health" > /dev/null; then
        log_success "✅ Python API 服务正常 ($api_url)"
        return 0
    else
        log_error "❌ Python API 服务不可用 ($api_url)"
        return 1
    fi
}

# 检查 Next.js 前端服务
check_nextjs() {
    log_info "🔍 检查 Next.js 前端服务..."

    local frontend_url="${NEXTAUTH_URL:-http://localhost:3000}"

    if curl -s -f --max-time 10 "$frontend_url" > /dev/null; then
        log_success "✅ Next.js 前端服务正常 ($frontend_url)"
        return 0
    else
        log_error "❌ Next.js 前端服务不可用 ($frontend_url)"
        return 1
    fi
}

# 检查 AI 服务
check_ai_service() {
    log_info "🔍 检查 AI 服务可用性..."

    # 加载环境变量
    if [[ -f ".env.local" ]]; then
        set -a
        source .env.local
        set +a
    fi

    if [[ -z "$DEEPSEEK_API_KEY" ]]; then
        log_error "❌ DEEPSEEK_API_KEY 未配置"
        return 1
    fi

    # 使用 Python 测试 AI 服务
    if python3 -c "
import os
import requests

api_key = os.getenv('DEEPSEEK_API_KEY')
if not api_key:
    print('❌ API Key 未设置')
    exit(1)

try:
    response = requests.post(
        'https://api.deepseek.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'deepseek-chat',
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'max_tokens': 10
        },
        timeout=10
    )

    if response.status_code == 200:
        print('✅ AI 服务可用')
    else:
        print(f'❌ AI 服务返回错误: {response.status_code}')
        exit(1)

except Exception as e:
    print(f'❌ AI 服务连接失败: {e}')
    exit(1)
    "; then
        log_success "✅ AI 服务可用"
        return 0
    else
        log_error "❌ AI 服务不可用"
        return 1
    fi
}

# 检查系统资源
check_system_resources() {
    log_info "🔍 检查系统资源..."

    # 检查磁盘空间
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        log_warning "⚠️  磁盘使用率过高: ${disk_usage}%"
    else
        log_success "✅ 磁盘空间充足 (${disk_usage}%)"
    fi

    # 检查内存使用
    local mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [[ $mem_usage -gt 90 ]]; then
        log_warning "⚠️  内存使用率过高: ${mem_usage}%"
    else
        log_success "✅ 内存使用正常 (${mem_usage}%)"
    fi
}

# 显示服务状态
show_service_status() {
    echo ""
    log_info "📊 服务状态概览"
    echo "=========================================="

    # 数据库状态
    if check_database > /dev/null 2>&1; then
        echo -e "🗄️  数据库:     ${GREEN}正常${NC}"
    else
        echo -e "🗄️  数据库:     ${RED}异常${NC}"
    fi

    # Python API 状态
    if check_python_api > /dev/null 2>&1; then
        echo -e "🐍 Python API: ${GREEN}正常${NC}"
    else
        echo -e "🐍 Python API: ${RED}异常${NC}"
    fi

    # Next.js 状态
    if check_nextjs > /dev/null 2>&1; then
        echo -e "⚛️  Next.js:    ${GREEN}正常${NC}"
    else
        echo -e "⚛️  Next.js:    ${RED}异常${NC}"
    fi

    # AI 服务状态
    if check_ai_service > /dev/null 2>&1; then
        echo -e "🤖 AI 服务:    ${GREEN}正常${NC}"
    else
        echo -e "🤖 AI 服务:    ${RED}异常${NC}"
    fi

    echo "=========================================="
}

# 主函数
main() {
    echo "🏥 股票智能分析系统 - 健康检查"
    echo "=================================="

    local checks_passed=0
    local total_checks=0

    # 执行各项检查
    ((total_checks++))
    if check_database; then
        ((checks_passed++))
    fi

    ((total_checks++))
    if check_python_api; then
        ((checks_passed++))
    fi

    ((total_checks++))
    if check_nextjs; then
        ((checks_passed++))
    fi

    ((total_checks++))
    if check_ai_service; then
        ((checks_passed++))
    fi

    ((total_checks++))
    if check_system_resources; then
        ((checks_passed++))
    fi

    # 显示服务状态
    show_service_status

    # 报告结果
    echo ""
    if [[ $checks_passed -eq $total_checks ]]; then
        log_success "🎉 所有健康检查通过！系统运行正常。"
        exit 0
    else
        log_warning "⚠️  部分检查未通过: $checks_passed/$total_checks"
        log_info "💡 建议检查上述失败的项目"
        exit 1
    fi
}

# 执行主函数
main "$@"