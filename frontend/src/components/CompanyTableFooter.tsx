import {
  GridFooterContainer,
  GridPagination,
  GridSelectedRowCount,
} from "@mui/x-data-grid";
import { useContext } from "react";
import { TableSelectionContext } from "../utils/contexts";

const CompanyTableFooter = () => {
  const tableSelectionContext = useContext(TableSelectionContext);

  const selectedRowCount = tableSelectionContext?.selectAllAcrossPages
    ? tableSelectionContext.total
    : tableSelectionContext.selectionModel?.length || 0;
  return (
    <GridFooterContainer>
      <GridSelectedRowCount selectedRowCount={selectedRowCount} />
      <GridPagination />
    </GridFooterContainer>
  );
};

export default CompanyTableFooter;
