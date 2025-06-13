import { GridRowId } from "@mui/x-data-grid";
import { createContext, Dispatch, SetStateAction } from "react";

export interface ITableSelectionContext {
  total: number;
  pageSize: number;
  selectedCollectionId: string;

  snackbarOpen: boolean;
  setSnackbarOpen?: Dispatch<SetStateAction<boolean>>;
  snackbarMessage: string;
  setSnackbarMessage?: Dispatch<SetStateAction<string>>;
  snackbarProgress: number;
  setSnackbarProgress?: Dispatch<SetStateAction<number>>;

  selectAllAcrossPages: boolean;
  setSelectAllAcrossPages?: Dispatch<SetStateAction<boolean>>;
  selectionModel?: readonly GridRowId[];
  setSelectionModel?: Dispatch<SetStateAction<readonly GridRowId[]>>;
}

export const TableSelectionContext = createContext<ITableSelectionContext>(
  {} as ITableSelectionContext,
);
