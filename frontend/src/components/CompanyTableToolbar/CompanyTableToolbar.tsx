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
import { TableSelectionContext } from "../../utils/contexts";

const CompanyTableToolbar = ({
  collectionsList,
}: {
  collectionsList: ICollection[];
}) => {
  const tableSelectionContext = useContext(TableSelectionContext);

  const selectAllAcrossPagesAlert = (
    <Box>
      <Alert severity="info">
        All {tableSelectionContext?.selectionModel.length} companies on this page are selected.{" "}
        <Link component="button" sx={{ fontWeight: "bold" }}>
          Select all {NumberFormat.format(tableSelectionContext?.total)} from all pages.
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
          selectionModel={tableSelectionContext?.selectionModel}
          pageSize={tableSelectionContext?.pageSize}
          total={tableSelectionContext?.total}
          collectionsList={collectionsList}
        />
        {tableSelectionContext?.selectionModel.length == tableSelectionContext?.pageSize &&
        tableSelectionContext?.selectionModel.length < tableSelectionContext?.total &&
        selectAllAcrossPagesAlert}
      </Stack>
    </GridToolbarContainer>
  );
};

export default CompanyTableToolbar;
