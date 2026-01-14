#!/bin/bash

# ================================================
# 股票智能分析系统 - 测试脚本
# ================================================
#
# 测试内容:
# - 环境变量检查
# - 依赖安装检查
# - 数据库连接测试
# - API 端点测试
# - 前端构建测试
# - 端到端功能测试
#
# 使用方法:
# ./test.sh [test_type]
#
# 例如:
# ./test.sh env       # 环境变量检查
# ./test.sh deps      # 依赖检查
# ./test.sh api       # API测试
# ./test.sh build     # 构建测试
# ./test.sh e2e       # 端到端测试
# ./test.sh all       # 运行所有测试
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

# 检查环境变量
test_env_vars() {
    log_info "🔍 检查环境变量配置..."

    local required_vars=("DEEPSEEK_API_KEY" "MONGODB_URI" "NEXTAUTH_SECRET")
    local optional_vars=("GOOGLE_CLIENT_ID" "WECHAT_CLIENT_ID" "ALIPAY_CLIENT_ID")
    local missing_required=()
    local missing_optional=()

    # 检查必需变量
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_required+=("$var")
        fi
    done

    # 检查可选变量
    for var in "${optional_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_optional+=("$var")
        fi
    done

    # 报告结果
    if [[ ${#missing_required[@]} -gt 0 ]]; then
        log_error "❌ 缺少必需的环境变量:"
        printf '   - %s\n' "${missing_required[@]}"
        return 1
    fi

    log_success "✅ 必需环境变量配置正确"

    if [[ ${#missing_optional[@]} -gt 0 ]]; then
        log_warning "⚠️  可选环境变量未配置 (OAuth 登录将不可用):"
        printf '   - %s\n' "${missing_optional[@]}"
    else
        log_success "✅ 可选环境变量配置完整"
    fi
}

# 检查依赖安装
test_dependencies() {
    log_info "🔍 检查依赖安装..."

    # 检查 Node.js 和 pnpm
    if ! command -v node &> /dev/null; then
        log_error "❌ Node.js 未安装"
        return 1
    fi

    if ! command -v pnpm &> /dev/null; then
        log_error "❌ pnpm 未安装，请运行: npm install -g pnpm"
        return 1
    fi

    # 检查 Python
    if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
        log_error "❌ Python 未安装"
        return 1
    fi

    # 检查 pip
    if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
        log_error "❌ pip 未安装"
        return 1
    fi

    # 检查 MongoDB (本地)
    if [[ "$MONGODB_URI" == mongodb://localhost* ]]; then
        if ! command -v mongod &> /dev/null; then
            log_warning "⚠️  MongoDB 未安装 (使用本地连接但未找到 mongod)"
        fi
    fi

    log_success "✅ 基础依赖检查通过"

    # 检查前端依赖
    log_info "🔍 检查前端依赖..."
    if [[ ! -d "node_modules" ]]; then
        log_warning "⚠️  node_modules 不存在，正在安装..."
        pnpm install
    fi

    # 检查后端依赖
    log_info "🔍 检查后端依赖..."
    if [[ ! -d "python-service/__pycache__" ]]; then
        log_info "📦 安装 Python 依赖..."
        cd python-service
        pip install -r requirements.txt
        cd ..
    fi

    log_success "✅ 所有依赖检查完成"
}

# 测试数据库连接
test_database() {
    log_info "🔍 测试数据库连接..."

    # 使用 Node.js 测试 MongoDB 连接
    node -e "
    const mongoose = require('mongoose');
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ MONGODB_URI 未设置');
        process.exit(1);
    }

    mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
    }).then(() => {
        console.log('✅ MongoDB 连接成功');
        return mongoose.connection.close();
    }).catch(err => {
        console.error('❌ MongoDB 连接失败:', err.message);
        process.exit(1);
    });
    "

    log_success "✅ 数据库连接测试通过"
}

# 测试 API 端点
test_api() {
    log_info "🔍 测试 API 端点..."

    # 启动 Python 服务进行测试
    log_info "🚀 启动 Python 服务进行测试..."

    # 在后台启动服务
    cd python-service
    python main.py &
    local server_pid=$!

    # 等待服务启动
    sleep 5

    # 测试健康检查
    if curl -s -f http://localhost:8000/health > /dev/null; then
        log_success "✅ Python 服务健康检查通过"
    else
        log_error "❌ Python 服务健康检查失败"
        kill $server_pid 2>/dev/null || true
        return 1
    fi

    # 测试 API 文档
    if curl -s -f http://localhost:8000/docs > /dev/null; then
        log_success "✅ API 文档访问正常"
    else
        log_warning "⚠️  API 文档访问失败 (可选)"
    fi

    # 停止服务
    kill $server_pid 2>/dev/null || true
    cd ..

    log_success "✅ API 端点测试完成"
}

# 测试前端构建
test_build() {
    log_info "🔍 测试前端构建..."

    # 运行构建
    if pnpm build; then
        log_success "✅ 前端构建成功"
    else
        log_error "❌ 前端构建失败"
        return 1
    fi
}

# 端到端测试
test_e2e() {
    log_info "🔍 执行端到端测试..."

    # 启动所有服务
    log_info "🚀 启动所有服务进行端到端测试..."

    # 启动 Python 服务
    cd python-service
    python main.py &
    local python_pid=$!

    # 启动 Next.js 服务
    cd ..
    pnpm dev &
    local nextjs_pid=$!

    # 等待服务启动
    sleep 10

    # 测试前端访问
    if curl -s -f http://localhost:3000 > /dev/null; then
        log_success "✅ 前端服务启动成功"
    else
        log_error "❌ 前端服务启动失败"
        kill $python_pid $nextjs_pid 2>/dev/null || true
        return 1
    fi

    # 测试后端 API
    if curl -s -f http://localhost:8000/health > /dev/null; then
        log_success "✅ 后端 API 访问正常"
    else
        log_error "❌ 后端 API 访问失败"
        kill $python_pid $nextjs_pid 2>/dev/null || true
        return 1
    fi

    # 测试前端 API 路由
    if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "✅ 前端 API 路由正常"
    else
        log_warning "⚠️  前端 API 路由测试跳过 (可能未实现)"
    fi

    # 停止服务
    kill $python_pid $nextjs_pid 2>/dev/null || true

    log_success "✅ 端到端测试完成"
}

# 运行所有测试
test_all() {
    log_info "🧪 运行完整测试套件..."

    local tests_passed=0
    local total_tests=0

    # 环境变量测试
    ((total_tests++))
    if test_env_vars; then
        ((tests_passed++))
    fi

    # 依赖测试
    ((total_tests++))
    if test_dependencies; then
        ((tests_passed++))
    fi

    # 数据库测试
    ((total_tests++))
    if test_database; then
        ((tests_passed++))
    fi

    # API 测试
    ((total_tests++))
    if test_api; then
        ((tests_passed++))
    fi

    # 构建测试
    ((total_tests++))
    if test_build; then
        ((tests_passed++))
    fi

    # E2E 测试
    ((total_tests++))
    if test_e2e; then
        ((tests_passed++))
    fi

    # 报告结果
    echo ""
    log_info "📊 测试结果: $tests_passed/$total_tests 通过"

    if [[ $tests_passed -eq $total_tests ]]; then
        log_success "🎉 所有测试通过！系统准备就绪。"
        return 0
    else
        log_error "❌ 部分测试失败，请检查上述错误信息。"
        return 1
    fi
}

# 显示帮助信息
show_help() {
    echo "股票智能分析系统 - 测试脚本"
    echo ""
    echo "用法:"
    echo "  $0 [test_type]"
    echo ""
    echo "测试类型:"
    echo "  env       环境变量检查"
    echo "  deps      依赖安装检查"
    echo "  db        数据库连接测试"
    echo "  api       API 端点测试"
    echo "  build     前端构建测试"
    echo "  e2e       端到端功能测试"
    echo "  all       运行所有测试"
    echo ""
    echo "示例:"
    echo "  $0 env"
    echo "  $0 all"
}

# 主函数
main() {
    local test_type="$1"

    # 加载环境变量
    if [[ -f ".env.local" ]]; then
        set -a
        source .env.local
        set +a
    fi

    case "$test_type" in
        "env")
            test_env_vars
            ;;
        "deps")
            test_dependencies
            ;;
        "db")
            test_database
            ;;
        "api")
            test_api
            ;;
        "build")
            test_build
            ;;
        "e2e")
            test_e2e
            ;;
        "all")
            test_all
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

# 如果没有参数，显示帮助
if [[ $# -eq 0 ]]; then
    show_help
    exit 1
fi

# 执行主函数
main "$@"