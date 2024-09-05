import type { Context } from '@finos/fdc3';
import { OPENAI_COMPLETIONS_URL } from './constants';
import { awsResponse } from './utils';
import { POLYGON_TICKER_INFO_URL, POLYGON_PRICE_HISTORY_URL } from './constants';

const tickerCache: Map<string, any> = new Map<string, any>();
const priceCache: Map<string, any> = new Map<string, any>();

const getTickerInfo = async (apiKey: string, ticker:string): Promise<any> => {
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
   console.log(`ticker response: ${JSON.stringify(data, null, 2)}`);
  if (data && data.name) {
    tickerCache.set(tickerKey, data);
    return data;
  }
  return undefined;
}

const dateFormat = (n: number) => {
    if (n < 10) {
      return `0${n}`;
    } else {
      return `${n}`;
    }
  };

const getRolling = (days: number) => {
    const d = new Date();
    const d2 = new Date();
    const d1 = new Date(d.setDate(d.getDate() - days));
    const format = (_d: Date): string => {
      return `${_d.getFullYear()}-${dateFormat(_d.getMonth() + 1)}-${dateFormat(
        _d.getDate()
      )}`;
    };
    return [format(d1), format(d2)];
  };

const getPriceHistory = async (apiKey: string, ticker:string): Promise<any> => {
    const tickerKey = ticker.toUpperCase();
    if (priceCache.has(tickerKey)) {
      console.log(`ticker pricing for: ${ticker} is in cache`);
      return priceCache.get(tickerKey);
    }
    
    const range = getRolling(365);
    const apiURL = `${POLYGON_PRICE_HISTORY_URL}/${ticker}/range/1/day/${range[0]}/${range[1]}?adjusted=true&sort=asc&apiKey=${apiKey}`;
    console.log(`ticker pricing not cached, calling polygon api: ${apiURL}`);
  
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

    console.log(`ticker response: ${JSON.stringify(data, null, 2)}`);
    if (data) {
      tickerCache.set(tickerKey, data);
      return data;
    }
    return undefined;
  }

  const instrumentListEx = {
      "type": "fdc3.instrumentList",
      "instruments": [
        {
          "type": "fdc3.instrument",
          "name": "Apple Computers",
          "id": {
            "ticker": "AAPL"
          }
        },
        {
          "type": "fdc3.instrument",
          "name": "Microsoft Inc",
          "id": {
            "ticker": "MSFT"
          }
        }
      ]
    };

const companyInfoDefinitions = `                
                - active (boolean): Whether or not the asset is actively traded. False means the asset has been delisted.
                - address (object)
                    - address1 (string): The first line of the company's headquarters address.
                    - address2 (string): The second line of the company's headquarters address, if applicable.
                    - city (string): The city of the company's headquarters address.
                    - postal_code (string): The postal code of the company's headquarters address.
                    - state (string): The state of the company's headquarters address.
                - branding (object)
                    - icon_url (string): A link to this ticker's company's icon. 
                    - logo_url (string): A link to this ticker's company's logo. 
                - cik (string): The CIK number for this ticker. 
                - composite_figi (string): The composite OpenFIGI number for this ticker. 
                - currency_name (string): The name of the currency that this asset is traded with.
                - delisted_utc (string): The last date that the asset was traded.
                - description (string): A description of the company and what they do/offer.
                - homepage_url (string): The URL of the company's website homepage.
                - list_date (string): The date that the symbol was first publicly listed in the format YYYY-MM-DD.
                - locale (enum) [us, global]:The locale of the asset.
                - market (enum) [stocks, crypto, fx, otc, indices]: The market type of the asset.
                - market_cap (number): The most recent close price of the ticker multiplied by weighted outstanding shares.
                - name (string): The name of the asset. For stocks/equities this will be the companies registered name. For crypto/fx this will be the name of the currency or coin pair.
                - phone_number: (string)The phone number for the company behind this ticker.
                - primary_exchange (string): The ISO code of the primary listing exchange for this asset.
                - round_lot (number): Round lot size of this security.
                - share_class_figi (string): The share Class OpenFIGI number for this ticker. Find more information here
                - share_class_shares_outstanding (number): The recorded number of outstanding shares for this particular share class.
                - sic_code (string): The standard industrial classification code for this ticker. For a list of SIC Codes, see the SEC's SIC Code List.
                - sic_description (string): A description of this ticker's SIC code.
                - ticker (string): The exchange symbol that this item is traded under.
                - ticker_root (string): The root of a specified ticker. For example, the root of BRK.A is BRK.
                - ticker_suffix (string): The suffix of a specified ticker. For example, the suffix of BRK.A is A.
                - total_employee (number): The approximate number of employees for the company.
                - type (string): The type of the asset. Find the types that we support via our Ticker Types API.
                - weighted_shares_outstanding (number): The shares outstanding calculated assuming all shares of other share classes are converted to this share class.
                - status (string): The status of this request's response`;

