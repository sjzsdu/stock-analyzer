/**
 * 重置密码 API
 *
 * 使用重置令牌设置新密码
 *
 * @module app/api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

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

    const user = await User.findOne({
      'passwordReset.token': token,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '重置链接无效或已过期' },
        { status: 400 }
      );
    }

    if (user.passwordReset?.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(user.passwordReset.expiresAt);

      if (now > expiresAt) {
        return NextResponse.json(
          { success: false, error: '重置链接已过期，请重新申请' },
          { status: 400 }
        );
      }
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        'passwordReset.token': null,
        'passwordReset.expiresAt': null,
      },
    });

    console.log(`[ResetPassword] 用户 ${user.email} 密码已重置`);

    return NextResponse.json({
      success: true,
      message: '密码重置成功，请使用新密码登录',
    });

  } catch (error) {
    console.error('重置密码失败:', error);
    return NextResponse.json(
      { success: false, error: '重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}
