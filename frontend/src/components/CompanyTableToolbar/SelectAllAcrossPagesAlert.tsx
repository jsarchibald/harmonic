import { Alert, Box, Divider, Link } from "@mui/material";
import { NumberFormat } from "../../utils/numbers";
import { useContext } from "react";
import { TableSelectionContext } from "../../utils/contexts";

const SelectAllAcrossPagesAlert = () => {
  const tableSelectionContext = useContext(TableSelectionContext);
  console.log(tableSelectionContext?.selectAllAcrossPages);
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
    } else {
      // Since we won't be using the row IDs explicitly in the
      // select-all-across-pages case, we fill in the selection model
      // with dummy rows. This is generally consistent with how
      // MUI handles preserved state across pages via `keepNonExistentRowsSelected`:
      // https://mui.com/x/react-data-grid/row-selection/#usage-with-server-side-pagination
      // but it is a bit of a hack.
      const maxId = Math.max(
        ...tableSelectionContext?.selectionModel.map(Number),
      );
      const fakeIds = Array.from(
        {
          length:
            tableSelectionContext?.total - tableSelectionContext?.pageSize,
        },
        (_, i) => i + maxId + 1,
      );
      tableSelectionContext?.setSelectionModel(
        tableSelectionContext?.selectionModel.concat(fakeIds),
      );
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
