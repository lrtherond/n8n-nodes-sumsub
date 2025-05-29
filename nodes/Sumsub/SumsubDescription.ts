import { INodeProperties } from 'n8n-workflow';

export const sumsubOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['applicant'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new applicant',
				action: 'Create an applicant',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get applicant information',
				action: 'Get an applicant',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get applicant verification status',
				action: 'Get applicant status',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update applicant information',
				action: 'Update an applicant',
			},
		],
		default: 'get',
	},
];

export const sumsubFields: INodeProperties[] = [
	// Create applicant fields
	{
		displayName: 'External User ID',
		name: 'externalUserId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['applicant'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'External user ID from your system',
	},
	{
		displayName: 'Level Name',
		name: 'levelName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['applicant'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Verification level name',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['applicant'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Applicant email address',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Applicant phone number',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'Applicant first name',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Applicant last name',
			},
		],
	},

	// Get applicant fields
	{
		displayName: 'Applicant ID',
		name: 'applicantId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['applicant'],
				operation: ['get', 'getStatus', 'update'],
			},
		},
		default: '',
		description: 'The applicant ID to retrieve',
	},

	// Update applicant fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['applicant'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Applicant email address',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Applicant phone number',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'Applicant first name',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Applicant last name',
			},
		],
	},
];
