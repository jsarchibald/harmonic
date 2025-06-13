import { GridRowId } from "@mui/x-data-grid";
import { createContext, Dispatch, SetStateAction } from "react";

/* The state of the Bulk Action snackbar */
export interface IBulkActionSnackbarState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarShowProgress: boolean;
  snackbarProgress: number;
  snackbarAdditionalAction?: Node;
}

/* The context containing the high-level state of the CompanyTable. */
export interface ICompanyTableContext {
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

export const CompanyTableContext = createContext<ICompanyTableContext>(
  {} as ICompanyTableContext,
);