const getSimilar = async (apiKey: string, polygonKey: string, context: Context): Promise<Context> => {
    const ticker =  context.id?.ticker?.toUpperCase();
    const info = ticker? await getTickerInfo(polygonKey, ticker) : {};
    const req = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: `{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
            "role": "user",
            "content": "Create a list of companies most similar to ${info.name} or company with the ticker ${context.id?.ticker} based on similarity by industry, business model, or product focus.  The known industry of the company is ${info.sic_description}. Do not include ${info.name} in the list.  The list should be in JSON format using the schema for the FDC3 instrumentList context type. 
            The FDC3 'instrumentList' context data JSON is an object with a 'type' property of 'fdc3.instrumentList' and an 'instruments' property that contains an array of 'fdc3.instrument' type objects.
            The FDC3 'instrument' context data JSON is an object with a 'name' property, which contains the name of the company and an 'id' property which is an object that contains a 'ticker' property, which is the ticker value for the company.
            Here is an example of the expected JSON for an FDC3 'instrumentList':
                ${JSON.stringify(instrumentListEx)}
            In the list of similar companies, include both the common name of each company in the 'name' field and the ticker in the id.ticker field. 
            Only the FDC3 instrumentList context data JSON object should be returned."
        }
    ]
}
                `
            }
        ]};
        const headers = {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${apiKey}`,
            "Cache-Control": "no-cache",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive"
          };
          try {
            console.log('openai request', OPENAI_COMPLETIONS_URL, apiKey, JSON.stringify(req))
            const res = await fetch(OPENAI_COMPLETIONS_URL, { method: 'POST', body: JSON.stringify(req), headers});
            if (res.ok) {
              
              const resJson:any = await res.json();
              const result = resJson.choices[0].message.content;
              return JSON.parse(result) as Context;
            } else {
              const errText = res.text();
              console.error('error response from openAI', {status: res.status, statusText: res.statusText, msg: errText});
              return {
                type:'cfi.completion',
                result: errText,
              };
            }
          } catch(e) {
            console.error('error calling openAI api', {err: e});
          }
          return context;
}

const getCompanySummary = async (apiKey: string, polygonKey: string, context: Context):Promise<Context> => {
   
  const ticker =  context.id?.ticker?.toUpperCase();
  const info = ticker? await getTickerInfo(polygonKey, ticker) : {};
  const prices = ticker? await getPriceHistory(polygonKey, ticker): [];
  const req = {
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "user",
            content: `Write a brief, 3 paragraph summary of the following company. Place multiple line breaks between each paragraph in the resulting text. 
            Include in the summary, a synopsis of what the company does, a summary of its industry and related companies, 
            and a brief analysis of recent trends based on the industry, recent events, and the provided historic pricing.
            The company information is in JSON format with the following fields:
            ${companyInfoDefinitions}

            The company information is as follows:  ${JSON.stringify(info)}
            The company pricing information is for the past 365 days and in a JSON array with the following format: 
              - c (number): The close price for the symbol in the given time period.
              - h (number): The highest price for the symbol in the given time period.
              - l (number): The lowest price for the symbol in the given time period.
              - n (number): The number of transactions in the aggregate window.
              - o (number): The open price for the symbol in the given time period.
              - otc (boolean): Whether or not this aggregate is for an OTC ticker. This field will be left off if false.
              - t (number): The Unix Msec timestamp for the start of the aggregate window.
              - v (number): The trading volume of the symbol in the given time period.
              - vw (number): The volume weighted average price.
    
            Pricing data is as follows: ${JSON.stringify(prices)}

            `
        }
    ]
  }
  const headers = {
    "Content-Type": 'application/json',
    "Authorization": `Bearer ${apiKey}`,
    "Cache-Control": "no-cache",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive"
  };
  try {
    const res = await fetch(OPENAI_COMPLETIONS_URL, { method: 'POST', body: JSON.stringify(req), headers});
    if (res.ok) {
      
      const resJson:any = await res.json();
      const result = resJson.choices && resJson.choices.length && resJson.choices[0].message.content;
      return {
        type:'cfi.completion',
        result
      };
    } else {
      const errText = res.text();
      console.error('error response from openAI', {status: res.status, statusText: res.statusText, msg: errText});
      return {
        type:'cfi.completion',
        result: errText,
      };
    }
  } catch(e) {
    console.error('error calling openAI api', {err: e});
  }
  return context;
}

export const openAIHook = async (apiKey: string, polygonKey: string, intent: string, context:Context) => {
  console.log('openAI', context);
  if (intent === "GenerateSummary") {
    const completion = await getCompanySummary(apiKey, polygonKey, context);

    return awsResponse(200, completion);
  } 
  if (intent === "FindSimilar"){
    const instrumentList = await getSimilar(apiKey, polygonKey, context);
    return awsResponse(200, instrumentList);
  }

  return awsResponse(400, {
    message: 'intent not found',
  });
}