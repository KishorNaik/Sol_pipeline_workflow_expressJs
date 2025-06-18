export interface PubSubMessagePusher<T> {
	data: T;
	correlationId?: string;
	timestamp?: string; // ISO 8601 format
}
