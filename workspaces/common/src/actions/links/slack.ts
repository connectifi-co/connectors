import type { LinkActionHandler } from '@connectifi/sdk';
import { ContextTypes } from '@finos/fdc3';
import { RequestError, ServerError } from '../../types';
import { SLACK_USER_LOOKUP_URL } from '../../constants';

export const slackLink: LinkActionHandler = async (request) => {
  const apiKey = process.env.SLACK_API_KEY;
  if (!apiKey) {
    throw new ServerError('slack api key missing');
  }

  const { context } = request;
  if (context.type !== ContextTypes.Contact) {
    throw new RequestError('context type not supported');
  }

  const ids = await getSlackIDs(apiKey, context.id.email);
  const url = `slack://user?team=${ids.teamId}&id=${ids.userId}`;
  return { url };
};

interface SlackIDs {
  teamId: string;
  userId: string;
}

const getSlackIDs = async (
  apiKey: string,
  email: string,
): Promise<SlackIDs> => {
  const apiURL = SLACK_USER_LOOKUP_URL + email;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const res = await fetch(apiURL, { method: 'GET', headers });
  const resJson: any = await res.json();
  return {
    teamId: resJson.user.team_id,
    userId: resJson.user.id,
  };
};
