import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const dataRoot = path.resolve(process.cwd(), 'test-data');

export async function loadTestData<T>(menu: string, filename: string): Promise<T> {
  const filePath = path.resolve(dataRoot, menu, filename);
  const relativePath = path.relative(dataRoot, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Invalid test data path: ${menu}/${filename}`);
  }

  const content = await readFile(filePath, 'utf8');
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.yml' || extension === '.yaml') {
    return parseYaml(content) as T;
  }

  if (extension === '.json') {
    return JSON.parse(content) as T;
  }

  throw new Error(`Unsupported test data format: ${extension}`);
}
