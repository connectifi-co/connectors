import { POLYGON_TICKER_INFO_URL, POLYGON_EXCHANGE_INFO_URL } from './constants';

const exchangeAcronyms = [
    {
      mic: 'XNYS',
      acronym: 'NYSE',
    },
    {
      mic: 'XNAS',
      acronym: 'NASDAQ',
    },
  ];
  export const getExchangeAcronym = (mic: string): string | undefined => {
    const ex = exchangeAcronyms.find((ex:any) => ex.mic === mic);
    return ex && ex.acronym;
  }
  
  let exchangeData: [] | undefined = undefined;
  const loadExchangeData = async (apiKey: string) => {
    const apiURL = `${POLYGON_EXCHANGE_INFO_URL}&apiKey=${apiKey}`;
  
    console.log(`calling polygon exchange info api: ${apiURL}`);
  
    const rHeaders = {
      "Content-Type": "text/plain",
      outputFormat: "application/json",
    };
    const resp = await fetch(apiURL, {
      headers: rHeaders,
      method: "GET",
    });
    const json: any = await resp.json();
    if (json.results) {
      exchangeData = json.results;
    }
  }
  
  export const getExchangeName = async (apiKey: string, mic: string): Promise<any> => {
    if (!exchangeData) {
      await loadExchangeData(apiKey);
    }
    if (exchangeData) {
      return exchangeData.find((ex:any) => {
        return (
          ex.type === 'exchange' &&
          ex.mic === ex.operating_mic &&
          ex.mic === mic
        );
      });
    }
    return undefined;
  }
  
  const tickerCache: Map<string, any> = new Map<string, any>();
  export const getTickerInfo = async (apiKey: string, ticker:string): Promise<any> => {
    const tickerKey = ticker.toUpperCase();
    if (tickerCache.has(tickerKey)) {
      console.log(`ticker: ${ticker} is in cache`);
      return tickerCache.get(tickerKey);
    }
  
    const apiURL = `${POLYGON_TICKER_INFO_URL}/${ticker}?apiKey=${apiKey}`;
    console.log(`ticker not cached, calling polygon api: ${apiURL}`);
  
    const rHeaders = {
      "Content-Type": "text/plain",
      outputFormat: "application/json",
    };
    const resp = await fetch(apiURL, {
      headers: rHeaders,
      method: "GET",
    });
    const json: any = await resp.json();
    const data = json.results;
    // console.log(`ticker response: ${JSON.stringify(data, null, 2)}`);
    if (data) {
      tickerCache.set(tickerKey, data);
      return data;
    }
    return undefined;
  }
  
 