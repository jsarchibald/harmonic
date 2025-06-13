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
import { SnackbarContext } from "../../utils/contexts";

const CompanyToCollectionToolbarButton = ({
  selectedIds,
  pageSize,
  total,
  collectionsList,
}: {
  selectedIds: readonly GridRowId[];
  pageSize: number;
  total: number;
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
    addCompaniesToCollection(collection.id, selectedRows.map(Number))
      .then((response) => {
        const companies_queued = response.companies_queued;
        snackbarContext?.setOpen(true);
        let message = `Adding ${companies_queued} compan${companies_queued == 1 ? "y" : "ies"} to ${collection.collection_name}.`;
        if (response.companies_queued > 10)
          message += " This might take a few minutes.";
        snackbarContext?.setMessage(message);

        let repeat = setInterval(() => {
          checkBulkCompanyAdd(response.task_id).then((response) => {
            if (response.status == "SUCCESS") {
              snackbarContext?.setOpen(true);
              let message = `Finished adding ${companies_queued} compan${companies_queued == 1 ? "y" : "ies"} to ${collection.collection_name}.`;
              snackbarContext?.setMessage(message);

              clearInterval(repeat);
            }
          });
        }, 5000);
      })
      .catch((error) => {
        console.log(error);
        snackbarContext?.setOpen(true);
        snackbarContext?.setMessage(error.response.data.detail);
      });
  };

  console.log(pageSize, total, selectedIds.length);

  return (
    <Box alignItems={"flex-start"} textAlign={"left"}>
        <Button onClick={handleClick} disabled={selectedIds.length < 1}>
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
                triggerBulkAdd(collection, selectedIds);
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