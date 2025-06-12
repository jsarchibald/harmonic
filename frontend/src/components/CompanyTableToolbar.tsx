import {
  DataGrid,
  GridRowId,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarExport,
  useGridApiContext,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getCollectionsById, ICollection, ICompany } from "../utils/jam-api";
import { Button, Menu, MenuItem } from "@mui/material";

const CompanyToCollectionToolbarButton = ({
  selectedIds,
  collectionsList
}: {
  selectedIds: readonly GridRowId[];
  collectionsList: ICollection[]
}) => {
  const apiRef = useGridApiContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const triggerBulkAdd = (collection: ICollection, selectedRows: readonly GridRowId[]) => {
    console.log(`Add rows ${selectedRows} to collection ${collection.collection_name}`)
  }

  return (
    <>
      <Button onClick={handleClick}>Add to collection</Button>
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
        { collectionsList.map((collection) => <MenuItem key={`bulk_add_collection_menu_${collection.id}`} onClick={() => { triggerBulkAdd(collection, selectedIds) }}>{collection.collection_name}</MenuItem>) }
      </Menu>
    </>
  );
};

const CompanyTableToolbar = ({ selectedIds, collectionsList }: { selectedIds: any, collectionsList: ICollection[] }) => {
  return (
    <GridToolbarContainer>
      <CompanyToCollectionToolbarButton selectedIds={selectedIds} collectionsList={collectionsList} />
    </GridToolbarContainer>
  );
};

export default CompanyTableToolbar;
