import { GridRowId } from "@mui/x-data-grid";
import { useContext, useState } from "react";
import {
  addCompaniesToCollection,
  checkBulkCompanyAdd,
  ICollection,
} from "../../utils/jam-api";
import {
  Box,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { TableSelectionContext } from "../../utils/contexts";

const CompanyToCollectionToolbarButton = ({
  selectionModel,
  pageSize,
  total,
  collectionsList,
}: {
  selectionModel: readonly GridRowId[];
  pageSize: number;
  total: number;
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
  const triggerBulkAdd = (
    collection: ICollection,
    selectedRows: readonly GridRowId[],
  ) => {
    // Start bulk operation
    addCompaniesToCollection(collection.id, selectedRows.map(Number))
      .then((response) => {
        const companies_queued = response.companies_queued;
        tableSelectionContext?.setSnackbarOpen(true);
        let message = `Adding ${companies_queued} compan${companies_queued == 1 ? "y" : "ies"} to ${collection.collection_name}.`;
        if (response.companies_queued > 10)
          message += " This might take a few minutes.";
        tableSelectionContext?.setSnackbarMessage(message);

        let repeat = setInterval(() => {
          checkBulkCompanyAdd(response.task_id).then((response) => {
            if (response.status == "SUCCESS") {
              tableSelectionContext?.setSnackbarOpen(true);
              let message = `Finished adding ${companies_queued} compan${companies_queued == 1 ? "y" : "ies"} to ${collection.collection_name}.`;
              tableSelectionContext?.setSnackbarMessage(message);

              clearInterval(repeat);
            }
          });
        }, 5000);
      })
      .catch((error) => {
        console.log(error);
        tableSelectionContext?.setSnackbarOpen(true);
        tableSelectionContext?.setSnackbarMessage(error.response.data.detail);
      });
  };

  console.log(pageSize, total, selectionModel.length);

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
                triggerBulkAdd(collection, selectionModel);
              }}
            >
              {collection.collection_name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      

  );
};

export default CompanyToCollectionToolbarButton;