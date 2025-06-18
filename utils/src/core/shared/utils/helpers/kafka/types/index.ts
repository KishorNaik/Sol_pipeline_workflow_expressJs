export interface PubSubMessageKafka<T> {
	data: T;
	correlationId?: string;
	timestamp?: string; // ISO 8601 format
}

export interface SenderReceiverMessageKafka<T> extends PubSubMessageKafka<T> {}
