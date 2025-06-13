import { Alert, Box, Divider, Link } from "@mui/material";
import { NumberFormat } from "../../utils/formatting";
import { useContext } from "react";
import { TableSelectionContext } from "../../utils/contexts";

const SelectAllAcrossPagesAlert = () => {
  const companyTableContext = useContext(TableSelectionContext);
  const total_formatted = NumberFormat.format(companyTableContext?.total);

  let preface,
    action = "";
  if (companyTableContext?.selectAllAcrossPages) {
    preface = `All ${total_formatted} companies in the collection are selected.`;
    action = `Clear selection.`;
  } else {
    preface = `All ${NumberFormat.format(companyTableContext?.pageSize)} companies on this page are selected.`;
    action = `Select all ${total_formatted} companies from all pages.`;
  }

  const toggleSelectAllAcrossPages = () => {
    if (companyTableContext?.selectAllAcrossPages) {
      companyTableContext.setSelectionModel?.([]);
    }
    companyTableContext.setSelectAllAcrossPages?.(
      !companyTableContext?.selectAllAcrossPages,
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
