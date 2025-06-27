import { describe, it } from 'node:test';
import request from 'supertest';
import expect from 'expect';
import { faker } from '@faker-js/faker';
import { ValidateEnv } from '@kishornaik/utils';
import { App } from '@/app';
import { modulesFederation } from '@/modules/app.Module';
import { FeaturePostRequestDto } from '@/modules/demo/apps/features/v1/featurePost/contracts';

process.env.NODE_ENV = 'development';
ValidateEnv();

const appInstance = new App([...modulesFederation]);
const app = appInstance.getServer();

describe(`Demo-Integration-Test`, () => {
	//node --trace-deprecation --test --test-name-pattern='should_return_true_when_all_pipeline_steps_run_successfully' --require ts-node/register -r tsconfig-paths/register ./src/modules/demo/tests/integration/features/v1/featurePost/index.test.ts
	it(`should_return_true_when_all_pipeline_steps_run_successfully`, async () => {
		const requestBody = new FeaturePostRequestDto();
		requestBody.title = faker.name.jobTitle();
		requestBody.description = faker.name.jobDescriptor();

		const response = await request(app).post('/api/v1/demo').send(requestBody);
		expect(response.body.Success).toBe(true);
		expect(response.statusCode).toBe(201);
	});
});
