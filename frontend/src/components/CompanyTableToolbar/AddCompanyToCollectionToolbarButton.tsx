import { GridRowId } from "@mui/x-data-grid";
import { useContext, useState } from "react";
import {
  addCompaniesToCollection,
  checkBulkCompanyAdd,
  ICollection,
} from "../../utils/jam-api";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { TableSelectionContext } from "../../utils/contexts";
import { NumberFormat } from "../../utils/formatting";

const AddCompanyToCollectionToolbarButton = ({
  selectionModel,
  collectionsList,
}: {
  selectionModel: readonly GridRowId[];
  collectionsList: ICollection[];
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const tableSelectionContext = useContext(TableSelectionContext);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /* Monitors the bulk addition of companies to a collection. */
  const monitorBulkAdd = (
    task_id: string,
    companies_queued_count: number,
    destination_collection: ICollection,
  ) => {
    let monitorLoop = setInterval(() => {
      checkBulkCompanyAdd(task_id).then((response) => {
        const progress = Math.floor(
          ((response.task_count - response.status_breakdown.PENDING) /
            response.task_count) *
            100,
        );
        tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarProgress: progress});

        if (response.status == "SUCCESS") {
          tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarOpen: true});
          let message = `Finished adding ${companies_queued_count} compan${companies_queued_count == 1 ? "y" : "ies"} to ${destination_collection.collection_name}.`;
          tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarMessage: message});
          tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarProgress: 100});

          clearInterval(monitorLoop);

          // An alternative to this is to set another state value that gets
          // passed to the snackbar, but the state is already getting a bit heavy.
          let closeSnackbar = setTimeout(() => {
            tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarOpen: false});;
          }, 5000);
          clearTimeout(closeSnackbar);
        }
      });
    }, 10000);
  };

  /* Triggers the bulk addition of companies to a destination. */
  const triggerBulkAdd = (destination_collection: ICollection) => {
    let company_ids: number[] = [];
    let source_collection_id = null;
    if (tableSelectionContext?.selectAllAcrossPages) {
      source_collection_id = tableSelectionContext?.selectedCollectionId;
    } else {
      company_ids = tableSelectionContext.selectionModel?.map(Number) || [];
    }

    addCompaniesToCollection(
      destination_collection.id,
      company_ids,
      source_collection_id,
    )
      .then((response) => {
        const companies_queued_count = response.companies_queued_count;
        tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarOpen: true});;

        let message = `Adding ${NumberFormat.format(companies_queued_count)} compan${companies_queued_count == 1 ? "y" : "ies"} to ${destination_collection.collection_name}.`;
        if (response.companies_queued_count > 10)
          message += " This might take a few minutes.";

        tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarMessage: message});
        tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarProgress: 0});

        monitorBulkAdd(
          response.task_id,
          companies_queued_count,
          destination_collection,
        );
      })
      .catch((error) => {
        tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarOpen: true});;
        tableSelectionContext.setSnackbarState?.({...tableSelectionContext.snackbarState, snackbarMessage: error.response.data.detail});
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
              collection.id != tableSelectionContext?.selectedCollectionId,
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
