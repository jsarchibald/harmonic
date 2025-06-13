import { GridRowId, GridToolbarContainer } from "@mui/x-data-grid";
import { useContext, useState } from "react";
import {
  ICollection,
} from "../../utils/jam-api";
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
import { NumberFormat } from "../../utils/numbers";
import CompanyToCollectionToolbarButton from "./CompanyToCollectionToolbarButton";

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
    <GridToolbarContainer>
      <Stack
        divider={<Divider orientation="horizontal" flexItem />}
        alignItems={"stretch"}
        direction={"column"}
        sx={{ width: "100%" }}
      >

        <CompanyToCollectionToolbarButton
          selectedIds={selectedIds}
          pageSize={pageSize}
          total={total}
          collectionsList={collectionsList}
        />
        {selectedIds.length == pageSize &&
        selectedIds.length < total &&
        selectAllAcrossPagesAlert}
      </Stack>
    </GridToolbarContainer>
  );
};

export default CompanyTableToolbar;
