import { UsersListArguments, WebClient } from '@slack/web-api';
import { Contact } from '@finos/fdc3';
import { List } from '../../../types';

export const getUsers =  async (apiKey:  string): Promise<List> => {
    const slackAPI = new WebClient(apiKey);

    const users = await slackAPI.users.list({});
    //filter out bot and restricted users
    const members = users.members.filter((user) => {
        if (user.deleted) {
            return false;
        }
        if (user.is_bot){
            return false;
        }
        if (!user.is_email_confirmed){
            return false;
        }
        if (user.is_restricted){
            return false;
        }
        if (!user.profile.email){
            return false;
        }
        return true;
    });

    const mappedUsers = members.map((user) => {
        return {
            type: 'fdc3.contact',
            name: user.name,
            id: {
                email: user.profile.email,
                slack: user.id,
                teamId: user.team_id

            }
        } as Contact;
    });

    return {
        type: "connect.list",
        listType: "fdc3.contact",
        items: mappedUsers
    }

};

export const decorateContact = async (apiKey: string, contact: Contact): Promise<Contact> => {
    if (!contact.id.email) {
        return contact;
    }
    const slackAPI = new WebClient(apiKey);

    const users = await slackAPI.users.list({});
    const found = users.members.filter((user) => {
        return user.profile.email === contact.id.email;
    });
    if (found.length > 0){
        contact.id.slack = found[0].id;
    }
    return contact;
}