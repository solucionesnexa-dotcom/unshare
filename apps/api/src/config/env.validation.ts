export function validateEnv(config: Record<string, unknown>) {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
  return config;
}
