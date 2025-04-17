import {
    HubSpotSearchRequest,
    FilterOperatorEnum,
    HubSpotFilterGroup,
    HubSpotContact,
  } from './common';
  import { Query } from '../../../types';
  import { hubspotContactToFDC3 } from './common';
  import { Client } from "@hubspot/api-client";
  import { Context, Contact, ContactList } from '@finos/fdc3';
  

  const appendToSearch  = ( filterGroup: Array<HubSpotFilterGroup>, field: string, query: string) => {

    filterGroup.push({
        filters:[
            {
                propertyName:field,
                operator: FilterOperatorEnum.ContainsToken,
                value: `${query}*`
            }
        ]
    });
   filterGroup.push({
        filters:[
            {
                propertyName: field,
                operator: FilterOperatorEnum.ContainsToken,
                value: `*${query}`
            }
        ]
    });
};

const isCompanyContext = (context: Context): boolean => {
    if (context.type  === 'fdc3.instrument' && context.name){
        return true;
    }
    if (context.type  === 'connect.company' && context.name){
        return true;
    }
    return false;
};

export const searchContacts = async (apiKey: string, context: Context): Promise<ContactList> => {
    const hubspotClient = new Client({ accessToken: apiKey });
    //get the contacts
    const request: HubSpotSearchRequest = {

    }

    const filterGroups: Array<HubSpotFilterGroup>  = [];
    
    if (context.type === 'fdc3.contact'){
        const contact = context as Contact;
        if (contact.id.email) {
            filterGroups.push( 
                {
                    filters: [
                        {
                            propertyName: 'email',
                            operator: FilterOperatorEnum.Eq,
                            value: contact.id.email
                        }
                    ]
                }
            );
        }
        else {
            appendToSearch(filterGroups, "firstname", contact.name);
            appendToSearch(filterGroups, "lastname", contact.name);
        }
    }

    if (context.type === 'fdc3.contactList'){
        const list = context as ContactList;
        list.contacts.forEach( (contact) => {
            if (contact.id.email) {
                filterGroups.push( 
                    {
                        filters: [
                            {
                                propertyName: 'email',
                                operator: FilterOperatorEnum.Eq,
                                value: contact.id.email
                            }
                        ]
                    }
                );
            };
        })
    }
    if (context.type === 'connect.query'){
        const query = context as Query;
        const isEmail = query.text?.indexOf('@') > -1;

        if (isEmail){
            appendToSearch(filterGroups, "email", query.text);
        }
        else {
            appendToSearch(filterGroups, "firstname", query.text);
            appendToSearch(filterGroups, "lastname", query.text);
        }

    }
    
    if (isCompanyContext(context)){
        //find the company
        //match on name in a 'fuzzy' way
        const nameParts = context.name.split(' ');
        const  filters = [];
        nameParts.forEach((part) => {
            filters.push({
            propertyName:'name',
            operator: FilterOperatorEnum.ContainsToken,
            value: `${nameParts[0]}*`
            });
        });
        
        const companies = await hubspotClient.crm.companies.searchApi.doSearch({
            filterGroups:[
                { filters }
            ]
        });
        if (companies.results[0]){
            const companyId = companies.results[0].id;
            filterGroups.push({
                filters: [
                    {
                        propertyName: "associations.company",
                        operator: FilterOperatorEnum.Eq,
                        value: companyId
                    }
                ]
            });
        }
    }

    if (filterGroups.length > 0){
        const contactSearchResults = await hubspotClient.crm.contacts.searchApi.doSearch({
            filterGroups,
            limit: 100
        });

        return {
                type: 'fdc3.contactList',
                contacts: contactSearchResults.results.map((result) => hubspotContactToFDC3(result as unknown as HubSpotContact))
        };
    }
    return null;
    
}