import { pusherRunner } from '@/shared/utils/helpers/pusher';
import { pubSubDemoEventListener } from './apps/features/v1/pubSubDemo';

export const consumerModules: Function[] = [];
pusherRunner.registerWorker(pubSubDemoEventListener);
