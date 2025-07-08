import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { createHmac } from 'crypto';
import { sumsubFields, sumsubOperations } from './SumsubDescription';

// sumsub API types based on official documentation
interface SumsubCredentials {
	appToken: string;
	appSecret: string;
	apiUrl: string;
}

interface ApplicantAdditionalFields {
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
}

interface ApplicantUpdateFields {
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
}

interface CreateApplicantBody extends IDataObject {
	externalUserId: string;
	levelName: string;
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
}

interface UpdateApplicantBody extends IDataObject {
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
}

interface ReviewResult extends IDataObject {
	reviewAnswer: 'GREEN' | 'RED';
	rejectLabels?: string[];
	reviewRejectType?: 'FINAL' | 'RETRY';
	clientComment?: string;
	moderationComment?: string;
	buttonIds?: string[];
}

interface ApplicantReview extends IDataObject {
	reviewId: string;
	levelName: string;
	attemptId: string;
	attemptCnt: number;
	elapsedSincePendingMs: number;
	createDate: string;
	reviewDate?: string;
	reviewResult?: ReviewResult;
	reviewStatus: 'init' | 'pending' | 'prechecked' | 'queued' | 'completed' | 'onHold';
	priority?: number;
}

interface ApplicantInfo extends IDataObject {
	firstName?: string;
	firstNameEn?: string;
	middleName?: string;
	middleNameEn?: string;
	lastName?: string;
	lastNameEn?: string;
	gender?: 'M' | 'F';
	dob?: string;
	placeOfBirth?: string;
	countryOfBirth?: string;
	stateOfBirth?: string;
	country?: string;
	nationality?: string;
	tin?: string;
}

interface ApplicantData extends IDataObject {
	id: string;
	createdAt: string;
	clientId: string;
	inspectionId: string;
	externalUserId: string;
	sourceKey?: string;
	info?: ApplicantInfo;
	fixedInfo?: ApplicantInfo;
	email?: string;
	phone?: string;
	applicantPlatform?: string;
	ipCountry?: string;
	authCode?: string;
	lang?: string;
	metadata?: Array<{ key: string; value: string }>;
	type: 'individual' | 'company';
	tags?: string[];
	review?: ApplicantReview;
}

type SumsubApiResponse = ApplicantData | ApplicantReview | IDataObject;

export class Sumsub implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sumsub',
		name: 'sumsub',
		icon: 'file:sumsub.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Sumsub API for identity verification',
		defaults: {
			name: 'Sumsub',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'sumsubApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Applicant',
						value: 'applicant',
					},
				],
				default: 'applicant',
			},
			...sumsubOperations,
			...sumsubFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = (await this.getCredentials('sumsubApi')) as SumsubCredentials;
		const { appToken, appSecret, apiUrl } = credentials;

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: SumsubApiResponse;

				if (resource === 'applicant') {
					if (operation === 'create') {
						responseData = await createApplicant({
							executeFunctions: this,
							itemIndex: i,
							apiUrl,
							appToken,
							appSecret,
						});
					} else if (operation === 'get') {
						responseData = await getApplicant({
							executeFunctions: this,
							itemIndex: i,
							apiUrl,
							appToken,
							appSecret,
						});
					} else if (operation === 'getStatus') {
						responseData = await getApplicantStatus({
							executeFunctions: this,
							itemIndex: i,
							apiUrl,
							appToken,
							appSecret,
						});
					} else if (operation === 'update') {
						responseData = await updateApplicant({
							executeFunctions: this,
							itemIndex: i,
							apiUrl,
							appToken,
							appSecret,
						});
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not known!`,
						);
					}
				} else {
					throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not known!`);
				}

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

function createSignature({
	method,
	path,
	timestamp,
	body,
	appSecret,
}: {
	method: string;
	path: string;
	timestamp: number;
	body: string;
	appSecret: string;
}): string {
	const message = timestamp + method.toUpperCase() + path + body;
	return createHmac('sha256', appSecret).update(message).digest('hex');
}

