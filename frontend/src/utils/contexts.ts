import { GridRowId } from "@mui/x-data-grid";
import { createContext, Dispatch, SetStateAction } from "react";
import { ICollection } from "./jam-api";

// export interface ISnackbarContext {
//   open: boolean;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   message: string;
//   setMessage: Dispatch<SetStateAction<string>>;
// }

// export const SnackbarContext = createContext(null);

export interface ITableSelectionContext {
  total: number;
  selectionModel: readonly GridRowId[];
  pageSize: number;
  collections: ICollection[];

  snackbarOpen: boolean;
  setSnackbarOpen:  Dispatch<SetStateAction<boolean>>;
  snackbarMessage: string;
  setSnackbarMessage: Dispatch<SetStateAction<string>>;
}

export const TableSelectionContext = createContext(null);

