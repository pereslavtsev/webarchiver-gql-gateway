type CdxResult = {
  snapshots: Record<string, unknown>[];
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

  const snapshots = rows.map((row) =>
    Object.fromEntries(row.map((value, i) => [keys[i], value])),
  );

  return { snapshots, resumeKey };
}
