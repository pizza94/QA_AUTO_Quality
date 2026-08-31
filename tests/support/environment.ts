export type LoginEnvironmentReferences = {
  loginUrlEnv: string;
  usernameEnv: string;
  passwordEnv: string;
};

function readEnvironment(name: string) {
  const value = process.env[name];

  if (!value?.trim()) {
    throw new Error(`Required environment variable is missing: ${name}`);
  }

  return value;
}

export function hasLoginEnvironment(references: LoginEnvironmentReferences) {
  return Boolean(
    process.env[references.loginUrlEnv]?.trim()
      && process.env[references.usernameEnv]?.trim()
      && process.env[references.passwordEnv]
  );
}

export function getLoginEnvironment(references: LoginEnvironmentReferences) {
  return {
    loginUrl: readEnvironment(references.loginUrlEnv),
    username: readEnvironment(references.usernameEnv),
    password: readEnvironment(references.passwordEnv)
  };
}
