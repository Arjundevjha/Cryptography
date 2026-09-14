// @ts-ignore - JavaScript CommonJS module import
import nextConfig from '../../next.config';

describe('Next.js Security Headers Configuration', () => {
  it('should export headers configuration function', () => {
    expect(typeof nextConfig.headers).toBe('function');
  });

  it('should include strict Content-Security-Policy without unsafe-eval', async () => {
    const headerConfigs = await nextConfig.headers();
    expect(Array.isArray(headerConfigs)).toBe(true);

    const globalHeaders = headerConfigs.find((item: { source: string }) => item.source === '/:path*');
    expect(globalHeaders).toBeDefined();

    const cspHeader = globalHeaders?.headers.find(
      (h: { key: string; value: string }) => h.key === 'Content-Security-Policy'
    );
    expect(cspHeader).toBeDefined();
    expect(cspHeader?.value).not.toContain("'unsafe-eval'");
    expect(cspHeader?.value).toContain("script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com");
  });

  it('should include standard security headers', async () => {
    const headerConfigs = await nextConfig.headers();
    const globalHeaders = headerConfigs.find((item: { source: string }) => item.source === '/:path*');
    const headerKeys = globalHeaders?.headers.map((h: { key: string }) => h.key);

    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('Referrer-Policy');
    expect(headerKeys).toContain('Permissions-Policy');
    expect(headerKeys).toContain('Strict-Transport-Security');
    expect(headerKeys).toContain('Content-Security-Policy');
  });
});
