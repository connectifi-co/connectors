import { Contact } from '@finos/fdc3';

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


export interface HubSpotContact extends HubSpotObject {  
  properties: {
      createdate: string,
      email: string;
      firstname?: string;
      hs_object_id: string;
      lastmodifieddate: string;
      lastname?: string;
  },
}

export interface HubSpotCreateObject {
      associations: Array<HubSpotObjectAssociations>;
      objectWriteTraceId?: string;
      properties: {
        [key: string]: string;
    };
}

export interface HubSpotObjectAssociations {
  types: Array<HubSpotAssociation>;
  to: { id: string;}
}

export interface HubSpotAssociation {
   associationCategory: string;
   associationTypeId: number;
}

export interface HubSpotObject  {  
  id: string;
  properties: {
    [key: string]: string | null;
  },
  createdAt: string;
  updatedAt: string;
  archived:  boolean;
}


export interface HubSpotSearchRequest {
    query?: string;
    limit?: number;
    after?: string;
    sorts?: Array<string>;
    properties?: Array<string>;
    filterGroups?: Array<HubSpotFilterGroup>;
}

export interface HubSpotFilterGroup {
    filters: Array<HubSpotFilter>;
}

export interface HubSpotFilter {
  highValue?: string;
  propertyName: string;
  values?: Array<string>;
  value?: string;
  operator: FilterOperatorEnum;
}

export interface HSCollectionResponse {
    total: number;
    results: Array<HubSpotObject>;
}

export enum FilterOperatorEnum {
  Eq = "EQ",
  Neq = "NEQ",
  Lt = "LT",
  Lte = "LTE",
  Gt = "GT",
  Gte = "GTE",
  Between = "BETWEEN",
  In = "IN",
  NotIn = "NOT_IN",
  HasProperty = "HAS_PROPERTY",
  NotHasProperty = "NOT_HAS_PROPERTY",
  ContainsToken = "CONTAINS_TOKEN",
  NotContainsToken = "NOT_CONTAINS_TOKEN"
}
