import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import { TableSelectionContext } from "../utils/contexts";
import { useContext } from "react";
import { Close } from "@mui/icons-material";
import { Box, Stack } from "@mui/material";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

export default function BulkActionSnackbar() {
  const snackbarContext = useContext(TableSelectionContext);

  const handleClose = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    snackbarContext.setSnackbarState?.({...companyTableContext.snackbarState, snackbarOpen: false});;
  };

  // If snackbarContext?.snackbarProgress < 0, then it is disabled.
  // This avoids the need to maintain yet another state.
  const message = (
    <Stack direction={"row"} spacing={2} alignItems={"center"}>
      {snackbarContext?.snackbarProgress >= 0 && (
        <CircularProgressWithLabel
          variant="determinate"
          value={snackbarContext?.snackbarProgress}
        />
      )}
      <Box>{snackbarContext?.snackbarMessage}</Box>
    </Stack>
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
      onClose={handleClose}
      message={message}
      action={action}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    ></Snackbar>
  );
}
