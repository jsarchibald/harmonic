import { DataGrid, GridRowId, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getCollectionsById, ICollection, ICompany } from "../utils/jam-api";
import CompanyTableToolbar from "./CompanyTableToolbar/CompanyTableToolbar";
import BulkActionSnackbar from "./BulkActionSnackbar";
import {
  TableSelectionContext,
  tableSelectionContext,
} from "../utils/contexts";
import CompanyTableFooter from "./CompanyTableToolbar/CompanyTableFooter";

const CompanyTable = (props: {
  selectedCollectionId: string;
  allCollections?: ICollection[];
}) => {
  const [response, setResponse] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>();
  const [offset, setOffset] = useState<number>(0);
  const [pageSize, setPageSize] = useState(25);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const [selectionModel, setSelectionModel] = useState<readonly GridRowId[]>(
    [],
  );

  useEffect(() => {
    getCollectionsById(props.selectedCollectionId, offset, pageSize).then(
      (newResponse) => {
        setResponse(newResponse.companies);
        setTotal(newResponse.total);

        // Clear selection when new data load (e.g. next page or different collection)
        setSelectAllAcrossPages(false);
        setSelectionModel([])
      },
    );
  }, [props.selectedCollectionId, offset, pageSize]);

  useEffect(() => {
    setOffset(0);
  }, [props.selectedCollectionId]);

  return (
    total != undefined && (
      <TableSelectionContext.Provider
        value={{
          snackbarOpen,
          setSnackbarOpen,
          snackbarMessage,
          setSnackbarMessage,
          total,
          pageSize,
          selectionModel,
          setSelectionModel,
          selectAllAcrossPages,
          setSelectAllAcrossPages,
        }}
      >
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={response}
            rowHeight={30}
            columns={[
              { field: "liked", headerName: "Liked", width: 90 },
              { field: "id", headerName: "ID", width: 90 },
              { field: "company_name", headerName: "Company Name", width: 200 },
            ]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 25 },
              },
            }}
            rowCount={total}
            pagination
            checkboxSelection
            keepNonExistentRowsSelected
            paginationMode="server"
            onPaginationModelChange={(newMeta) => {
              setPageSize(newMeta.pageSize);
              setOffset(newMeta.page * newMeta.pageSize);
            }}
            onRowSelectionModelChange={(newSelection) => {
              setSelectionModel(newSelection);
            }}
            rowSelectionModel={selectionModel}
            slots={{
              toolbar: () => (
                <CompanyTableToolbar
                  collectionsList={
                    props.allCollections != undefined
                      ? props.allCollections
                      : []
                  }
                />
              ),

              footer: () => <CompanyTableFooter />,
            }}
          />
          <BulkActionSnackbar />
        </div>
      </TableSelectionContext.Provider>
    )
  );
};

export default CompanyTable;
