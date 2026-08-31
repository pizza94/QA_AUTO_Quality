import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

export type LoginEnvironmentReferences = { localFile: string };

type LocalLoginData = {
  loginUrl: string;
  username: string;
  password: string;
};

function readLocalLogin(references: LoginEnvironmentReferences) {
  const testDataRoot = path.resolve(process.cwd(), 'tests', 'test-data');
  const filePath = path.resolve(testDataRoot, references.localFile);
  const relativePath = path.relative(testDataRoot, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Invalid local login data path: ${references.localFile}`);
  }

  return parseYaml(readFileSync(filePath, 'utf8')) as LocalLoginData;
}

export function hasLoginEnvironment(references: LoginEnvironmentReferences) {
  try {
    const values = readLocalLogin(references);
    return Boolean(values.loginUrl?.trim() && values.username?.trim() && values.password);
  } catch {
    return false;
  }
}

export function getLoginEnvironment(references: LoginEnvironmentReferences) {
  const values = readLocalLogin(references);
  if (!values.loginUrl?.trim() || !values.username?.trim() || !values.password) {
    throw new Error(`Local login data is incomplete: ${references.localFile}`);
  }
  return values;
}
