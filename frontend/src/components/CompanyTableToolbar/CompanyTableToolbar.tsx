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
import AddCompanyToCollectionToolbarButton from "./AddCompanyToCollectionToolbarButton";
import { TableSelectionContext } from "../../utils/contexts";
import SelectAllAcrossPagesAlert from "./SelectAllAcrossPagesAlert";

const CompanyTableToolbar = ({
  collectionsList,
}: {
  collectionsList: ICollection[];
}) => {
  const tableSelectionContext = useContext(TableSelectionContext);

  return (
    <GridToolbarContainer>
      <Stack
        divider={<Divider orientation="horizontal" flexItem />}
        alignItems={"stretch"}
        direction={"column"}
        sx={{ width: "100%" }}
      >
        <AddCompanyToCollectionToolbarButton
          selectionModel={tableSelectionContext?.selectionModel}
          pageSize={tableSelectionContext?.pageSize}
          total={tableSelectionContext?.total}
          collectionsList={collectionsList}
        />
        {
        ((tableSelectionContext?.selectionModel.length == tableSelectionContext?.pageSize )|| tableSelectionContext?.selectAllAcrossPages)
        && <SelectAllAcrossPagesAlert />
        }
      </Stack>
    </GridToolbarContainer>
  );
};

export default CompanyTableToolbar;
