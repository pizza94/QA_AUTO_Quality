import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const testDataRoot = path.resolve(process.cwd(), 'tests', 'test-data');

export async function loadTestData<T>(filename: string): Promise<T> {
  const filePath = path.resolve(testDataRoot, filename);
  const relativePath = path.relative(testDataRoot, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Invalid test data path: ${filename}`);
  }

  const extension = path.extname(filePath).toLowerCase();
  if (extension !== '.yml' && extension !== '.yaml') {
    throw new Error(`Unsupported test data format: ${extension}`);
  }

  return parseYaml(await readFile(filePath, 'utf8')) as T;
}
