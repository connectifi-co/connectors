import type { Context } from '@finos/fdc3';
import { ContactList } from '@finos/fdc3';
import { OPENAI_COMPLETIONS_URL } from './constants';
import { awsResponse } from './utils';

interface LinkContext {
    type: string,
    url: string,
    subject?: string,
    body?: string,
    context?: Context,
    recipients?: ContactList
}

export const addMessageToContext = async (apiKey: string, context: LinkContext):Promise<Context> => {
    if (context.subject && context.body) {
        return context;
    }
  const linkContext = context.context || {type:"empty"};
  
  const req = {
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "user",
            content: `Write a headline plus a brief - 3 sentences long - message for sharing a topic and a URL. 
            The topic is an FDC3 context data object of: ${JSON.stringify(linkContext)}.  
             The URL to link to is : ${context.url} The title of the page the link is to is: The Connectifi Financial Portal. 
             Put the headline and message into a JSON data structure with properties of 'subject' and 'body'`
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
      const newContext:LinkContext = {...context};
      const resJson:any = await res.json();
      const data = resJson.choices && resJson.choices.length && resJson.choices[0];
      console.log('openai response', {resJson, data})
      if (data) {
        const result = JSON.parse(data.message.content);
        newContext.subject = result.subject;
        newContext.body = result.body;   
      }
      return newContext;
    } else {
      const errText = res.text();
      console.error('error response from openAI', {status: res.status, statusText: res.statusText, msg: errText});
    }
  } catch(e) {
    console.error('error calling openAI api', {err: e});
  }
  return context;
}

export const linkMessageHook = async (apiKey: string, context: Context, destinations: string[]) => {
  if (context.type === "cfi.link") {
    const newCtx = await addMessageToContext(apiKey, context as LinkContext);
    console.log("******* linkMessage Hook new context", JSON.stringify(newCtx));
    const changes = destinations.map(destination => ({
      destination,
      context: newCtx,
    }));
  
    return awsResponse(200, changes);
  }

  return awsResponse(400, {
    message: 'bad context type',
  });
}

