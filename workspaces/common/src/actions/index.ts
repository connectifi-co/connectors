import type { LinkActionHandler } from '../types';

import { teamsLink } from './links/teams';
import { mapLink } from './links/maps';
import { companyHQLink } from './links/polygon';
import { emailLink } from './links/email';
// import { slackLink } from './links/slackLink';

const ActionsMap = () => {
  const actions: Map<string, LinkActionHandler> = new Map();

  return {
    addHandler: (name: string, dh: LinkActionHandler) =>
      actions.set(name, dh),
    getHandler: (name: string) => actions.get(name),
  };
};

const actions = ActionsMap();
actions.addHandler('emailLink', emailLink);
actions.addHandler('companyHQLink', companyHQLink);
actions.addHandler('locationLink', mapLink);
// actions.addHandler('slackLink', slackLink);
actions.addHandler('teamsLink', teamsLink);

export const actionsMap = actions;
