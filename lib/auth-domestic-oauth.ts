/**
 * 国内OAuth提供商配置（简化版）
 * 
 * 微信、支付宝等国内平台的OAuth认证
 * 注意：生产环境需要使用官方SDK进行签名验证
 * 
 * @module lib/auth-domestic-oauth
 */

/**
 * 微信OAuth配置
 */
export const WeChatConfig = {
  id: 'wechat',
  name: '微信',
  type: 'oauth' as const,
  clientId: process.env.WECHAT_CLIENT_ID,
  clientSecret: process.env.WECHAT_CLIENT_SECRET,
  authorization: `https://open.weixin.qq.com/connect/qrconnect?appid=${process.env.WECHAT_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/auth/callback/wechat`)}&response_type=code&scope=snsapi_login#wechat_redirect`,
  token: 'https://api.weixin.qq.com/oauth2/access_token',
  userinfo: 'https://api.weixin.qq.com/sns/userinfo',
  profile(profile: any) {
    return {
      id: profile.openid,
      name: profile.nickname,
      email: profile.unionid ? `${profile.unionid}@wechat` : undefined,
      image: profile.headimgurl,
    };
  },
  style: {
    logo: '/icons/wechat.svg',
    bg: '#07C160',
    text: '#FFFFFF',
  },
};

/**
 * 支付宝OAuth配置
 */
export const AlipayConfig = {
  id: 'alipay',
  name: '支付宝',
  type: 'oauth' as const,
  clientId: process.env.ALIPAY_CLIENT_ID,
  clientSecret: process.env.ALIPAY_CLIENT_SECRET,
  authorization: `https://auth.alipay.com/login/appAuth.htm?app_id=${process.env.ALIPAY_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/auth/callback/alipay`)}`,
  profile(profile: any) {
    return {
      id: profile.user_id,
      name: profile.nick_name,
      email: profile.email || undefined,
      image: profile.avatar,
    };
  },
  style: {
    logo: '/icons/alipay.svg',
    bg: '#1677FF',
    text: '#FFFFFF',
  },
};

/**
 * QQ OAuth配置
 */
export const QQConfig = {
  id: 'qq',
  name: 'QQ',
  type: 'oauth' as const,
  clientId: process.env.QQ_CLIENT_ID,
  clientSecret: process.env.QQ_CLIENT_SECRET,
  authorization: `https://graph.qq.com/oauth2.0/authorize?client_id=${process.env.QQ_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/auth/callback/qq`)}&response_type=code&scope=get_user_info`,
  profile(profile: any) {
    return {
      id: profile.openid,
      name: profile.nickname,
      email: undefined,
      image: profile.figureurl_qq_2 || profile.figureurl_2,
    };
  },
  style: {
    logo: '/icons/qq.svg',
    bg: '#12B7F5',
    text: '#FFFFFF',
  },
};

/**
 * 获取所有已配置的国内OAuth提供商
 */
export function getDomesticOAuthProviders() {
  const providers = [];
  
  if (process.env.WECHAT_CLIENT_ID && process.env.WECHAT_CLIENT_SECRET) {
    providers.push({
      provider: WeChatConfig,
      configured: true,
    });
  }
  
  if (process.env.ALIPAY_CLIENT_ID && process.env.ALIPAY_CLIENT_SECRET) {
    providers.push({
      provider: AlipayConfig,
      configured: true,
    });
  }
  
  if (process.env.QQ_CLIENT_ID && process.env.QQ_CLIENT_SECRET) {
    providers.push({
      provider: QQConfig,
      configured: true,
    });
  }
  
  return providers;
}

/**
 * 检查是否配置了任何国内OAuth
 */
export function hasDomesticOAuthConfigured() {
  return getDomesticOAuthProviders().length > 0;
}

/**
 * 获取可用的OAuth提供商列表（用于前端显示）
 */
export function getAvailableOAuthProviders() {
  const providers = [];
  
  // Google
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push({
      id: 'google',
      name: 'Google',
      icon: '/icons/google.svg',
      bg: '#4285F4',
      text: '#FFFFFF',
    });
  }
  
  // 微信
  if (process.env.WECHAT_CLIENT_ID && process.env.WECHAT_CLIENT_SECRET) {
    providers.push({
      id: 'wechat',
      name: '微信',
      icon: '/icons/wechat.svg',
      bg: '#07C160',
      text: '#FFFFFF',
    });
  }
  
  // 支付宝
  if (process.env.ALIPAY_CLIENT_ID && process.env.ALIPAY_CLIENT_SECRET) {
    providers.push({
      id: 'alipay',
      name: '支付宝',
      icon: '/icons/alipay.svg',
      bg: '#1677FF',
      text: '#FFFFFF',
    });
  }
  
  // QQ
  if (process.env.QQ_CLIENT_ID && process.env.QQ_CLIENT_SECRET) {
    providers.push({
      id: 'qq',
      name: 'QQ',
      icon: '/icons/qq.svg',
      bg: '#12B7F5',
      text: '#FFFFFF',
    });
  }
  
  return providers;
}
