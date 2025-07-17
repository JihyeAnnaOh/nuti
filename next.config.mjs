/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'ko', 'zh', 'ja', 'vi', 'ar', 'hi', 'ms', 'it'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  images: {
    domains: ['www.themealdb.com', 'spoonacular.com', 'upload.wikimedia.org'],
  },
};

export default nextConfig; 