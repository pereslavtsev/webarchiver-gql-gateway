import { Snapshot } from '../snapshots/models/snapshot.model';
import { plainToClass } from 'class-transformer';

type CdxResult = {
  snapshots: Snapshot[];
  resumeKey?: string;
};

export function convertCdxJsonToPlainObject(json: string[][]): CdxResult {
  const [keys, ...rows] = json;
  const [resumeKeyRow, emptyRow] = [...rows].reverse();
  const resumeKey =
    Array.isArray(emptyRow) && !emptyRow.length ? resumeKeyRow[0] : null;

  if (resumeKey) {
    rows.pop();
    rows.pop();
  }

  const snapshots = plainToClass(
    Snapshot,
    rows.map((row) =>
      Object.fromEntries(row.map((value, i) => [keys[i], value])),
    ),
  );

  return { snapshots, resumeKey };
}

export function transformFilterParams(params) {
  return Object.entries(params).map(([k, v]) => `${k.toLowerCase()}:${v}`);
}
