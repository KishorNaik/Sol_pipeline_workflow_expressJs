import 'reflect-metadata';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@/config/env';
import { ErrorMiddleware } from '@/middlewares/exception';
import { logger, stream } from '@/shared/utils/helpers/loggers';
import actuator from 'express-actuator';
import { rateLimitMiddleware } from './middlewares/security/rateLimit';
import traceMiddleware from './middlewares/loggers/trace';
import httpLoggerMiddleware from './middlewares/loggers/http';
import { BullMqRunner, RabbitMqRunner, KafkaRunner, PusherRunner } from '@kishornaik/utils';
import { ipTrackerMiddleware } from './middlewares/security/ipTracker';
import { throttlingMiddleware } from './middlewares/security/throttling';

export class App {
	public app: express.Application;
	public env: string;
	public port: string | number;
	private _initializeDatabase: Function;
	private _bullMqRunner: BullMqRunner | undefined;
	private _rabbitMqRunner: RabbitMqRunner | undefined;
	private _kafkaRunner: KafkaRunner | undefined;
	private _pusherRunner: PusherRunner | undefined;

	constructor(Controllers: Function[]) {
		this.app = express();
		this.env = NODE_ENV || 'development';
		this.port = PORT || 3000;

		this.initializeMiddlewares();
		this.initializeRoutes(Controllers);
		this.initializeSwagger(Controllers);
		this.initializeErrorHandling();
	}

	public initializeDatabase(init?: Function | undefined) {
		console.log('testDB Function init');
		this._initializeDatabase = init;
		return this;
	}

	public runBullMqWorker(bullMqRunner: BullMqRunner) {
		this._bullMqRunner = bullMqRunner;
		return this;
	}

	public runRabbitMqWorker(rabbitMqRunner: RabbitMqRunner) {
		this._rabbitMqRunner = rabbitMqRunner;
		return this;
	}

	public runKafkaWorker(kafkaRunner: KafkaRunner) {
		this._kafkaRunner = kafkaRunner;
		return this;
	}

	public runPusherWorker(pusherRunner: PusherRunner) {
		this._pusherRunner = pusherRunner;
		return this;
	}

	public listen() {
		this.app.listen(this.port, async () => {
			logger.info(`=================================`);
			logger.info(`======= ENV: ${this.env} =======`);
			logger.info(`🚀 App listening on the port ${this.port}`);
			logger.info(`=================================`);

			await this.executeDatabase();
			await this.executeBullMqWorker();
			await this.executeRabbitMqWorker();
			await this.executeKafkaWorker();
			await this.executePusherWorker();

			logger.info(`=== Server Started. Good to go ===`);
			logger.info(`===🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀===`);
		});
	}

	public getServer() {
		return this.app;
	}

	private initializeMiddlewares() {
		this.app.set('trust proxy', true); // trust first proxy for rate limiting
		this.app.use(httpLoggerMiddleware);
		this.app.use(hpp());
		this.app.use(helmet());
		this.app.use(compression());
		this.app.use(express.json({ limit: '50mb' }));
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(cookieParser());
		this.app.use(actuator());
		this.app.use(rateLimitMiddleware);
		this.app.use(traceMiddleware);
		this.app.use(throttlingMiddleware);
		this.app.use(ipTrackerMiddleware);

		logger.info(`======= initialized middlewares =======`);
	}

	private initializeRoutes(controllers: Function[]) {
		useExpressServer(this.app, {
			cors: {
				origin: ORIGIN,
				credentials: CREDENTIALS,
			},
			controllers: controllers,
			defaultErrorHandler: false,
		});
		logger.info(`======= initialized routes =======`);
	}

	private initializeSwagger(controllers: Function[]) {
		const schemas = validationMetadatasToSchemas({
			classTransformerMetadataStorage: defaultMetadataStorage,
			refPointerPrefix: '#/components/schemas/',
		});

		const routingControllersOptions = {
			controllers: controllers,
		};

		const storage = getMetadataArgsStorage();
		const spec = routingControllersToSpec(storage, routingControllersOptions, {
			components: {
				schemas: schemas as { [schema: string]: any },
				securitySchemes: {
					// basicAuth: {
					//   scheme: 'basic',
					//   type: 'http',
					// },
					BearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
						in: 'header',
					},
				},
			},
			security: [
				{
					BearerAuth: [],
				},
			],
			info: {
				description: 'Generated with `routing-controllers-openapi`',
				title: 'A sample API',
				version: '1.0.0',
			},
		});
		//console.log(JSON.stringify(spec));
		this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
		logger.info(`======= initialized swagger =======`);
	}

	private initializeErrorHandling() {
		this.app.use(ErrorMiddleware);
		logger.info(`======= initialized error handling =======`);
	}

	private async executeDatabase(): Promise<void> {
		if (this._initializeDatabase) {
			await this._initializeDatabase();
			logger.info(`======= initialized database =======`);
		}
	}

	private async executeBullMqWorker(): Promise<void> {
		if (this?._bullMqRunner) {
			if (this._bullMqRunner.count >= 1) {
				await this._bullMqRunner.runWorkers();
				logger.info(`======= initialized BullMQ workers =======`);
			}
		}
	}

	private async executeRabbitMqWorker(): Promise<void> {
		if (this?._rabbitMqRunner) {
			if (this._rabbitMqRunner.count >= 1) {
				await this._rabbitMqRunner.runWorkers();
				logger.info(`======= initialized RabbitMQ workers =======`);
			}
		}
	}

	private async executeKafkaWorker(): Promise<void> {
		if (this?._kafkaRunner) {
			if (this._kafkaRunner.count >= 1) {
				await this._kafkaRunner.runWorkers();
				logger.info(`======= initialized Kafka workers =======`);
			}
		}
	}

	private async executePusherWorker(): Promise<void> {
		if (this?._pusherRunner) {
			if (this._pusherRunner.count >= 1) {
				await this._pusherRunner.runWorkers();
				logger.info(`======= initialized Pusher workers =======`);
			}
		}
	}
}
