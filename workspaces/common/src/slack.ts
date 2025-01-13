import { SLACK_USER_LOOKUP_URL } from './constants';

export interface SlackIDs {
  teamId: string;
  userId: string;
}

export const getSlackIDs = async (
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
