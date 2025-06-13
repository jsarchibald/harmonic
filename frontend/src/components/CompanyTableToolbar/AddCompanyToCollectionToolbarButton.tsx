import { GridRowId } from "@mui/x-data-grid";
import { FC, ReactNode, useContext, useState } from "react";
import {
  addCompaniesToCollection,
  getBulkCompanyAdditionStatus,
  ICollection,
} from "../../utils/jam-api";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { CompanyTableContext } from "../../utils/contexts";
import { NumberFormat } from "../../utils/formatting";
import RefreshTableButton from "./RefreshTableButton";

/* A toolbar button that allows the user to add selected companies to a collection. */
const AddCompanyToCollectionToolbarButton = ({
  selectionModel,
  collectionsList,
}: {
  selectionModel: readonly GridRowId[];
  collectionsList: ICollection[];
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const companyTableContext = useContext(CompanyTableContext);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /* This snackbar action button refreshes the Data Grid and closes the snackbar when clicked. */
  const refreshDataButton = (
    <Button
      onClick={() => {
        companyTableContext.setForceReload?.(!companyTableContext.forceReload);
        companyTableContext.setSnackbarState?.({
          ...companyTableContext.snackbarState,
          open: false,
        });
      }}
    >
      Refresh table
    </Button>
  );

  /* Monitors the bulk addition of companies to a collection. */
  const monitorBulkAdd = (
    task_id: string,
    companies_queued_count: number,
    destination_collection: ICollection,
  ) => {
    let monitorLoop = setInterval(() => {
      getBulkCompanyAdditionStatus(task_id).then((response) => {
        // If it succeeds or fails, alert the user
        if (response.status == "SUCCESS") {
          let message = `Finished adding ${companies_queued_count} compan${companies_queued_count == 1 ? "y" : "ies"} to ${destination_collection.collection_name}.`;
          companyTableContext.setSnackbarState?.({
            ...companyTableContext.snackbarState,
            message: message,
            progress: 100,
            open: true,
            autoHideDuration: 5000,
            additionalAction: refreshDataButton,
          });
          clearInterval(monitorLoop);
        } else if (response.status == "FAILURE") {
          let message = `Failed to add companies to ${destination_collection.collection_name}.`;
          companyTableContext.setSnackbarState?.({
            ...companyTableContext.snackbarState,
            message: message,
            showProgress: false,
            open: true,
            autoHideDuration: 5000,
            additionalAction: null,
          });
          clearInterval(monitorLoop);
        }

        // Update progress if still working
        else {
          const progress = Math.floor(
            ((response.task_count - response.status_breakdown.PENDING) /
              response.task_count) *
              100,
          );
          companyTableContext.setSnackbarState?.({
            ...companyTableContext.snackbarState,
            progress: progress,
            additionalAction: null,
          });
        }
      });
    }, 10000);
  };

  /* Triggers the bulk addition of companies to a destination. */
  const triggerBulkAdd = (destination_collection: ICollection) => {
    let company_ids: number[] = [];
    let source_collection_id = null;
    if (companyTableContext?.selectAllAcrossPages) {
      source_collection_id = companyTableContext?.selectedCollectionId;
    } else {
      company_ids = companyTableContext.selectionModel?.map(Number) || [];
    }

    addCompaniesToCollection(
      destination_collection.id,
      company_ids,
      source_collection_id,
    )
      .then((response) => {
        const companies_queued_count = response.companies_queued_count;
        let message = `Adding ${NumberFormat.format(companies_queued_count)} compan${companies_queued_count == 1 ? "y" : "ies"} to ${destination_collection.collection_name}.`;
        if (response.companies_queued_count > 10)
          message += " This might take a few minutes.";

        companyTableContext.setSnackbarState?.({
          ...companyTableContext.snackbarState,
          message: message,
          open: true,
          progress: 0,
          showProgress: true,
          autoHideDuration: null,
          additionalAction: null,
        });

        monitorBulkAdd(
          response.task_id,
          companies_queued_count,
          destination_collection,
        );
      })
      .catch((error) => {
        companyTableContext.setSnackbarState?.({
          ...companyTableContext.snackbarState,
          open: true,
          message: error.response.data.detail,
          autoHideDuration: 5000,
        });
      });
  };

  return (
    <Box alignItems={"flex-start"} textAlign={"left"}>
      <Button onClick={handleClick} disabled={selectionModel.length < 1}>
        Add to collection
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {collectionsList
          .filter(
            (collection) =>
              collection.id != companyTableContext?.selectedCollectionId,
          )
          .map((collection) => (
            <MenuItem
              key={`bulk_add_collection_menu_${collection.id}`}
              onClick={() => {
                triggerBulkAdd(collection);
              }}
            >
              {collection.collection_name}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};

export default AddCompanyToCollectionToolbarButton;
