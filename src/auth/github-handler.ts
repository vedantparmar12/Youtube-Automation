import { OAuthProviderHandler } from '@cloudflare/workers-oauth-provider';
import { logger } from '../utils/logger.js';
import { formatSecureError } from '../utils/security.js';

export class GitHubHandler extends OAuthProviderHandler {
  constructor() {
    super({
      clientId: '',
      clientSecret: '',
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      scopes: ['read:user', 'user:email'],
    });
  }

  async init(env: Env): Promise<void> {
    try {
      // Initialize with environment variables
      this.clientId = env.GITHUB_CLIENT_ID || '';
      this.clientSecret = env.GITHUB_CLIENT_SECRET || '';
      
      if (!this.clientId || !this.clientSecret) {
        throw new Error('GitHub OAuth credentials are required');
      }
      
      logger.info('GitHub OAuth handler initialized');
    } catch (error) {
      logger.error('Failed to initialize GitHub OAuth handler:', error);
      throw error;
    }
  }

  async handleAuthorizeRequest(request: Request, env: Env): Promise<Response> {
    try {
      await this.init(env);
      
      const url = new URL(request.url);
      const clientId = url.searchParams.get('client_id');
      const redirectUri = url.searchParams.get('redirect_uri');
      const state = url.searchParams.get('state');
      const scopes = url.searchParams.get('scope') || 'read:user user:email';

      if (!clientId || !redirectUri) {
        return new Response('Missing required parameters', { status: 400 });
      }

      // Validate redirect URI (basic validation)
      if (!this.isValidRedirectUri(redirectUri)) {
        return new Response('Invalid redirect URI', { status: 400 });
      }

      const authUrl = new URL(this.authorizationEndpoint);
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', scopes);
      authUrl.searchParams.set('state', state || '');

      return Response.redirect(authUrl.toString(), 302);
    } catch (error) {
      logger.error('Authorization request error:', error);
      return new Response(formatSecureError(error), { status: 500 });
    }
  }

  async handleTokenRequest(request: Request, env: Env): Promise<Response> {
    try {
      await this.init(env);
      
      const formData = await request.formData();
      const code = formData.get('code');
      const clientId = formData.get('client_id');
      const clientSecret = formData.get('client_secret');
      const redirectUri = formData.get('redirect_uri');

      if (!code || !clientId || !clientSecret || !redirectUri) {
        return new Response('Missing required parameters', { status: 400 });
      }

      // Validate client credentials
      if (clientId !== this.clientId || clientSecret !== this.clientSecret) {
        return new Response('Invalid client credentials', { status: 401 });
      }

      // Exchange code for access token
      const tokenResponse = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code as string,
          redirect_uri: redirectUri as string,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        logger.error('Token exchange failed:', errorText);
        return new Response('Token exchange failed', { status: 400 });
      }

      const tokenData = await tokenResponse.json();
      
      // Return token response
      return new Response(JSON.stringify(tokenData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
        },
      });
    } catch (error) {
      logger.error('Token request error:', error);
      return new Response(formatSecureError(error), { status: 500 });
    }
  }

  private isValidRedirectUri(redirectUri: string): boolean {
    try {
      const url = new URL(redirectUri);
      
      // Allow localhost for development
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return true;
      }
      
      // Only allow HTTPS in production
      if (url.protocol !== 'https:') {
        return false;
      }
      
      // Add additional validation as needed
      return true;
    } catch {
      return false;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'YouTube-Notion-MCP-Server',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await userResponse.json();
      
      // Return sanitized user data
      return {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
      };
    } catch (error) {
      logger.error('Failed to get user info:', error);
      throw error;
    }
  }
}
