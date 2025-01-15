import type { DeliveryHookRequest } from '@connectifi/sdk';
import { polygonHook } from './polygon';
import { RequestError, ServerError } from '../types';
import {
  POLYGON_EXCHANGE_INFO_URL,
  POLYGON_TICKER_INFO_URL,
} from '../constants';

const mockAPIKey = 'thisisthatapikeyverysecureindeed';

const mockMIC = 'emeyesee';
const mockInstrument = {
  type: 'fdc3.instrument',
  id: {
    ticker: 'MSFT',
  },
};

const mockReqCustom: DeliveryHookRequest = {
  source: { appId: 'thesource' },
  destinations: [{ appId: 'thedest' }],
  context: {
    type: 'test.context',
    id: {
      field: 'test.context.field',
    },
  },
};

const mockReqInstrument: DeliveryHookRequest = {
  source: { appId: 'thesource' },
  destinations: [{ appId: 'thedest' }],
  context: mockInstrument,
};

const mockText = jest.fn();
const mockJson = jest.fn();
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('polygon hook misconfiguration', () => {
  it('throws api key missing error', async () => {
    expect(async () => {
      await polygonHook(mockReqCustom);
    }).rejects.toThrow(ServerError);
  });
});

describe('polygon hook normal', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      POLYGON_API_KEY: mockAPIKey,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('handles invalid context type', async () => {
    const mockResp = {};
    mockJson.mockReturnValue(mockResp);
    mockText.mockReturnValue(JSON.stringify(mockResp));
    mockFetch.mockReturnValue({ ok: true, json: mockJson, text: mockText });

    expect(async () => {
      await polygonHook(mockReqCustom);
    }).rejects.toThrow(RequestError);
  });

  it('returns correct context', async () => {
    const mockTickerInfoResp = {
      results: {
        name: 'silly name',
        primary_exchange: mockMIC,
        composite_figi: 'figi',
        currency_name: 'USD',
        locale: 'US',
      },
    };
    mockJson.mockReturnValueOnce(mockTickerInfoResp);
    mockText.mockReturnValueOnce(JSON.stringify(mockTickerInfoResp));
    mockFetch.mockReturnValueOnce({ ok: true, json: mockJson, text: mockText });
    const mockExchangeInfoResp = {
      results: [
        {
          type: 'exchange',
          name: 'theexchange',
          mic: mockMIC,
          operating_mic: mockMIC,
        },
      ],
    };
    mockJson.mockReturnValueOnce(mockExchangeInfoResp);
    mockText.mockReturnValueOnce(JSON.stringify(mockExchangeInfoResp));
    mockFetch.mockReturnValueOnce({ ok: true, json: mockJson, text: mockText });

    const { context } = await polygonHook(mockReqInstrument);

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      `${POLYGON_TICKER_INFO_URL}/${mockReqInstrument.context.id.ticker}?apiKey=${mockAPIKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
          outputFormat: 'application/json',
        },
      },
    );

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      `${POLYGON_EXCHANGE_INFO_URL}&apiKey=${mockAPIKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
          outputFormat: 'application/json',
        },
      },
    );

    expect(context).toEqual({
      type: mockInstrument.type,
      id: {
        ticker: mockInstrument.id.ticker,
        FIGI: 'figi',
      },
      currency: 'USD',
      name: 'silly name',
      market: {
        MIC: mockMIC,
        COUNTRY_ISOALPHA2: 'US',
        name: 'theexchange',
      },
    });
  });
});
