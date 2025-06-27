import {
	IServiceHandlerAsync,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	StatusCodes,
	tryCatchResultAsync,
} from '@kishornaik/utils';
import { FeaturePostRequestDto } from '../../../contracts';
import { logger } from '@/shared/utils/helpers/loggers';

export interface ISubService1 extends IServiceHandlerAsync<FeaturePostRequestDto, string> {}

@sealed
@Service()
export class SubService1 implements ISubService1 {
	public handleAsync(params: FeaturePostRequestDto): Promise<Result<string, ResultError>> {
		return tryCatchResultAsync(async () => {
			logger.info(`======= SubService1.handleAsync =======`);

			// Guard
			if (!params) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'params is null');

			const { title, description } = params;

			logger.info(`title: ${title}`);
			logger.info(`description: ${description}`);

			return ResultFactory.success(`Sub Service 1 : ${params.title}`);
		});
	}
}
