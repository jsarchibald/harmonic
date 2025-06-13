import {
  GridToolbarContainer,
  useGridApiContext,
  useGridApiEventHandler,
} from "@mui/x-data-grid";
import { useContext } from "react";
import { ICollection } from "../../utils/jam-api";
import { Divider, Stack } from "@mui/material";
import AddCompanyToCollectionToolbarButton from "./AddCompanyToCollectionToolbarButton";
import { TableSelectionContext } from "../../utils/contexts";
import SelectAllAcrossPagesAlert from "./SelectAllAcrossPagesAlert";

const CompanyTableToolbar = ({
  collectionsList,
}: {
  collectionsList: ICollection[];
}) => {
  const companyTableContext = useContext(TableSelectionContext);

  // When the Select All button is set to false, set the toggle for selection across all pages
  const apiRef = useGridApiContext();
  useGridApiEventHandler(apiRef, "headerSelectionCheckboxChange", (event) => {
    if (!event.value) {
      companyTableContext.setSelectAllAcrossPages?.(false);
    }
  });

  return (
    <GridToolbarContainer>
      <Stack
        divider={<Divider orientation="horizontal" flexItem />}
        alignItems={"stretch"}
        direction={"column"}
        spacing={0.5}
        sx={{ width: "100%" }}
      >
        <AddCompanyToCollectionToolbarButton
          selectionModel={companyTableContext.selectionModel || []}
          collectionsList={collectionsList}
        />
        {((companyTableContext.selectionModel?.length ==
          companyTableContext?.pageSize &&
          companyTableContext?.selectionModel.length <
            companyTableContext?.total) ||
          companyTableContext?.selectAllAcrossPages) && (
          <SelectAllAcrossPagesAlert />
        )}
      </Stack>
    </GridToolbarContainer>
  );
};

export default CompanyTableToolbar;
