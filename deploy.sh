#!/bin/bash

# ================================================
# 股票智能分析系统 - 部署脚本
# ================================================
#
# 支持的部署平台:
# - Vercel (前端)
# - Railway (Python后端)
# - MongoDB Atlas (数据库)
#
# 使用方法:
# ./deploy.sh [platform]
#
# 例如:
# ./deploy.sh vercel    # 部署前端到Vercel
# ./deploy.sh railway   # 部署后端到Railway
# ./deploy.sh all       # 部署所有服务
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
check_env_vars() {
    log_info "检查环境变量配置..."

    local required_vars=("DEEPSEEK_API_KEY" "MONGODB_URI" "NEXTAUTH_SECRET")
    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "缺少必需的环境变量:"
        printf '  - %s\n' "${missing_vars[@]}"
        log_error "请在 .env.local 文件中配置这些变量"
        exit 1
    fi

    log_success "环境变量检查通过"
}

# 部署到Vercel
deploy_vercel() {
    log_info "开始部署前端到 Vercel..."

    # 检查 Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_error "未安装 Vercel CLI，请运行: npm i -g vercel"
        exit 1
    fi

    # 检查是否已登录
    if ! vercel whoami &> /dev/null; then
        log_warning "请先登录 Vercel:"
        vercel login
    fi

    # 部署
    log_info "执行 Vercel 部署..."
    vercel --prod

    log_success "前端部署完成！"
    log_info "请在 Vercel 控制台配置以下环境变量:"
    echo "  - DEEPSEEK_API_KEY"
    echo "  - MONGODB_URI"
    echo "  - NEXTAUTH_SECRET"
    echo "  - NEXTAUTH_URL (生产域名)"
    echo "  - PYTHON_API_URL (Railway 后端地址)"
}

# 部署到Railway
deploy_railway() {
    log_info "开始部署 Python 后端到 Railway..."

    # 检查 Railway CLI
    if ! command -v railway &> /dev/null; then
        log_error "未安装 Railway CLI，请运行: npm i -g @railway/cli"
        exit 1
    fi

    # 检查是否已登录
    if ! railway whoami &> /dev/null; then
        log_warning "请先登录 Railway:"
        railway login
    fi

    # 进入 Python 服务目录
    cd python-service

    # 创建 railway.toml 如果不存在
    if [[ ! -f "railway.toml" ]]; then
        log_info "创建 Railway 配置文件..."
        cat > railway.toml << EOF
[build]
builder = "python"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "python main.py"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
EOF
    fi

    # 部署
    log_info "执行 Railway 部署..."
    railway deploy

    # 获取服务 URL
    local service_url=$(railway domain)

    log_success "后端部署完成！"
    log_info "Railway 服务地址: $service_url"
    log_info "请在前端环境变量中设置: PYTHON_API_URL=$service_url"
}

# 部署所有服务
deploy_all() {
    log_info "开始部署所有服务..."

    # 部署后端
    deploy_railway

    # 获取后端 URL
    local backend_url=$(railway domain 2>/dev/null || echo "请手动获取 Railway URL")

    # 设置前端环境变量
    if [[ -n "$backend_url" && "$backend_url" != "请手动获取 Railway URL" ]]; then
        export PYTHON_API_URL="$backend_url"
        log_info "设置 PYTHON_API_URL=$backend_url"
    fi

    # 部署前端
    deploy_vercel

    log_success "所有服务部署完成！"
}

# 显示帮助信息
show_help() {
    echo "股票智能分析系统 - 部署脚本"
    echo ""
    echo "用法:"
    echo "  $0 [platform]"
    echo ""
    echo "平台选项:"
    echo "  vercel    部署前端到 Vercel"
    echo "  railway   部署 Python 后端到 Railway"
    echo "  all       部署所有服务"
    echo ""
    echo "示例:"
    echo "  $0 vercel"
    echo "  $0 railway"
    echo "  $0 all"
    echo ""
    echo "前置要求:"
    echo "  - 配置 .env.local 文件"
    echo "  - 安装 Vercel CLI: npm i -g vercel"
    echo "  - 安装 Railway CLI: npm i -g @railway/cli"
    echo "  - 登录相应平台账号"
}

# 主函数
main() {
    local platform="$1"

    case "$platform" in
        "vercel")
            check_env_vars
            deploy_vercel
            ;;
        "railway")
            check_env_vars
            deploy_railway
            ;;
        "all")
            check_env_vars
            deploy_all
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