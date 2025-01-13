import type { LinkActionRequest } from '@connectifi/sdk';
import { slackLink } from './slack';
import { RequestError, ServerError } from '../../types';
import { SLACK_USER_LOOKUP_URL } from '../../constants';

const mockAPIKey = 'thisisthatapikeyverysecureindeed';
const mockUserId = 'theuserid';
const mockTeamId = 'theusersteamid';

const mockReqCustom: LinkActionRequest = {
  intent: 'someIntention',
  source: 'sourcedir',
  target: { appId: 'targetapp' },
  context: {
    type: 'test.context',
    id: {
      field: 'test.context.field',
    },
  },
};

const mockReqContact: LinkActionRequest = {
  source: '',
  target: { appId: 'targetapp' },
  context: {
    type: 'fdc3.contact',
    id: {
      email: 'brian@connectifi.co',
    },
  },
};

const mockText = jest.fn();
const mockJson = jest.fn();
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('slack link misconfiguration', () => {
  it('throws api key missing error', async () => {
    expect(async () => {
      await slackLink(mockReqCustom);
    }).rejects.toThrow(ServerError);
  });
});

describe('slack link normal', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      SLACK_API_KEY: mockAPIKey,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns correct link url', async () => {
    const mockResp = {
      user: {
        id: mockUserId,
        team_id: mockTeamId,
      },
    };
    mockJson.mockReturnValue(mockResp);
    mockText.mockReturnValue(JSON.stringify(mockResp));
    mockFetch.mockReturnValue({ ok: true, json: mockJson, text: mockText });

    const { url } = await slackLink(mockReqContact);

    expect(mockFetch).toHaveBeenCalledWith(
      `${SLACK_USER_LOOKUP_URL}${mockReqContact.context.id.email}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${mockAPIKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    expect(url).toEqual(`slack://user?team=${mockTeamId}&id=${mockUserId}`);
  });

  it('handles invalid context type', async () => {
    const mockResp = {};
    mockJson.mockReturnValue(mockResp);
    mockText.mockReturnValue(JSON.stringify(mockResp));
    mockFetch.mockReturnValue({ ok: true, json: mockJson, text: mockText });

    expect(async () => {
      await slackLink(mockReqCustom);
    }).rejects.toThrow(RequestError);
  });
});
