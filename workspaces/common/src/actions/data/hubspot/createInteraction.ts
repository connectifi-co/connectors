import {
    Interaction,
    FilterOperatorEnum,
    HSFilterGroup,
    HubSpotCreateObject,
    HubSpotObjectAssociations,
    TransactionResult,
    HubSpotContact,
  } from '../../../types';
import { Client, AssociationTypes } from "@hubspot/api-client";
import { hubspotContactToFDC3 } from './common';
  
export const createInteraction = async (apiKey: string, context: Interaction): Promise<TransactionResult> => {
    const hubspotClient = new Client({ accessToken: apiKey });

    const filterGroups: Array<HSFilterGroup>  = [];
    
    context.participants.contacts.forEach( (contact) => {
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

    
    const contactSearchResults = await hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups
    });

    const associations: Array<HubSpotObjectAssociations> = [];

    const associationType = interactionTypeToAssociationType(context.interactionType);
    contactSearchResults.results.forEach(async (result) => {
        associations.push({
            to: {
                id: result.id
            },
            types: [
                {
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: associationType,
                }
            ]
        })
    });
    const createObj: HubSpotCreateObject = {
        properties: {
            hs_note_body: context.description,
            hs_timestamp: `${Date.now()}`
        },
        associations
    };
    
    //create a note?
    if (associationType === AssociationTypes.noteToContact){
        await hubspotClient.crm.objects.notes.basicApi.create(createObj as any);
    }
    if (associationType === AssociationTypes.callToContact){
        await hubspotClient.crm.objects.calls.basicApi.create(createObj as any);
    }
    if (associationType === AssociationTypes.communicationToContact){
        await hubspotClient.crm.objects.communications.basicApi.create(createObj as any);
    }
    if (associationType === AssociationTypes.meetingToContact){
        await hubspotClient.crm.objects.meetings.basicApi.create(createObj as any);
    }
    if (associationType === AssociationTypes.emailToContact){
        await hubspotClient.crm.objects.emails.basicApi.create(createObj as any);
    }

    return {
        type: 'fdc3.transactionResult',
        status: 'Updated',
        context: {
            type: 'fdc3.contactList',
            contacts: contactSearchResults.results.map((result) => hubspotContactToFDC3(result as unknown as HubSpotContact))
        }
    }

}

const interactionTypeToAssociationType = (interaction: string): number => {
    let result = AssociationTypes.noteToContact;
    if (interaction === 'Instant Message'){
        result = AssociationTypes.communicationToContact;
    }
    if (interaction === 'Email'){
        result = AssociationTypes.emailToContact;
    }
    if (interaction === 'Call') {
        result = AssociationTypes.callToContact;
    }
    if (interaction === 'Meeting') {
        result = AssociationTypes.meetingToContact;
    }
    return result;
};