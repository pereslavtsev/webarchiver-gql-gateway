import { Transform, Expose } from 'class-transformer';
import { DateTime } from 'luxon';
import { StatusCodes } from 'http-status-codes';
import { CDX_TIMESTAMP_FORMAT } from '../../cdx';

/**
 * Serialized CDX snapshot
 */
export class Snapshot {
  @Expose({ name: 'urlkey' })
  readonly urlKey!: string;
  @Expose({ name: 'original' })
  readonly originalUrl!: string;
  readonly timestamp!: string;
  readonly mimetype!: string;
  @Transform(({ value }) => +value)
  @Expose({ name: 'statuscode' })
  readonly statusCode!: StatusCodes;
  readonly digest!: string;
  @Transform(({ value }) => +value)
  readonly length!: number;

  /**
   * Parsed timestamp
   */
  get capturedAt() {
    return DateTime.fromFormat(this.timestamp, CDX_TIMESTAMP_FORMAT).toJSDate();
  }
}
