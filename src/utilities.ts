import fsPromises from "fs/promises";

export async function getBibleData<T>(path: string): Promise<T> {
  return JSON.parse(String(await fsPromises.readFile(path)));
}
