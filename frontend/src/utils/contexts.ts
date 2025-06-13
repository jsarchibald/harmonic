import { GridRowId } from "@mui/x-data-grid";
import { createContext, Dispatch, SetStateAction } from "react";
import { ICollection } from "./jam-api";

export interface ITableSelectionContext {
  total: number;
  selectionModel: readonly GridRowId[];
  pageSize: number;
  collections: ICollection[];

  snackbarOpen: boolean;
  setSnackbarOpen:  Dispatch<SetStateAction<boolean>>;
  snackbarMessage: string;
  setSnackbarMessage: Dispatch<SetStateAction<string>>;

  selectAllAcrossPages: boolean;
  setSelectAllAcrossPages: Dispatch<SetStateAction<boolean>>;
}

export const TableSelectionContext = createContext(null);

