/**
 * NextAuth.js API路由
 * 
 * 处理所有认证相关的API请求
 * 
 * @module app/api/auth/[...nextauth]
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAvailableOAuthProviders } from '@/lib/auth-domestic-oauth';

const handler = NextAuth(authOptions);

// 导出GET和POST方法
export { handler as GET, handler as POST };

/**
 * 获取可用的登录方式
 * GET /api/auth/providers
 */
export async function GETProviders() {
  const providers = getAvailableOAuthProviders();
  
  return Response.json({
    success: true,
    data: {
      providers,
      total: providers.length,
    },
  });
}
