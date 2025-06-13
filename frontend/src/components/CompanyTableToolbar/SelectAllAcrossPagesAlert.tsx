import { Alert, Box, Divider, Link } from "@mui/material";
import { NumberFormat } from "../../utils/numbers";
import { useContext } from "react";
import { TableSelectionContext } from "../../utils/contexts";

const SelectAllAcrossPagesAlert = () => {
  const tableSelectionContext = useContext(TableSelectionContext);
  const total_formatted = NumberFormat.format(tableSelectionContext?.total);

  let preface,
    action = "";
  if (tableSelectionContext?.selectAllAcrossPages) {
    preface = `All ${total_formatted} companies in the collection are selected.`;
    action = `Clear selection.`;
  } else {
    preface = `All ${NumberFormat.format(tableSelectionContext?.pageSize)} companies on this page are selected.`;
    action = `Select all ${total_formatted} companies from all pages.`;
  }

  const toggleSelectAllAcrossPages = () => {
    if (tableSelectionContext?.selectAllAcrossPages) {
      tableSelectionContext?.setSelectionModel([]);
    }
    tableSelectionContext?.setSelectAllAcrossPages(
      !tableSelectionContext?.selectAllAcrossPages,
    );
  };

  return (
    <Box>
      <Alert severity="info">
        {preface}{" "}
        <Link
          component="button"
          sx={{ fontWeight: "bold" }}
          onClick={toggleSelectAllAcrossPages}
        >
          {action}
        </Link>
      </Alert>
      <Divider orientation="horizontal" flexItem />
    </Box>
  );
};

export default SelectAllAcrossPagesAlert;
