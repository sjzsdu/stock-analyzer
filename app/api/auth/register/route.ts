/**
 * 注册API
 *
 * 处理用户邮箱注册
 *
 * @module app/api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  initEmailService,
} from '@/lib/email';

// 生成邮箱验证 token
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// POST 注册新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 验证必填字段
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: '密码至少需要8个字符' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { success: false, error: '密码需包含大小写字母和数字' },
        { status: 400 }
      );
    }

    await connectDB();

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册，请直接登录或使用其他邮箱' },
        { status: 409 }
      );
    }

    // 加密密码
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 生成邮箱验证 token
    const verificationToken = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时过期

    // 创建用户
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      subscription: {
        tier: 'free',
        status: 'active',
      },
      usage: {
        analysesThisMonth: 0,
        totalAnalyses: 0,
      },
      emailVerification: {
        token: verificationToken,
        expiresAt: verificationExpiresAt,
      },
      isActive: true,
      isBlocked: false,
    });

    // 创建免费订阅
    await Subscription.create({
      userId: user._id,
      tier: 'free',
      status: 'active',
      period: {
        interval: 'month',
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        currentCycleStart: new Date(),
        currentCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usedAnalyses: 0,
        usedApiCalls: 0,
      },
      limits: {
        analysesPerPeriod: 10,
        apiCallsPerDay: 50,
        dataRetentionDays: 30,
        modelAccess: ['deepseek-v3'],
        features: ['基础股票分析', '标准分析速度'],
      },
    });

    // 发送验证邮件（异步，不阻塞注册流程）
    try {
      await initEmailService();
      await sendVerificationEmail(email, verificationToken);
      console.log(`[Register] 验证邮件已发送至: ${email}`);
    } catch (emailError) {
      console.error('[Register] 邮件发送失败:', emailError);
      // 邮件发送失败不影响注册流程
    }

    // 返回成功
    return NextResponse.json({
      success: true,
      message: '注册成功！请查收邮件验证您的邮箱',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        needsVerification: true,
        tier: user.subscription.tier,
      },
    });

  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
