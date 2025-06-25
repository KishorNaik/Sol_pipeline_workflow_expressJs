import { logger } from "@/shared/utils/helpers/loggers";
import { IServiceHandlerAsync, Result, ResultError, ResultFactory, sealed, Service, StatusCodes, tryCatchResultAsync } from "@kishornaik/utils";

export interface IService2 extends IServiceHandlerAsync<string,string>{};

@sealed
@Service()
export class SubService2 implements IService2{
  public handleAsync(params: string): Promise<Result<string, ResultError>> {
    return tryCatchResultAsync(async ()=>{
      logger.info(`======= SubService2.handleAsync =======`);

      if(!params)
        return ResultFactory.error(StatusCodes.BAD_REQUEST, 'params is null');

      return ResultFactory.success(`Sub Service 2 + ${params}`);
    });
  }

}
