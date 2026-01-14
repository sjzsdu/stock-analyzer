/**
 * 邮件发送服务
 *
 * 支持多种邮件服务商（SendGrid, Mailgun, Gmail, SMTP等）
 *
 * @module lib/email
 */

import nodemailer, { Transporter } from 'nodemailer';

// 邮件配置
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// 邮件选项
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// 全局邮件 transporter
let transporter: Transporter | null = null;

/**
 * 初始化邮件服务
 */
export async function initEmailService(): Promise<Transporter | null> {
  const emailHost = process.env.SMTP_HOST;
  const emailPort = parseInt(process.env.SMTP_PORT || '587');
  const emailUser = process.env.SMTP_USER;
  const emailPass = process.env.SMTP_PASSWORD;

  // 如果没有配置邮件服务，返回 null（不会发送邮件但不会报错）
  if (!emailHost || !emailUser || !emailPass) {
    console.log('[Email] 邮件服务未配置，跳过初始化');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // 465端口使用SSL
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    } as EmailConfig);

    // 验证连接
    await transporter.verify();
    console.log('[Email] 邮件服务已就绪');
    return transporter;
  } catch (error) {
    console.error('[Email] 邮件服务初始化失败:', error);
    return null;
  }
}

/**
 * 获取邮件 transporter
 */
function getTransporter(): Transporter | null {
  return transporter;
}

/**
 * 发送邮件
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('[Email] 邮件服务未配置，无法发送邮件');
    return false;
  }

  try {
    const fromName = process.env.EMAIL_FROM_NAME || '智能股票分析';
    const fromEmail = process.env.EMAIL_FROM || 'noreply@stock-analyzer.com';

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // 纯文本版本
    });

    console.log(`[Email] 邮件已发送至: ${options.to}`);
    return true;
  } catch (error) {
    console.error('[Email] 邮件发送失败:', error);
    return false;
  }
}

/**
 * 生成邮件 HTML 模板
 */
export function generateEmailTemplate(options: {
  title: string;
  content: string;
  actionText?: string;
  actionUrl?: string;
  footerText?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
          智能股票分析平台
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: 600;">
          ${options.title}
        </h2>
        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
          ${options.content}
        </p>
        ${options.actionText && options.actionUrl ? `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <a href="${options.actionUrl}" style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ${options.actionText}
              </a>
            </td>
          </tr>
        </table>
        ` : ''}
        <p style="margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eeeeee; color: #999999; font-size: 14px;">
          ${options.footerText || '如果按钮无法点击，请复制以下链接到浏览器打开：'}
        </p>
        ${options.actionUrl && !options.actionText ? `
        <p style="margin: 10px 0; word-break: break-all; color: #667eea; font-size: 14px;">
          <a href="${options.actionUrl}" style="color: #667eea; text-decoration: none;">${options.actionUrl}</a>
        </p>
        ` : ''}
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; background-color: #f9f9f9; text-align: center;">
        <p style="margin: 0; color: #999999; font-size: 12px;">
          © ${new Date().getFullYear()} 智能股票分析平台. 保留所有权利.
        </p>
        <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
          您收到此邮件是因为您注册了我们的服务。如果您没有注册，请<a href="#" style="color: #999999; text-decoration: underline;">忽略此邮件</a>。
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 发送注册确认邮件
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

  return sendEmail({
    to: email,
    subject: '【智能股票分析】请验证您的邮箱地址',
    html: generateEmailTemplate({
      title: '欢迎注册智能股票分析平台',
      content: '感谢您注册我们的服务！请点击下方按钮验证您的邮箱地址，验证成功后即可使用全部功能。',
      actionText: '验证邮箱',
      actionUrl: verificationUrl,
      footerText: '验证码链接有效期为24小时，请尽快完成验证。',
    }),
  });
}

/**
 * 发送注册成功通知邮件
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return sendEmail({
    to: email,
    subject: '【智能股票分析】注册成功！开始您的智能投资之旅',
    html: generateEmailTemplate({
      title: '注册成功！',
      content: `尊敬的 ${name}，您好！<br><br>您的账户已创建成功，现在可以开始使用智能股票分析功能了。`,
      actionText: '开始分析',
      actionUrl: baseUrl,
      footerText: '如有任何问题，请联系我们的客服团队。',
    }),
  });
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: '【智能股票分析】重置您的密码',
    html: generateEmailTemplate({
      title: '重置密码',
      content: '您正在请求重置密码。请点击下方按钮设置新密码，如果您没有请求重置，请忽略此邮件。',
      actionText: '重置密码',
      actionUrl: resetUrl,
      footerText: '重置链接有效期为1小时，请尽快完成操作。',
    }),
  });
}

export default {
  initEmailService,
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  generateEmailTemplate,
};
