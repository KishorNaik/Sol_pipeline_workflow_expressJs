import { IsSafeString } from '@kishornaik/utils';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

// #region Request Dto
export class FeaturePostRequestDto {
	@IsString()
	@IsNotEmpty()
	@IsSafeString({ message: 'title must not contain HTML or JavaScript code' })
	@Length(2, 80, { message: 'title must be between 2 and 80 characters' })
	@Type(() => String)
	public title: string;

	@IsString()
	@IsNotEmpty()
	@IsSafeString({ message: 'description must not contain HTML or JavaScript code' })
	@Length(2, 300, { message: 'description must be between 2 and 300 characters' })
	@Type(() => String)
	public description: string;
}
// #endregion

// #region Response Dto
export class FeaturePostResponseDto {
	public message: string;
}
// #endregion
