import { Response } from 'express';
import {
	Body,
	HttpCode,
	JsonController,
	OnUndefined,
	Post,
	Res,
	UseBefore,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import {
	RequestData,
	sealed,
	StatusCodes,
	DataResponse as ApiDataResponse,
	requestHandler,
	RequestHandler,
	DataResponseFactory,
	PipelineWorkflowException,
	PipelineWorkflow,
	Container,
  defineParallelSteps,
  defineParallelStep,
} from '@kishornaik/utils';
import { mediator } from '@/shared/utils/helpers/medaitR';
import { logger } from '@/shared/utils/helpers/loggers';
import { ValidationMiddleware } from '@/middlewares/security/validations';
import { FeaturePostRequestDto, FeaturePostResponseDto } from '../contracts';
import { SubService1 } from './services/subService1';
import { SubService2 } from './services/subService2';
import { SubService3 } from './services/subService3';
import { SubService4 } from './services/subService4';
import { SubService5 } from './services/subService5';
import { SubService6 } from './services/subService6';
import { SubService7 } from './services/subService7';

// #region Endpoint
@JsonController("/api/v1/demo")
@OpenAPI({ tags: [`demo`] })
export class FeaturePostEndpoint{
  @Post()
	@OpenAPI({
		summary: `pipeline workflow demo`,
		tags: [`demo`],
		description: `pipeline workflow demo`,
	})
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	@UseBefore(ValidationMiddleware(FeaturePostRequestDto))
  public async postAsync(@Body() request: FeaturePostRequestDto, @Res() res: Response){
    const response=await mediator.send(new FeaturePostCommand(request));
    return res.status(response.StatusCode).json(response);
  }
}
// endregion

// #region Command
@sealed
class FeaturePostCommand extends RequestData<ApiDataResponse<FeaturePostResponseDto>>{
  private readonly _request:FeaturePostRequestDto;

  public constructor(request:FeaturePostRequestDto){
    super();
    this._request = request;
  }

  public get request():FeaturePostRequestDto{
    return this._request;
  }
}
// #endregion

// pipeline enum
enum PipelineSteps{
  SubService1="SubService1",
  SubService2="SubService2",
  SubService3="SubService3",
  SubService4="SubService4",
  SubService5="SubService5",
  SubService6="SubService6",
  SubService7="SubService7",
}

// region Command Handler
@sealed
@requestHandler(FeaturePostCommand)
class FeaturePostCommandHandler implements RequestHandler<FeaturePostCommand,ApiDataResponse<FeaturePostResponseDto>>{

  private pipeline=new PipelineWorkflow(logger);
  private readonly _subService1:SubService1;
  private readonly _subService2:SubService2;
  private readonly _subService3:SubService3;
  private readonly _subService4:SubService4;
  private readonly _subService5:SubService5;
  private readonly _subService6:SubService6;
  private readonly _subService7:SubService7;

  public constructor(){
    this._subService1=Container.get(SubService1);
    this._subService2=Container.get(SubService2);
    this._subService3=Container.get(SubService3);
    this._subService4=Container.get(SubService4);
    this._subService5=Container.get(SubService5);
    this._subService6=Container.get(SubService6);
    this._subService7=Container.get(SubService7);
  }

  public async handle(value: FeaturePostCommand): Promise<ApiDataResponse<FeaturePostResponseDto>> {
    try
    {

      // Guard
      if(!value)
        return DataResponseFactory.error(StatusCodes.BAD_REQUEST, 'value is null');

      if(!value.request)
        return DataResponseFactory.error(StatusCodes.BAD_REQUEST, 'value.request is null');

      const {request}=value;

      // Sub Service 1
      await this.pipeline.step(PipelineSteps.SubService1, async () => {
        return await this._subService1.handleAsync(request);
      });

      // Sub Service 2
      await this.pipeline.step(PipelineSteps.SubService2,async ()=>{
        // Get result from previous step
        const result=this.pipeline.getResult<string>(PipelineSteps.SubService1);
        return await this._subService2.handleAsync(result);
      });

      // Sub Service 3
      await this.pipeline.step(PipelineSteps.SubService3,async ()=>{
        // Get result from previous step
        const result=this.pipeline.getResult<string>(PipelineSteps.SubService2);
        return await this._subService3.handleAsync(result);
      });

      // Sub Service 4 + Sub Service 5 (step parallel)
      await this.pipeline.stepParallel(
        defineParallelSteps(
          defineParallelStep(PipelineSteps.SubService4,async ()=>{
            // Get result from previous step
            const result=this.pipeline.getResult<string>(PipelineSteps.SubService3);
            return await this._subService4.handleAsync(result);
          }),
          defineParallelStep(PipelineSteps.SubService5,async ()=>{
            // Get result from previous step
            const result=this.pipeline.getResult<string>(PipelineSteps.SubService3);
            return await this._subService5.handleAsync(result);
          }),
        )
      )

      // Sub Service 6
      await this.pipeline.step(PipelineSteps.SubService6,async ()=>{
        // Get result from previous step
        const result=this.pipeline.getResult<string>(PipelineSteps.SubService4);
        return await this._subService6.handleAsync(result);
      });

      // Sub Service 7
      const response=await this.pipeline.step(PipelineSteps.SubService7,async ()=>{
        // Get result from previous step
        const result=this.pipeline.getResult<string>(PipelineSteps.SubService6);
        return await this._subService7.handleAsync(result);
      });

      return await DataResponseFactory.success<FeaturePostResponseDto>(StatusCodes.CREATED,response,);
    }
    catch(ex){
      return await DataResponseFactory.pipelineError<FeaturePostResponseDto>(ex);
    }
  }

}
// endregion
