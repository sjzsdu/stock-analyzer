/**
 * 忘记密码 API
 *
 * 发送密码重置邮件
 *
 * @module app/api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { initEmailService, sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱地址' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: '如果该邮箱已注册，我们会发送重置链接',
      });
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        'passwordReset.token': resetToken,
        'passwordReset.expiresAt': resetExpiresAt,
      },
    });

    try {
      await initEmailService();
      await sendPasswordResetEmail(email, resetToken);
      console.log(`[ForgotPassword] 重置邮件已发送至: ${email}`);
    } catch (emailError) {
      console.error('[ForgotPassword] 邮件发送失败:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: '如果该邮箱已注册，我们会发送重置链接',
    });

  } catch (error) {
    console.error('忘记密码失败:', error);
    return NextResponse.json(
      { success: false, error: '操作失败，请稍后重试' },
      { status: 500 }
    );
  }
}
