import type { DataActionHandler, LinkActionHandler } from '@connectifi/sdk';

import { teamsLink } from './link/teams';
import { mapLink } from './link/maps';
import { companyHQLink } from './link/polygon';
import { emailLink } from './link/email';
import { slackLink } from './link/slack';
import { polygonIOHandler } from './data/polygon';
import { openAIHandler } from './data/openAI';

const ActionsMap = () => {
  const actions: Map<string, LinkActionHandler | DataActionHandler> = new Map();

  return {
    addHandler: (
      name: string,
      handler: LinkActionHandler | DataActionHandler,
    ) => actions.set(name, handler),
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
