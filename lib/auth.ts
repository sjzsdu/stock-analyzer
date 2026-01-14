/**
 * NextAuth.js 认证配置
 * 
 * 支持 Google OAuth、邮箱密码登录
 * 
 * @module lib/auth
 */

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';

// 类型扩展
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      tier: string;
    }
  }
  
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    tier: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    tier: string;
  }
}

/**
 * NextAuth认证选项配置
 */
export const authOptions: NextAuthOptions = {
  // MongoDB Adapter - 使用类型断言避免不兼容
  adapter: MongoDBAdapter(clientPromise) as any,
  
  // Session配置
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  
  // JWT配置
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  
  // Providers配置
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    
    // 邮箱密码登录
    CredentialsProvider({
      name: '邮箱登录',
      id: 'email',
      credentials: {
        email: { 
          label: '邮箱', 
          type: 'email',
          placeholder: 'your@email.com',
        },
        password: { 
          label: '密码', 
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码');
        }
        
        // 查找用户
        const user = await User.findOne({ 
          email: credentials.email.toLowerCase() 
        }) as IUser | null;
        
        if (!user) {
          throw new Error('用户不存在');
        }
        
        // 检查是否有密码（OAuth用户可能没有密码）
        const hasPassword = (user as any).password !== undefined;
        
        if (!hasPassword) {
          // OAuth用户，引导使用OAuth登录
          throw new Error('请使用绑定的第三方账号登录');
        }
        
        // 验证密码
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          (user as any).password || ''
        );
        
        if (!isPasswordValid) {
          throw new Error('密码错误');
        }
        
        // 检查账户状态
        if (!user.isActive) {
          throw new Error('账户已被禁用');
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          tier: user.subscription.tier,
        };
      },
    }),
  ],
  
  // 回调函数
  callbacks: {
    // JWT回调
    async jwt({ token, user, account, trigger }) {
      // 首次登录
      if (user) {
        token.id = user.id;
        
        // 获取用户最新订阅信息
        try {
          const userDoc = await User.findById(user.id);
          if (userDoc) {
            token.tier = (userDoc as IUser).subscription.tier;
          } else {
            token.tier = 'free';
          }
        } catch (error) {
          token.tier = 'free';
        }
      }
      
      // 用户更新资料后刷新
      if (trigger === 'update') {
        try {
          const userDoc = await User.findById(token.id);
          if (userDoc) {
            const userData = userDoc as IUser;
            token.tier = userData.subscription.tier;
            token.name = userData.name;
            token.email = userData.email;
          }
        } catch (error) {
          // 忽略错误
        }
      }
      
      return token;
    },
    
    // Session回调
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.tier = token.tier;
      }
      return session;
    },
    
    // 登录回调 - 创建新用户
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Google OAuth登录，检查是否为新用户
        const existingUser = await User.findOne({ 
          email: user.email?.toLowerCase() 
        });
        
        if (!existingUser) {
          // 创建新用户
          await User.create({
            email: user.email?.toLowerCase(),
            name: user.name,
            image: user.image,
            accounts: [{
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            }],
            subscription: {
              tier: 'free',
              status: 'active',
            },
            usage: {
              analysesThisMonth: 0,
              totalAnalyses: 0,
            },
            isActive: true,
            isBlocked: false,
          });
        } else {
          // 更新现有用户的OAuth账户信息
          await User.findByIdAndUpdate(existingUser._id, {
            $push: {
              accounts: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
              },
            },
            $set: {
              image: user.image,
              updatedAt: new Date(),
            },
          });
        }
      }
      
      return true;
    },
    
    // 重定向回调
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).hostname === new URL(baseUrl).hostname) return url;
      return baseUrl;
    },
  },
  
  // 页面配置
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/auth/welcome',
  },
  
  // 事件处理
  events: {
    async signOut({ token }) {
      console.log('User signed out:', token?.id);
    },
    async createUser({ user }) {
      console.log('New user created:', user.email);
    },
  },
  
  // 调试模式
  debug: process.env.NODE_ENV === 'development',
};

// 导出认证配置
export default authOptions;
