import type { Context as FDC3Context, Contact } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { SLACK_USER_LOOKUP_URL } from '../lib/constants';
import { createResponse } from '../lib/utils';
import { DeliveryHookHandler } from '../lib/types';

const enahanceContact = async (apiKey: string, context:Contact):Promise<FDC3Context> => {
  const email = context.id.email;

  const apiURL = SLACK_USER_LOOKUP_URL + email;
  const headers = {
    "Content-Type": 'application/json',
    "Authorization": `Bearer ${apiKey}`,
  };

  try {

    console.log(`calling slack api at: ${apiURL}`, {headers});

    const res = await fetch(apiURL, { method: 'GET', headers});
    if (res.ok) {
      const newContext:Contact = {...context};
      const resJson:any = await res.json();
      console.log('slack response', {resJson})
      if (resJson.ok && resJson.user) {
        newContext.id.slackUserId = resJson.user.id;
        newContext.id.slackTeamId = resJson.user.team_id;
      }
      return newContext;
    } else {
      const errText = res.text();
      console.error('error response from slack API', {status: res.status, statusText: res.statusText, msg: errText});
    }
  } catch(e) {
    console.error('error calling slack API', {err: e});
  }
  return context;
}

export const slackHook: DeliveryHookHandler = async (params) => {
  const {keys, context, destinations} = {...params};
  const apiKey = keys?.['apiKey'];
  if (! apiKey){
    return createResponse(400, {
      message: 'no api key provided',
    });
  }
  if (context.type === ContextTypes.Contact) {
    const newCtx = await enahanceContact(apiKey, context as Contact);
    const changes = destinations.map(destination => ({
      destination,
      context: newCtx,
    }));

    return createResponse(200, {changes});
  }

  return createResponse(400, {
    message: 'bad context type',
  });
}