import winston from "winston";
import { DataResponse } from "../../../../models/response/data.Response";
import { PipelineWorkflowException } from "../exception";
import { StatusCodes } from "http-status-codes";
import { Result } from "neverthrow";
import { ResultError } from "../../../exceptions/results";

export class PipelineWorkflow{
  private readonly _logger:winston.Logger;
  private readonly _context = new Map<string, any>();

  public constructor(logger:winston.Logger){
    this._logger = logger;
  }

  public async step<TResult>(name:string, action:()=>Promise<Result<TResult,ResultError>>): Promise<TResult>{

    try
    {
      this._logger.info(`[Pipeline Step:START] step name: ${name}`);
      const result=await action();

      if(result.isOk()){
        const value=result.value;
        this._context?.set(name, value);
        this._logger.info(`[Pipeline Step:OK] step name: ${name}`);
        return value;
      }
      else
      {
        this._logger.error(`[Pipeline Step:ERROR] step name: ${name} || error message: ${result.error.message}`);
        throw new PipelineWorkflowException(false, result.error.statusCode, result.error.message);
      }
    }
    catch(ex){
      const error=ex as Error|PipelineWorkflowException;
      if(!(error instanceof PipelineWorkflowException)){
        this._logger.error(`[Pipeline Step:EXCEPTION] step name: ${name} || error message: ${error.message}`);
      }
      throw error;
    }
  }

  public getResult<TResult>(name:string): TResult {
    if (!this._context.has(name)) {
      throw new PipelineWorkflowException(false, StatusCodes.INTERNAL_SERVER_ERROR, `Step ${name} not found`);
    }

    return this?._context?.get(name) as TResult;
  }
}
