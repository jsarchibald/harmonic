import { DataGrid, GridRowId } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getCollectionsById, ICollection, ICompany } from "../utils/jam-api";
import CompanyTableToolbar from "./CompanyTableToolbar";
import BulkActionSnackbar from "./BulkActionSnackbar";
import { SnackbarContext } from "../utils/contexts";

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

  useEffect(() => {
    getCollectionsById(props.selectedCollectionId, offset, pageSize).then(
      (newResponse) => {
        setResponse(newResponse.companies);
        setTotal(newResponse.total);
      },
    );
  }, [props.selectedCollectionId, offset, pageSize]);

  useEffect(() => {
    setOffset(0);
  }, [props.selectedCollectionId]);

  const [selectionModel, setSelectionModel] = useState<readonly GridRowId[]>(
    [],
  );

  return (
    total != undefined && (
      <SnackbarContext.Provider
        value={{
          open: snackbarOpen,
          setOpen: setSnackbarOpen,
          message: snackbarMessage,
          setMessage: setSnackbarMessage,
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
                  selectedIds={selectionModel}
                  collectionsList={
                    props.allCollections != undefined
                      ? props.allCollections
                      : []
                  }
                />
              ),
            }}
          />
          <BulkActionSnackbar />
        </div>
      </SnackbarContext.Provider>
    )
  );
};

export default CompanyTable;
