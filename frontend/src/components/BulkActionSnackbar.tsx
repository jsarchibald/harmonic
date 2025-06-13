import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import { TableSelectionContext } from "../utils/contexts";
import { useContext } from "react";
import { Close } from "@mui/icons-material";
import {
  CircularProgress,
  LinearProgress,
  SnackbarContent,
} from "@mui/material";

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

  // If snackbarContext?.snackbarProgress < 0, then it is disabled.
  // This avoids the need to maintain yet another state.
  const message = (
    <>
      {snackbarContext?.snackbarProgress >= 0 && (
        <CircularProgress variant="determinate" value={snackbarContext?.snackbarProgress} />
      )}
      {snackbarContext?.snackbarMessage}
    </>
  );

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
      // autoHideDuration={5000}
      onClose={handleClose}
      message={message}
      action={action}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      {/* <CircularProgress
          variant="determinate"
          value={50}
        /> */}
    </Snackbar>
  );
}
