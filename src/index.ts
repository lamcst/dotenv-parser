/* eslint-disable @typescript-eslint/no-explicit-any */
import { config as dotenvConfig, DotenvConfigOutput, DotenvConfigOptions } from 'dotenv';
const ENV_ARRAY_SEPARATOR = '|';
function compact(array: string[]): Array<string> {
  let resIndex = 0;
  const result = [];

  if (array == null) {
    return result;
  }

  for (const value of array) {
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}
const toString = Object.prototype.toString;

function getTag(value: any): string {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
}
function isString(value: any): boolean {
  const type = typeof value;
  return (
    type == 'string' ||
    (type == 'object' && value != null && !Array.isArray(value) && getTag(value) == '[object String]')
  );
}

export interface DotenvParserConfigOptions extends DotenvConfigOptions {
  separator?: string;
}
export * from 'dotenv';
export const config = (options: DotenvParserConfigOptions = { separator: ENV_ARRAY_SEPARATOR }): DotenvConfigOutput => {
  const { separator, ...params } = options;
  const result = dotenvConfig({ ...params });
  process.env = Object.keys(process.env).reduce((result, key) => {
    const data = process.env[key];
    const safeJsonParse = (data: string): string | object => {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    };

    const dataParseIfObject = safeJsonParse(data);
    const dataParseIfInteger = isString(data) && data.match(/^-{0,1}\d+$/) ? Number(data) : dataParseIfObject;
    const dataParseIfBoolean = data === 'true' || data === 'false' ? data === 'true' : dataParseIfInteger;
    const dataJson =
      isString(data) && data.indexOf(separator) >= 0 ? compact(data.split(separator)) : dataParseIfBoolean;
    return {
      ...result,
      [key]: dataJson,
    };
  }, {});
  return result;
};