interface MakeRequestParams {
	executeFunctions: IExecuteFunctions;
	method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
	path: string;
	apiUrl: string;
	appToken: string;
	appSecret: string;
	body?: IDataObject;
}

async function makeRequest(params: MakeRequestParams): Promise<SumsubApiResponse> {
	const { executeFunctions, method, path, apiUrl, appToken, appSecret, body } = params;
	const timestamp = Math.floor(Date.now() / 1000);
	const bodyString = body ? JSON.stringify(body) : '';
	const signature = createSignature({ method, path, timestamp, body: bodyString, appSecret });

	const options: IHttpRequestOptions = {
		method,
		url: path,
		baseURL: apiUrl,
		headers: {
			'Content-Type': 'application/json',
			'X-App-Token': appToken,
			'X-App-Access-Sig': signature,
			'X-App-Access-Ts': timestamp.toString(),
		},
		json: true,
	};

	if (body) {
		options.body = body;
	}

	return await executeFunctions.helpers.request(options);
}

interface ApplicantOperationParams {
	executeFunctions: IExecuteFunctions;
	itemIndex: number;
	apiUrl: string;
	appToken: string;
	appSecret: string;
}

async function createApplicant(params: ApplicantOperationParams): Promise<ApplicantData> {
	const { executeFunctions, itemIndex, ...requestParams } = params;
	const externalUserId = executeFunctions.getNodeParameter('externalUserId', itemIndex) as string;
	const levelName = executeFunctions.getNodeParameter('levelName', itemIndex) as string;
	const additionalFields = executeFunctions.getNodeParameter(
		'additionalFields',
		itemIndex,
		{},
	) as ApplicantAdditionalFields;

	const body: CreateApplicantBody = {
		externalUserId,
		levelName,
	};

	// add additional fields to the body
	if (additionalFields.email) body.email = additionalFields.email;
	if (additionalFields.phone) body.phone = additionalFields.phone;
	if (additionalFields.firstName) body.firstName = additionalFields.firstName;
	if (additionalFields.lastName) body.lastName = additionalFields.lastName;

	const path = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`;
	return (await makeRequest({
		executeFunctions,
		method: 'POST',
		path,
		body,
		...requestParams,
	})) as ApplicantData;
}

async function getApplicant(params: ApplicantOperationParams): Promise<ApplicantData> {
	const { executeFunctions, itemIndex, ...requestParams } = params;
	const applicantId = executeFunctions.getNodeParameter('applicantId', itemIndex) as string;
	const path = `/resources/applicants/${applicantId}/one`;
	return (await makeRequest({
		executeFunctions,
		method: 'GET',
		path,
		...requestParams,
	})) as ApplicantData;
}

async function getApplicantStatus(params: ApplicantOperationParams): Promise<ApplicantReview> {
	const { executeFunctions, itemIndex, ...requestParams } = params;
	const applicantId = executeFunctions.getNodeParameter('applicantId', itemIndex) as string;
	const path = `/resources/applicants/${applicantId}/status`;
	return (await makeRequest({
		executeFunctions,
		method: 'GET',
		path,
		...requestParams,
	})) as ApplicantReview;
}

async function updateApplicant(params: ApplicantOperationParams): Promise<ApplicantData> {
	const { executeFunctions, itemIndex, ...requestParams } = params;
	const applicantId = executeFunctions.getNodeParameter('applicantId', itemIndex) as string;
	const updateFields = executeFunctions.getNodeParameter(
		'updateFields',
		itemIndex,
		{},
	) as ApplicantUpdateFields;

	const body: UpdateApplicantBody = {};

	// add update fields to the body
	if (updateFields.email) body.email = updateFields.email;
	if (updateFields.phone) body.phone = updateFields.phone;
	if (updateFields.firstName) body.firstName = updateFields.firstName;
	if (updateFields.lastName) body.lastName = updateFields.lastName;

	const path = `/resources/applicants/${applicantId}/info`;
	return (await makeRequest({
		executeFunctions,
		method: 'PATCH',
		path,
		body,
		...requestParams,
	})) as ApplicantData;
}
