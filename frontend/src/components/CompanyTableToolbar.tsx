import {
  DataGrid,
  GridRowId,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarExport,
  useGridApiContext,
} from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import {
  addCompaniesToCollection,
  checkBulkCompanyAdd,
  getCollectionsById,
  ICollection,
  ICompany,
} from "../utils/jam-api";
import { Button, Menu, MenuItem } from "@mui/material";
import { SnackbarContext } from "../utils/contexts";

const CompanyToCollectionToolbarButton = ({
  selectedIds,
  collectionsList,
}: {
  selectedIds: readonly GridRowId[];
  collectionsList: ICollection[];
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const snackbarContext = useContext(SnackbarContext);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const triggerBulkAdd = (
    collection: ICollection,
    selectedRows: readonly GridRowId[],
  ) => {
    

    // Start bulk operation
    addCompaniesToCollection(collection.id, selectedRows.map(Number)).then(
      (response) => {
        snackbarContext?.setOpen(true);
        let message = `Adding ${response.companies_queued} compan${response.companies_queued == 1 ? "y" : "ies"} to ${collection.collection_name}.`;
        if (response.companies_queued > 10)
          message += " This might take a few minutes.";
        snackbarContext?.setMessage(message);

        let repeat = setInterval(() => {
          checkBulkCompanyAdd(response.task_id).then(
            (response) => {
              if (response.status == "SUCCESS") {
                snackbarContext?.setOpen(true);
                let message = `Finished adding ${response.companies_queued} compan${response.companies_queued == 1 ? "y" : "ies"} to ${collection.collection_name}.`
                snackbarContext?.setMessage(message);

                clearInterval(repeat);
              }
            }
          )
        }, 5000)
      },
    ).catch((error) => {
      console.log(error)
      snackbarContext?.setOpen(true);
      snackbarContext?.setMessage(error.response.data.detail)
    });
  };

  return (
    <>
      <Button onClick={handleClick} disabled={selectedIds.length < 1}>Add to collection</Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        {collectionsList.map((collection) => (
          <MenuItem
            key={`bulk_add_collection_menu_${collection.id}`}
            onClick={() => {
              triggerBulkAdd(collection, selectedIds);
            }}
          >
            {collection.collection_name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const CompanyTableToolbar = ({
  selectedIds,
  collectionsList,
}: {
  selectedIds: any;
  collectionsList: ICollection[];
}) => {
  return (
    <GridToolbarContainer>
      <CompanyToCollectionToolbarButton
        selectedIds={selectedIds}
        collectionsList={collectionsList}
      />
    </GridToolbarContainer>
  );
};

export default CompanyTableToolbar;
