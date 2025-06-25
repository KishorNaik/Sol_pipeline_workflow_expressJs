import { StatusCodes } from 'http-status-codes';

export class PipelineWorkflowException extends Error {
	private readonly _statusCode: StatusCodes;
	private readonly _success: boolean;

	constructor(success: boolean, statusCode: StatusCodes, message: string) {
		super(message);
		this._success = success;
		this._statusCode = statusCode;
	}

	public get statusCode(): StatusCodes {
		return this._statusCode;
	}

	public get success(): boolean {
		return this._success;
	}
}
