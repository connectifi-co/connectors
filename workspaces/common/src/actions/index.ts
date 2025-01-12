import type { APIActionHandler, LinkActionHandler } from '../types';

import { teamsLink } from './links/teams';
import { mapLink } from './links/maps';
import { companyHQLink } from './links/polygon';
import { emailLink } from './links/email';
import { slackLink } from './links/slack';
import { polygonIOHandler } from './api/polygon';
import { openAIHandler } from './api/openAI';

const ActionsMap = () => {
  const actions: Map<string, LinkActionHandler | APIActionHandler> = new Map();

  return {
    addHandler: (name: string, dh: LinkActionHandler) => actions.set(name, dh),
    getHandler: (name: string) => actions.get(name),
  };
};

const actions = ActionsMap();
actions.addHandler('emailLink', emailLink);
actions.addHandler('companyHQLink', companyHQLink);
actions.addHandler('locationLink', mapLink);
actions.addHandler('slackLink', slackLink);
actions.addHandler('teamsLink', teamsLink);
actions.addHandler('polygonIO', polygonIOHandler);
actions.addHandler('openAI', openAIHandler);

export const actionsMap = actions;
