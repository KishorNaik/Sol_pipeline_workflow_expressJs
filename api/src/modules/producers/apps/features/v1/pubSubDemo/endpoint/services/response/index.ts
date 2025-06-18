import { IServiceHandlerNoParamsAsync, ResultError, ResultExceptionFactory, sealed } from "@kishornaik/utils";
import { Service } from "typedi";
import { PubSubResponseDto } from "../../../contracts";
import { Ok, Result } from "neverthrow";
import { StatusCodes } from "http-status-codes";

export interface IPubSubResponseService extends IServiceHandlerNoParamsAsync<PubSubResponseDto>{}

@sealed
@Service()
export class PubSubResponseService implements IPubSubResponseService{
  public async handleAsync(): Promise<Result<PubSubResponseDto, ResultError>> {
    try
    {
      const response = new PubSubResponseDto();
      response.message = `User created`;

      return new Ok(response);
    }
    catch(ex){
      const error=ex as Error;
      return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

}
