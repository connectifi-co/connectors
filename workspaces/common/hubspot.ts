import type { Context as FDC3Context, Instrument, Contact } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { awsResponse } from './utils';

interface HSContact  {  
    id: string;
    properties: {
        createdate: string,
        email: string;
        firstname?: string;
        hs_object_id: number;
        lastmodifieddate: string;
        lastname?: string;
    },
    createdAt: string;
    updatedAt: string;
    archived:  boolean;
}

interface SearchQuery extends FDC3Context {
    text: string;
}

const getPortalId = async (apiKey: string ): Promise<string | null> => {
    const headers =  {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      };
      const rawResult = await fetch('https://api.hubapi.com/account-info/v3/details', { method: 'GET', headers: headers});
      const result = await rawResult.json();
      console.log('called huspot details ', JSON.stringify(result));
      if ( result.portalId) {
        return result.portalId as string;
      }
      return null;
};

const getContactByEmail = async (apiKey: string, email: string): Promise<HSContact | null> => {
    const headers =  {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      };
      const rawResult = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`, { method: 'GET', headers: headers});
      const result = await rawResult.json();
      console.log('called huspot contact ', JSON.stringify(result));
      if ( result) {
        return result as HSContact;
      }
      return null;
};

const appendToSearch = (filterGroup: Array<any>, field: string, value: string) => {
    filterGroup.push({
        "filters":[
            {
                "propertyName":field,
                "operator":"CONTAINS_TOKEN",
                "value": `${value}*`
            }
        ]
    });
    filterGroup.push({
        "filters":[
            {
                "propertyName":field,
                "operator":"CONTAINS_TOKEN",
                "value": `*${value}`
            }
        ]
    });
    filterGroup.push({
        "filters":[
            {
                "propertyName":field,
                "operator":"EQ",
                "value": `${value}`
            }
        ]  
    });
};

// /crm/v3/objects/contacts/search
const searchContacts = async (apiKey: string, search: SearchQuery): Promise<Array<HSContact>> => {
    const headers =  {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      };
      const body = {
        "filterGroups":[

        ]
    };
    
    const isEmail = search.text.indexOf('@') > -1;

    if (isEmail){
        appendToSearch(body.filterGroups, "email", search.text);
    }
    else {
        appendToSearch(body.filterGroups, "firstname", search.text);
        appendToSearch(body.filterGroups, "lastname", search.text);
    }

    console.log('calling hubspot search', body);
    
      const rawResult = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, { method: 'POST', headers: headers, body: JSON.stringify(body)});
      const result = await rawResult.json();
      console.log('called hubspot search ', JSON.stringify(result));
      if ( result) {
        return result.results as Array<HSContact>;
      }
      return [];
};

const mapContact = (contact: HSContact): Contact => {
    const name = `${contact.properties.firstname} ${contact.properties.lastname}`;
    return {
        type:'fdc3.contact',
        name,
        id: {
            email: contact.properties.email,
            hubspotId: contact.id
        }
    };
};

export const hubspotHook = async (apiKey: string, intent: string, context:FDC3Context) => {
    console.log('Hubspot Hook called', intent, context);

    if (intent === 'SearchContacts') {
        if (context.type === 'searchquery'){
            const contacts = await searchContacts(apiKey, context as SearchQuery);
            return awsResponse(200, contacts.map(mapContact));
        }

    }

    if (intent === 'ListContacts') {

    }

    if (intent === 'SearchCompanies') {

    }

    if (intent === 'CreateContact') {

    }

    if (intent === 'GetContact') {
        if (context.type === 'fdc3.contact'){
            const email = context.id?.email;
            if (email){
                const contact = await getContactByEmail(apiKey, email);
                if (contact) {   
                    return awsResponse(200, mapContact(contact));
                }
            }
            

        }
    }

    if (intent === 'ViewContacts') {
        const portalId = await getPortalId(apiKey);
        if (portalId) {
            return awsResponse(200, {url: `https://app.hubspot.com/contacts/${portalId}/objects/0-1/views/all/list`});
        }
        return awsResponse(200, {url: 'https://app.hubspot.com'});
    }

    if (intent === 'ViewContact') {
        const portalId = await getPortalId(apiKey);
        if (portalId && context.type === 'fdc3.contact'){
            let hubspotId: string | undefined = context.id?.hubspotId;
            if (!hubspotId){
                const email = context.id?.email;
                if (email){
                const contact = await getContactByEmail(apiKey, email);
                hubspotId = contact?.id;
                }
            }
            if (hubspotId) {
                    const url = `https://app.hubspot.com/contacts/${portalId}/record/0-1/${hubspotId}`;
                    return awsResponse(200, {url});
            }
        }
    }

    return awsResponse(400, {
        message: 'unknown intent or bad context type',
    });
}