import { createContext, Dispatch, SetStateAction } from "react";

export interface ISnackbarContext {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
}

export const SnackbarContext = createContext(null);
