import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import { TableSelectionContext } from "../utils/contexts";
import { useContext } from "react";
import { Close } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  LinearProgress,
  SnackbarContent,
  Stack,
} from "@mui/material";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

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
    <Stack direction={"row"}  spacing={2} alignItems={"center"}>
      {snackbarContext?.snackbarProgress >= 0 && (
        <CircularProgressWithLabel variant="determinate" value={snackbarContext?.snackbarProgress} size={"2rem"} />
      )}
      <Box>
      {snackbarContext?.snackbarMessage}
      </Box>
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
