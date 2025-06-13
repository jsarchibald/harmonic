import {
  GridFooterContainer,
  GridPagination,
  GridSelectedRowCount,
} from "@mui/x-data-grid";
import { useContext } from "react";
import { CompanyTableContext } from "../utils/contexts";

/* Custom footer for CompanyTable DataGrid, overriding the select count when all pages are selectd. */
const CompanyTableFooter = () => {
  const companyTableContext = useContext(CompanyTableContext);

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
