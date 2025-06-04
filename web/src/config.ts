type EnvKey = 'development' | 'production' | 'test';
const ENV = (process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development') as EnvKey;

const config: Record<EnvKey, { API_BASE_URL: string }> = {
  development: {
    API_BASE_URL: 'http://192.168.3.34:3000',
  },
  production: {
    API_BASE_URL: 'https://api.example.com',
  },
  test: {
    API_BASE_URL: 'http://150.158.176.172:20002',
  },
};

export default config[ENV] || config.development; 