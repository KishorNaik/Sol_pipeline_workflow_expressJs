import { DtoValidation, sealed } from "@kishornaik/utils";
import { Service } from "typedi";
import { PubSubRequestDto } from "../../../contracts";

@sealed
@Service()
export class PubSubRequestValidationService extends DtoValidation<PubSubRequestDto> {
	public constructor() {
		super();
	}
}
