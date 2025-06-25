import winston from 'winston';
import { DataResponse } from '../../../../models/response/data.Response';
import { PipelineWorkflowException } from '../exception';
import { StatusCodes } from 'http-status-codes';
import { Result } from 'neverthrow';
import { ResultError } from '../../../exceptions/results';

export type StepDefinition<T> = {
	name: string;
	action: () => Promise<Result<T, ResultError>>;
};

export function defineParallelSteps<T extends readonly StepDefinition<any>[]>(...steps: T): T {
	return steps;
}

export function defineParallelStep<T>(
	name: string,
	action: () => Promise<Result<T, ResultError>>
): StepDefinition<T> {
	return { name, action };
}

export class PipelineWorkflow {
	private readonly _logger: winston.Logger;
	private readonly _context = new Map<string, any>();

	public constructor(logger: winston.Logger) {
		this._logger = logger;
	}

	public async step<TResult>(
		name: string,
		action: () => Promise<Result<TResult, ResultError>>
	): Promise<TResult> {
		try {
			this._logger.info(`[Pipeline Step:START] step name: ${name}`);
			const result = await action();

			if (result.isOk()) {
				const value = result.value;
				this._context?.set(name, value);
				this._logger.info(`[Pipeline Step:OK] step name: ${name}`);
				return value;
			} else {
				this._logger.error(
					`[Pipeline Step:ERROR] step name: ${name} || error message: ${result.error.message}`
				);
				throw new PipelineWorkflowException(
					false,
					result.error.statusCode,
					result.error.message
				);
			}
		} catch (ex) {
			const error = ex as Error | PipelineWorkflowException;
			if (!(error instanceof PipelineWorkflowException)) {
				this._logger.error(
					`[Pipeline Step:EXCEPTION] step name: ${name} || error message: ${error.message}`
				);
			}
			throw error;
		}
	}

	public async stepParallel<
		TSteps extends readonly {
			name: string;
			action: () => Promise<Result<any, ResultError>>;
		}[],
	>(
		steps: TSteps
	): Promise<{
		[K in keyof TSteps]: TSteps[K] extends {
			action: () => Promise<Result<infer R, ResultError>>;
		}
			? R
			: never;
	}> {
		if (!Array.isArray(steps) || steps.length === 0) {
			throw new PipelineWorkflowException(
				false,
				StatusCodes.BAD_REQUEST,
				'Steps must be a non-empty array'
			);
		}
		try {
			this._logger.info(`[Pipeline Parallel:START] Running ${steps.length} steps`);

			const results = await Promise.all(
				steps.map(async ({ name, action }) => {
					return await this.step(name, action);
				})
			);

			this._logger.info(`[Pipeline Parallel:COMPLETE]`);
			return results as any;
		} catch (ex) {
			const error = ex as Error | PipelineWorkflowException;
			if (!(error instanceof PipelineWorkflowException)) {
				this._logger.error(
					`[Pipeline Parallel:EXCEPTION] || error message: ${error.message}`
				);
			}
			throw error;
		}
	}

	public getResult<TResult>(name: string): TResult {
		if (!this._context.has(name)) {
			throw new PipelineWorkflowException(
				false,
				StatusCodes.INTERNAL_SERVER_ERROR,
				`Step ${name} not found`
			);
		}

		return this?._context?.get(name) as TResult;
	}
}
