import { readFile } from 'node:fs/promises';
import path from 'node:path';

const dataRoot = path.resolve(process.cwd(), 'test-data');

export async function loadTestData<T>(menu: string, filename: string): Promise<T> {
  const filePath = path.resolve(dataRoot, menu, filename);
  const relativePath = path.relative(dataRoot, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Invalid test data path: ${menu}/${filename}`);
  }

  return JSON.parse(await readFile(filePath, 'utf8')) as T;
}
