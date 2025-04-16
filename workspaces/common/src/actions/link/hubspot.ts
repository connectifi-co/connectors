import type { LinkActionHandler } from '@connectifi/sdk';
import {  Contact } from '@finos/fdc3';
import { HubSpotContact } from '../../types';

interface AccountInfoResponse {
    portalId: number;
    accountType: string;
    timeZone: string;
    companyCurrency: string;
    additionalCurrencies: Array<string>;
    utcOffset: string;
    utcOffsetMilliseconds: number;
    uiDomain: string;
    dataHostingLocation: string;
}

const getPortalId = async (apiKey: string ): Promise<string | null> => {
    const headers =  {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      };
      const rawResult = await fetch('https://api.hubapi.com/account-info/v3/details', { method: 'GET', headers: headers});
      const result = await rawResult.json() as AccountInfoResponse;
      if ( result.portalId) {
        return `${result.portalId}`;
      }
      return null;
};

export const hubspotContactLink: LinkActionHandler = async (request) => {
    const apiKey = request.headers?.['api-key'] || process.env.HUBSPOT_API_KEY;
    const { context } = request; 
    const portalId = await getPortalId(apiKey);
    if (portalId && context.type === 'fdc3.contact'){
        const contact = context as Contact;
        let hubspotId: string | undefined = contact.id?.hubspotId;
        if (!hubspotId){
            const email = contact.id?.email;
            if (email) {
                const contact = await getContactByEmail(apiKey, email);
                console.log('got contact!', JSON.stringify(contact));
                hubspotId = contact?.id;
            }
        }
        if (hubspotId) {
            const url = `https://app.hubspot.com/contacts/${portalId}/record/0-1/${hubspotId}`;
            console.log('*********Returning the  URL!', url);
            return { url };
        }
    } 
    console.log('*********Returning Null!!!!!');
    return null;
}



const getContactByEmail = async (apiKey: string, email: string): Promise<HubSpotContact | null> => {
    console.log('getting contact by email', email);
    const headers =  {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      };
      const rawResult = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`, { method: 'GET', headers: headers});
      const result = await rawResult.json();
      console.log('got contact result', JSON.stringify(result));
      if (result) {
        return result as HubSpotContact;
      }
      return null;
};

