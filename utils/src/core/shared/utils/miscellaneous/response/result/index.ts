import { StatusCodes } from 'http-status-codes';
import { Err, Ok, Result } from 'neverthrow';
import { ResultError } from '../../../exceptions/results';

export class ResultFactory {
	public static success<T>(data: T): Result<T, ResultError> {
		return new Ok(data);
	}

	public static error<T>(
		statusCode: StatusCodes,
		message: string,
		stackTrace?: string
	): Result<T, ResultError> {
		return new Err(new ResultError(statusCode, message, stackTrace));
	}

	public static errorInstance<T>(resultError: ResultError): Result<T, ResultError> {
		return new Err(resultError);
	}
}
