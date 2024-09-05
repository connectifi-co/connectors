import type { Context, ContactList } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { OPENAI_COMPLETIONS_URL } from './constants';
import { awsResponse } from './utils';
import type { Context as FDC3Context, Instrument, InstrumentList } from '@finos/fdc3';
import { POLYGON_TICKER_INFO_URL, POLYGON_EXCHANGE_INFO_URL } from './constants';

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

export const enhanceInstrument = async (apiKey: string, context:Instrument): Promise<Instrument> => {
  const tickerInfo = await getTickerInfo(apiKey, context.id?.ticker?.toUpperCase() || '')
  if (tickerInfo) {
    const newContext:Instrument = {...context};
    newContext.name = tickerInfo.name;
    newContext.description = tickerInfo.description;
    return newContext;
  }
  return context;
}

interface LinkContext {
    type: string,
    url: string,
    subject?: string,
    body?: string,
    context?: Context,
    recipients?: ContactList
}

export const addMessageToContext = async (apiKey: string, polygonKey: string, context: LinkContext, source: string):Promise<LinkContext> => {
   /* if (context.subject && context.body) {
        return context;
    }*/ 
 /* let linkContext : any = context.context || {type:"empty"};
  if (linkContext.type === ContextTypes.Instrument){
    linkContext = await enhanceInstrument(polygonKey, linkContext as Instrument);
  }*/
  const linkHTML = context.url.replace("&","%26").replace(" ","+");
  const newContext:LinkContext = {...context};
  const req = {
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "user",
            content: `Write a headline plus a brief - 3 sentences long - message for sharing a topic and a URL. 
            The topic is an app with the title of '${ context.subject }' featuring a company identified by the following FDC3 context data object:  ${JSON.stringify(context.context)} from an application called '${source}'. 
            Do not include a link or URL in the body. 
            Additionally use the following text: '${context.body}'
             Return the headline and message in a valid JSON data structure with properties of 'subject' and 'body' for example: {"subject":"...", "body":"..."}`
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
    console.log('openai request', OPENAI_COMPLETIONS_URL, apiKey, JSON.stringify(req))
    const res = await fetch(OPENAI_COMPLETIONS_URL, { method: 'POST', body: JSON.stringify(req), headers});
    if (res.ok) {
      
      const resJson:any = await res.json();
      const data = resJson.choices && resJson.choices.length && resJson.choices[0];
      console.log('openai response', {resJson, data})
      if (data) {
        const result = JSON.parse(data.message.content);
        newContext.subject = result.subject.replace("&","%26");
        newContext.body = `${result.body.replace("&","%26")} - <${linkHTML}>`;
      }
      return newContext;
    } else {
      const errText = res.text();
      console.error('error response from openAI', {status: res.status, statusText: res.statusText, msg: errText});
      newContext.body = linkHTML;
      return newContext;
    }
  } catch(e) {
    console.error('error calling openAI api', {err: e});
  }
  return context;
}

export const emailLink = async (apiKey: string, polygonKey: string, context:Context) => {
  if (context.type === "cfi.link") {

  // const newCtx = await addMessageToContext(apiKey, polygonKey, context as LinkContext, source);
    const linkHTML = context.url.replace("&","%26").replace(" ","+");
    const subject = `${context.appId} for ${context.subject.replace("&","%26")} on Connectifi!`;
    const body = `${context.text.replace("&","%26")} - <${linkHTML}>`;
    const url = `mailto:?subject=${subject}&body=${body}`;

    return awsResponse(200, {url});
  } 

  return awsResponse(400, {
    message: 'bad context type',
  });
}