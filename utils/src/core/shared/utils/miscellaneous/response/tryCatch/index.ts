import { StatusCodes } from 'http-status-codes';
import { Result } from 'neverthrow';
import { ResultError } from '../../../exceptions/results';
import { ResultFactory } from '../result';

export const tryCatchResultAsync = async <T>(
	onTry: () => Promise<Result<T, ResultError>>
): Promise<Result<T, ResultError>> => {
	try {
		if (!onTry) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Action is required');
		const result = await onTry();
		return result;
	} catch (ex) {
		const error = ex as Error;
		return ResultFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error.stack);
	}
};

export const tryCatchFinallyResultAsync = async <T>(
	onTry: () => Promise<Result<T, ResultError>>,
	onFinally?: () => void | Promise<void>
): Promise<Result<T, ResultError>> => {
	try {
		if (!onTry) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Action is required');
		const result = await onTry();
		return result;
	} catch (ex) {
		const error = ex as Error;
		return ResultFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error.stack);
	} finally {
		if (onFinally) {
			await onFinally();
		}
	}
};
