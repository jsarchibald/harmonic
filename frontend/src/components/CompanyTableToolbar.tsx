import { GridRowId, GridToolbarContainer } from "@mui/x-data-grid";
import { useContext, useState } from "react";
import {
  addCompaniesToCollection,
  checkBulkCompanyAdd,
  ICollection,
} from "../utils/jam-api";
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { SnackbarContext } from "../utils/contexts";
import { NumberFormat } from "../utils/numbers";

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

  const selectAllAcrossPagesAlert = (
    <Box>
      <Alert severity="info">
        All {selectedIds.length} companies on this page are selected.{" "}
        <Link component="button" sx={{ fontWeight: "bold" }}>
          Select all {NumberFormat.format(total)} from all pages.
        </Link>
      </Alert>
      <Divider orientation="horizontal" flexItem />
    </Box>
  );

  return (
    <Stack
      divider={<Divider orientation="horizontal" flexItem />}
      alignItems={"stretch"}
      direction={"column"}
      sx={{ width: "100%" }}
    >
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
      {selectedIds.length == pageSize &&
        selectedIds.length < total &&
        selectAllAcrossPagesAlert}
    </Stack>
  );
};

const CompanyTableToolbar = ({
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
  return (
    <GridToolbarContainer>
      <CompanyToCollectionToolbarButton
        selectedIds={selectedIds}
        pageSize={pageSize}
        total={total}
        collectionsList={collectionsList}
      />
    </GridToolbarContainer>
  );
};

export default CompanyTableToolbar;
