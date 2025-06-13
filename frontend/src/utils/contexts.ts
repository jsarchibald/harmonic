import { GridRowId } from "@mui/x-data-grid";
import { createContext, Dispatch, SetStateAction } from "react";

export interface IBulkActionSnackbarState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarShowProgress: boolean;
  snackbarProgress: number;
  snackbarAction?: Node;
}

export interface ITableSelectionContext {
  total: number;
  pageSize: number;
  selectedCollectionId: string;

  snackbarState: IBulkActionSnackbarState;
  setSnackbarState?: Dispatch<SetStateAction<IBulkActionSnackbarState>>;

  selectAllAcrossPages: boolean;
  setSelectAllAcrossPages?: Dispatch<SetStateAction<boolean>>;
  selectionModel?: readonly GridRowId[];
  setSelectionModel?: Dispatch<SetStateAction<readonly GridRowId[]>>;
}

export const TableSelectionContext = createContext<ITableSelectionContext>(
  {} as ITableSelectionContext,
);
