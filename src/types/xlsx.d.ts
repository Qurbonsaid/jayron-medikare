declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }

  export interface WorkSheet {
    [cell: string]: CellObject;
  }

  export interface CellObject {
    v?: string | number | boolean | Date;
    t?: string;
    w?: string;
  }

  export function read(
    data: ArrayBuffer | string,
    opts?: Record<string, unknown>
  ): WorkBook;
  export const utils: {
    sheet_to_json: <T = Record<string, unknown>>(
      worksheet: WorkSheet,
      opts?: Record<string, unknown>
    ) => T[];
  };
}
