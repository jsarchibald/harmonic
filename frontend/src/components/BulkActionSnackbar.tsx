import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import { TableSelectionContext } from "../utils/contexts";
import { useContext } from "react";
import { Close } from "@mui/icons-material";

export default function BulkActionSnackbar() {
  const snackbarContext = useContext(TableSelectionContext);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    if (snackbarContext?.setSnackbarOpen !== undefined) {
      snackbarContext?.setSnackbarOpen(false);
    }
  };

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <Close />
      </IconButton>
    </>
  );

  return (
    <Snackbar
      open={snackbarContext?.snackbarOpen}
      autoHideDuration={5000}
      onClose={handleClose}
      message={snackbarContext?.snackbarMessage}
      action={action}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    />
  );
}
