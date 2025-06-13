import Button from "@mui/material/Button";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import { SnackbarContext } from "../utils/contexts";
import { useContext } from "react";
import { Icon } from "@mui/material";
import { Close } from "@mui/icons-material";

export default function BulkActionSnackbar() {
  const snackbarContext = useContext(SnackbarContext);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    if (snackbarContext?.setOpen !== undefined) {
      snackbarContext?.setOpen(false);
    }
  };

  const action = (
    <>
      <Button color="secondary" size="small" onClick={handleClose}>
        Monitor
      </Button>
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
      open={snackbarContext?.open}
      autoHideDuration={5000}
      onClose={handleClose}
      message={snackbarContext?.message}
      action={action}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    />
  );
}
