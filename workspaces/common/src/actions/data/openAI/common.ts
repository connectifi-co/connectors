import { ResponseFormatJSONSchema } from 'openai/resources';

export const summarySchema: ResponseFormatJSONSchema.JSONSchema = {
  "name": "summary",
  "schema": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": ["connect.summary"]
      },
      "title": {
        "type": "string"
      },
      "text": {
        "type": "string"
      }
    },
    "required": ["type", "title", "text"]
  }
};

export const instrumentListSchema: ResponseFormatJSONSchema.JSONSchema = {
    "name": "instrumentList",
    "schema": {
        "type": "object",
        "properties": {
        "type": {
            "const": "fdc3.instrumentList"
        },
        "instruments": {
            "type": "array",
            "title": "List of instruments",
            "description": "An array of instrument contexts that forms the list.",
            "items": {
                "type": "object",
                "properties": {
                  "type": {
                    "const": "fdc3.instrument"
                  },
                  "id": {
                    "title": "Instrument identifiers",
                    "description": "Any combination of instrument identifiers can be used together to resolve ambiguity, or for a better match. Not all applications will use the same instrument identifiers, which is why FDC3 allows for multiple to be specified. In general, the more identifiers an application can provide, the easier it will be to achieve interoperability.\n\nIt is valid to include extra properties and metadata as part of the instrument payload, but the minimum requirement is for at least one instrument identifier to be provided.\n\nTry to only use instrument identifiers as intended. E.g. the `ticker` property is meant for tickers as used by an exchange.\nIf the identifier you want to share is not a ticker or one of the other standardized fields, define a property that makes it clear what the value represents. Doing so will make interpretation easier for the developers of target applications.",
                    "type": "object",
                    "properties": {
                      "BBG": {
                        "type": "string",
                        "title": "Bloomberg security",
                        "description": "<https://www.bloomberg.com/>"
                      },
                      "CUSIP": {
                        "type": "string",
                        "title": "CUSIP",
                        "description": "<https://www.cusip.com/>"
                      },
                      "FDS_ID": {
                        "type": "string",
                        "title": "FactSet Permanent Security Identifier",
                        "description": "<https://www.factset.com/>"
                      },
                      "FIGI": {
                        "type": "string",
                        "title": "Open FIGI",
                        "description": "<https://www.openfigi.com/>"
                      },
                      "ISIN": {
                        "type": "string",
                        "title": "ISIN",
                        "description": "<https://www.isin.org/>"
                      },
                      "PERMID": {
                        "type": "string",
                        "title": "Refinitiv PERMID",
                        "description": "<https://permid.org/>"
                      },
                      "RIC": {
                        "type": "string",
                        "title": "Refinitiv Identification Code",
                        "description": " <https://www.refinitiv.com/>"
                      },
                      "SEDOL": {
                        "type": "string",
                        "title": "SEDOL",
                        "description": "<https://www.lseg.com/sedol>"
                      },
                      "ticker": {
                        "type": "string",
                        "title": "Stock ticker",
                        "description": "Unstandardized stock tickers"
                      }
                    }
                  },
                  "market": {
                    "description": "The `market` map can be used to further specify the instrument and help achieve interoperability between disparate data sources. This is especially useful when using an `id` field that is not globally unique.",
                    "type": "object",
                    "properties": {
                      "MIC": {
                        "type": "string",
                        "title": "Market Identifier Code",
                        "description": "<https://en.wikipedia.org/wiki/Market_Identifier_Code>"
                      },
                      "name": {
                        "type": "string",
                        "title": "Market Name",
                        "description": "Human readable market name"
                      },
                      "COUNTRY_ISOALPHA2": {
                        "type": "string",
                        "title": "Country ISO Code",
                        "description": "<https://www.iso.org/iso-3166-country-codes.html>"
                      },
                      "BBG": {
                        "type": "string",
                        "title": "Bloomberg Market Identifier",
                        "description": "<https://www.bloomberg.com/>"
                      }
                    },
                    "unevaluatedProperties": {
                      "type": "string"
                    }
                  }
                },
                "required": [
                  "type","id"
                ]
              },
            }
        },
        "required": [
        "instruments"
        ]
    }
}

export const summaryDataReturnPrompt = `
Return the summary as a JSON object using the following interface:
"
  {
    type: 'connect.summary';
    title: string;
    text: string;
  }
"
`;

export const similarCompaniesDataReturnPrompt = `
Return the similar companies as a FDC3 Context Data JSON object of the type 'fdc3.instrumentList' using the following interfaces:

  interface InstrumentList {
    type: 'fdc3.instrumentList';
    instruments: Array<Instrument>;
  }

  interface Instrument {
    type: 'fdc3.instrument';
    name?: string;
    id: {
      ticker?: string;
    }
  }

  Include both the company name and ticker for each company in the 'fdc3.instrument' object. 
`;