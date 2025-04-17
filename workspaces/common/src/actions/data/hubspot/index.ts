import { DataActionHandler } from '@connectifi/sdk';
import {
    RequestError,
    ServerError, 
    Interaction,
  } from '../../../types';
import { createInteraction } from './createInteraction';
import { searchContacts } from './contacts';
  
export const hubspotHandler: DataActionHandler = async (params) => {
  const apiKey = params.headers?.['api-key'] || process.env.HUBSPOT_API_KEY;
  if (!apiKey) {
    throw new ServerError('HubSpot api key missing');
  }
  const { context, intent } = params;
  switch (intent) {
    case "CreateInteraction":
      return await createInteraction(apiKey, context as Interaction);
    case "SearchContacts":
        return await searchContacts(apiKey, context);
    default:
      throw new RequestError('intent not supported');
  }
};
