/**
 * 邮箱验证 API
 *
 * 验证用户邮箱地址
 *
 * @module app/api/auth/verify-email
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: '验证链接无效，请检查邮件中的链接是否完整' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      'emailVerification.token': token,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '验证链接无效或已过期，请重新注册' },
        { status: 400 }
      );
    }

    if (user.emailVerification?.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(user.emailVerification.expiresAt);

      if (now > expiresAt) {
        return NextResponse.json(
          { success: false, error: '验证链接已过期，请重新发送验证邮件' },
          { status: 400 }
        );
      }
    }

    if (user.emailVerification?.verifiedAt) {
      return NextResponse.json({
        success: true,
        message: '邮箱已验证成功，请登录',
        alreadyVerified: true,
      });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: {
        'emailVerification.verifiedAt': new Date(),
        'emailVerification.token': null,
        'emailVerification.expiresAt': null,
        emailVerified: new Date(),
      },
    });

    console.log(`[VerifyEmail] 用户 ${user.email} 邮箱验证成功`);

    return NextResponse.json({
      success: true,
      message: '邮箱验证成功！',
      data: {
        email: user.email,
      },
    });

  } catch (error) {
    console.error('邮箱验证失败:', error);
    return NextResponse.json(
      { success: false, error: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: '请提供邮箱地址' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    if (user.emailVerification?.verifiedAt) {
      return NextResponse.json({
        success: true,
        message: '邮箱已验证，无需重复验证',
        alreadyVerified: true,
      });
    }

    const { randomBytes } = await import('crypto');
    const newToken = randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        'emailVerification.token': newToken,
        'emailVerification.expiresAt': newExpiresAt,
      },
    });

    const { initEmailService, sendVerificationEmail } = await import('@/lib/email');

    try {
      await initEmailService();
      await sendVerificationEmail(email, newToken);
      console.log(`[ResendVerifyEmail] 验证邮件已重新发送至: ${email}`);
    } catch (emailError) {
      console.error('[ResendVerifyEmail] 邮件发送失败:', emailError);
      return NextResponse.json(
        { success: false, error: '邮件发送失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '验证邮件已重新发送，请查收您的邮箱',
    });

  } catch (error) {
    console.error('重新发送验证邮件失败:', error);
    return NextResponse.json(
      { success: false, error: '操作失败，请稍后重试' },
      { status: 500 }
    );
  }
}
