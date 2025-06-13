import { GridRowId } from "@mui/x-data-grid";
import { createContext, Dispatch, SetStateAction } from "react";
import { ICollection } from "./jam-api";

export interface ITableSelectionContext {
  total: number;
  pageSize: number;
  collections: ICollection[];
  selectedCollectionId: string;

  snackbarOpen: boolean;
  setSnackbarOpen: Dispatch<SetStateAction<boolean>>;
  snackbarMessage: string;
  setSnackbarMessage: Dispatch<SetStateAction<string>>;

  selectAllAcrossPages: boolean;
  setSelectAllAcrossPages: Dispatch<SetStateAction<boolean>>;
  selectionModel: readonly GridRowId[];
  setSelectionModel: Dispatch<SetStateAction<GridRowId>>;
}

export const TableSelectionContext = createContext(null);
