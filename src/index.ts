import { config as dotenvConfig, DotenvConfigOutput, DotenvConfigOptions } from 'dotenv';
import { compact, isString } from 'lodash';
const ENV_ARRAY_SEPARATOR = '|';
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
