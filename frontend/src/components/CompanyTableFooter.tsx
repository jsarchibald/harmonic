import {
  GridFooterContainer,
  GridPagination,
  GridSelectedRowCount,
} from "@mui/x-data-grid";
import { useContext } from "react";
import { TableSelectionContext } from "../utils/contexts";

const CompanyTableFooter = () => {
  const companyTableContext = useContext(TableSelectionContext);

  const selectedRowCount = companyTableContext?.selectAllAcrossPages
    ? companyTableContext.total
    : companyTableContext.selectionModel?.length || 0;
  return (
    <GridFooterContainer>
      <GridSelectedRowCount selectedRowCount={selectedRowCount} />
      <GridPagination />
    </GridFooterContainer>
  );
};

export default CompanyTableFooter;
