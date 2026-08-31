function readEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Required environment variable is missing: ${name}`);
  }

  return value;
}

export function hasLoginEnvironment() {
  return Boolean(
    process.env.PLAYWRIGHT_LOGIN_URL?.trim()
      && process.env.PLAYWRIGHT_USERNAME?.trim()
      && process.env.PLAYWRIGHT_PASSWORD
  );
}

export function getLoginEnvironment() {
  return {
    loginUrl: readEnvironment('PLAYWRIGHT_LOGIN_URL'),
    username: readEnvironment('PLAYWRIGHT_USERNAME'),
    password: readEnvironment('PLAYWRIGHT_PASSWORD')
  };
}
