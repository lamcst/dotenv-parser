import dotenv = require('../src/index');
import sinon = require('sinon');
import fs = require('fs');

let readFileSyncStub: sinon.SinonStub<
  [string | number | Buffer | import('url').URL, (string | { encoding?: string; flag?: string })?],
  string | Buffer
>;
let parseStub: sinon.SinonStub<[string | Buffer, dotenv.DotenvParseOptions?], dotenv.DotenvParseOutput>;
const mockParseResponse = { test: 'foo' };

const MOCK_ENV_FILE = `test=foo\ntestObject='{"foo":"bar"}'\nport=1234\nisAdded=false\narray=1|2|qwe|`;

describe('dotenv', () => {
  beforeAll(() => {
    readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(MOCK_ENV_FILE);
    parseStub = sinon.stub(dotenv, 'parse').returns(mockParseResponse);
  });
  afterAll(() => {
    readFileSyncStub.restore();
    parseStub.restore();
  });
  it('takes option for path', () => {
    const testPath = 'tests/.env';
    dotenv.config({ path: testPath });
    expect(readFileSyncStub.args[0][0]).toBe(testPath);
  });
  it('returns any errors thrown from reading file or parsing', () => {
    readFileSyncStub.throws();
    const env = dotenv.config();
    expect(env.error).toBeInstanceOf(Error);
  });
  it('match object after parsing', () => {
    dotenv.config();
    expect(process.env.testObject).toStrictEqual({ foo: 'bar' });
  });
  it('match number after parsing', () => {
    dotenv.config();
    expect(process.env.port).toEqual(1234);
  });
  it('match boolean after parsing', () => {
    dotenv.config();
    expect(process.env.isAdded).toEqual(false);
  });
  it('match array after parsing', () => {
    dotenv.config();
    expect(process.env.array).toStrictEqual(['1', '2', 'qwe']);
  });
});
