import { IServiceHandlerVoidAsync, PubSubMessagePusher, PubSubProducerPusher, ResultError, ResultExceptionFactory, sealed } from "@kishornaik/utils";
import { StatusCodes } from "http-status-codes";
import { Ok, Result } from "neverthrow";
import { Service } from "typedi";
import { PubSubRequestDto } from "../../../contracts";
import { Guid } from "guid-typescript";

export interface IPubSubPublishEventServiceParameters{
  request: PubSubRequestDto;
  producer: PubSubProducerPusher;
}

export interface IPubSubPublishEventService extends IServiceHandlerVoidAsync<IPubSubPublishEventServiceParameters>{}

@sealed
@Service()
export class PubSubPublishEventService implements IPubSubPublishEventService{
  public async handleAsync(params: IPubSubPublishEventServiceParameters): Promise<Result<undefined, ResultError>> {
    try
    {

      if(!params)
        return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'parameter is null');

      if(!params.request)
        return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'request is null');

      if(!params.producer)
        return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'producer is null');

      const {request,producer}=params

      // Consumer Call
      const pubSubMessage: PubSubMessagePusher<PubSubRequestDto> = {
        data:request,
        correlationId: Guid.create().toString(),
      };

      await producer.publishMessageAsync<PubSubRequestDto>(pubSubMessage);

      return new Ok(undefined);
    }
    catch(ex){
      const error=ex as Error;
      return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }



}
