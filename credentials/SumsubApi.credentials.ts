import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SumsubApi implements ICredentialType {
	name = 'sumsubApi';
	displayName = 'Sumsub API';
	documentationUrl = 'https://developers.sumsub.com/api-reference/';
	properties: INodeProperties[] = [
		{
			displayName: 'App Token',
			name: 'appToken',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
			description: 'Your Sumsub application token',
		},
		{
			displayName: 'App Secret',
			name: 'appSecret',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
			description: 'Your Sumsub application secret key',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://api.sumsub.com',
			required: true,
			description: 'The Sumsub API base URL',
		},
	];
}
