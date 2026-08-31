import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const testcaseRoot = path.resolve(process.cwd(), 'tests', 'testcases');

export async function loadTestCase<T>(filename: string): Promise<T> {
  const filePath = path.resolve(testcaseRoot, filename);
  const relativePath = path.relative(testcaseRoot, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Invalid testcase path: ${filename}`);
  }

  const extension = path.extname(filePath).toLowerCase();
  if (extension !== '.yml' && extension !== '.yaml') {
    throw new Error(`Unsupported testcase format: ${extension}`);
  }

  return parseYaml(await readFile(filePath, 'utf8')) as T;
}
