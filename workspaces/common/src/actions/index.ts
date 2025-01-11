import type { ActionHandler } from '../types';

import { teamsLink } from './links/teamsLink';
import { mapLink } from './links/mapLink';
// import { locationLink, companyHQLink } from './links/maps';
import { emailLink } from './links/emailLink';
// import { slackLink } from './links/slackLink';

const ActionsMap = () => {
  const actions: Map<string, ActionHandler> = new Map();

  return {
    addHandler: (name: string, dh: ActionHandler) =>
      actions.set(name, dh),
    getHandler: (name: string) => actions.get(name),
  };
};

const actions = ActionsMap();
actions.addHandler('emailLink', emailLink);
actions.addHandler('mapLink', mapLink);
// actions.addHandler('slackLink', teamsLink);
actions.addHandler('teamsLink', teamsLink);

export const actionsMap = actions;
