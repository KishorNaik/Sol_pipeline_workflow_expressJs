import { logger } from '@/shared/utils/helpers/loggers';
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
import { FeaturePostResponseDto } from '../../../contracts';

export interface IService7 extends IServiceHandlerAsync<string, FeaturePostResponseDto> {}

@sealed
@Service()
export class SubService7 implements IService7 {
	public handleAsync(params: string): Promise<Result<FeaturePostResponseDto, ResultError>> {
		return tryCatchResultAsync(async () => {
			logger.info(`======= SubService7.handleAsync =======`);

			if (!params) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'params is null');

			const response: FeaturePostResponseDto = new FeaturePostResponseDto();
			response.message = params;

			return ResultFactory.success(response);
		});
	}
}
