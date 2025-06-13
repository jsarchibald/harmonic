import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import { CompanyTableContext } from "../utils/contexts";
import { useContext } from "react";
import { Close } from "@mui/icons-material";
import { Box, Stack } from "@mui/material";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

/* A snackbar showing information relevant to bulk actions. */
export default function BulkActionSnackbar() {
  const companyTableContext = useContext(CompanyTableContext);

  const handleClose = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    companyTableContext.setSnackbarState?.({...companyTableContext.snackbarState, open: false});;
  };

  // If snackbarContext?.progress < 0, then it is disabled.
  // This avoids the need to maintain yet another state.
  const message = (
    <Stack direction={"row"} spacing={2} alignItems={"center"}>
      {companyTableContext.snackbarState.showProgress && (
        <CircularProgressWithLabel
          variant="determinate"
          value={companyTableContext.snackbarState.progress}
        />
      )}
      <Box>{companyTableContext.snackbarState.message}</Box>
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
      open={companyTableContext.snackbarState.open}
      onClose={handleClose}
      message={message}
      // autoHideDuration={companyTableContext.snackbarState.autoHideDuration}
      action={action}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    ></Snackbar>
  );
}
