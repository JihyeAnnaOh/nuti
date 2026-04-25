/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Prefer remotePatterns (domains is deprecated in Next 15+)
    remotePatterns: [
      { protocol: 'https', hostname: 'www.themealdb.com', pathname: '/**' },
      { protocol: 'https', hostname: 'spoonacular.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.spoonacular.com', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
    ],
  },
  /**
   * Content-Security-Policy: some browsers / strict defaults block `eval`, which
   * Next.js or bundled deps may rely on. Without this, DevTools "Issues" can
   * report eval blocked; combined with a strict host policy it can also break
   * hydration. If you set a second CSP in Vercel (Security Headers), either
   * add `script-src` with 'unsafe-inline' and 'unsafe-eval' there, or keep
   * only this policy to avoid *two* CSPs (all must be satisfied = stricter).
   */
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss: ws:",
      "frame-src 'self' https://www.google.com https://accounts.google.com https://www.gstatic.com",
      "media-src 'self' blob: data: https:",
      "worker-src 'self' blob:",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [{ key: 'Content-Security-Policy', value: csp }],
      },
    ];
  },
};

export default nextConfig;
