import { type Contact, type Context, ContextTypes } from '@finos/fdc3';
import type { DeliveryHookHandler } from '@connectifi/sdk';
import { SLACK_USER_LOOKUP_URL } from '../constants';
import { RequestError, ServerError } from '../types';

const apiKey = process.env.SLACK_API_KEY;

export const slackHook: DeliveryHookHandler = async (request) => {
  if (!apiKey) {
    throw new ServerError('slack api key missing');
  }

  const { context } = request;
  if (context.type !== ContextTypes.Contact) {
    throw new RequestError('context type not supported');
  }

  const newCtx = await enahanceContact(apiKey, context as Contact);
  return { context: newCtx };
};

// TODO revisit this - doesn't really make sense as a delivery hook
const enahanceContact = async (
  apiKey: string,
  context: Contact,
): Promise<Context> => {
  const email = context.id.email;

  const apiURL = SLACK_USER_LOOKUP_URL + email;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  try {
    console.log(`calling slack api at: ${apiURL}`, { headers });

    const res = await fetch(apiURL, { method: 'GET', headers });
    if (res.ok) {
      const newContext: Contact = { ...context };
      const resJson: any = await res.json();
      console.log('slack response', { resJson });
      if (resJson.ok && resJson.user) {
        newContext.id.slackUserId = resJson.user.id;
        newContext.id.slackTeamId = resJson.user.team_id;
        newContext.id.slackUrl = `slack://user?team=${resJson.user.team_id}&id=${resJson.user.id}`;
      }
      return newContext;
    } else {
      const errText = res.text();
      console.error('error response from slack API', {
        status: res.status,
        statusText: res.statusText,
        msg: errText,
      });
    }
  } catch (e) {
    console.error('error calling slack API', { err: e });
  }
  return context;
};
