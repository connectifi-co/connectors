import { Contact } from '@finos/fdc3';
import { HubSpotContact } from '../../../types';

interface ContactParams {
    email: string;
    firstName?: string;
    lastName?: string;
}
export const hubspotContactToFDC3  = (contact: HubSpotContact): Contact => {
    const result: Contact = {
        type: 'fdc3.contact',
        id: {
            email: contact.properties.email,
            hubspotId: contact.id
        },
        name: `${contact.properties.firstname} ${contact.properties.lastname}`,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
    };
    return result;
};