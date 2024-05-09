import * as XLSX from 'xlsx';

export type AlertMessageType = {
  type: 'info' | 'warning' | 'error';
  message: string;
}

export type LoadedFilesType = {
  [md5: string]: FileItemType;
};

export type FileItemType = {
  isLoading?: boolean;
  filename: string;
  md5: string;
  sheetCount?: number;
  modifiedDate?: Date;
};

export type SheetListItemType = {
  filename: string;
  sheetname: string;
  md5: string;
};

export type SheetDataType = {
  filename: string;
  md5: string;
  sheetname: string;
  modifiedDate: Date | undefined;
  sheet: XLSX.Sheet;
};

export type DiffListItemType = {
  filename: string;
  md5: string;
  sheetname: string;
  modifiedDate: Date | undefined;
  compare?: {
    filename: string;
    md5: string;
    sheetname: string;
    modifiedDate?: Date;
  };
};

export type DiffInfoType = {
  [sheetname: string]: {
    hasCompareSheet?: boolean;
    diffCount?: number;
    diffItems?: {
      [key: string | number]: {
        isNotHave?: boolean;
      };
    };
  };
};
