export interface FetchSnapshotsParams {
  url: string;
  from?: string | number;
  to?: string | number;
  resumeKey?: string;
  filter?: {
    urlKey?: string;
    timestamp?: number;
    original?: string;
    mimetype?: string;
    statusCode?: number;
    digest?: string;
    length?: number;
  };
}
