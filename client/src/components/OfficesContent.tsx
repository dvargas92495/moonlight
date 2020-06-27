import React, { useState } from "react";
import MaterialTable from "material-table";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import NextPage from "@material-ui/icons/NavigateNext";
import PreviousPage from "@material-ui/icons/NavigateBefore";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import VisibilityIcon from "@material-ui/icons/Visibility";
import api from "../hooks/apiClient";
import { useUserId } from "../hooks/router";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

type TableIcon = React.ForwardRefExoticComponent<
  React.RefAttributes<SVGSVGElement>
>;

type OfficeData = {
  name: string;
  id: number;
  taxId: string;
  contact: string;
  address: string;
};

const OfficeTable = ({
  selectedOffice,
  setSelectedOffice,
}: {
  selectedOffice: OfficeData;
  setSelectedOffice: (o?: OfficeData) => void;
}) => {
  const userId = useUserId();
  return (
    <>
      <MaterialTable
        columns={[
          {
            title: "Specialist",
            field: "specialistId",
            editComponent: (props) => (
              <FormControl fullWidth>
                <InputLabel id={`specialist-${props.rowData.specialistId}`}>
                  Specialist
                </InputLabel>
                <Select
                  labelId={`specialist-${props.rowData.specialistId}`}
                  id="demo-simple-select"
                  value={props.rowData.specialistId || 1}
                  onChange={(e) => props.onChange(e.target.value)}
                  fullWidth
                >
                  <MenuItem value={1}>Dr. Patel</MenuItem>
                  <MenuItem value={2}>Dr. Vargas</MenuItem>
                </Select>
              </FormControl>
            ),
          },
          { title: "Rate", field: "rate", render: (r) => `$${r.rate}` },
          { title: "Updated On", field: "updatedDateUtc", editable: "never" },
          { title: "Updated By", field: "updatedBy", editable: "never" },
        ]}
        data={() =>
          api.get(`office/${selectedOffice.id}/rates`).then((res) => res.data)
        }
        title={`Chair Rates for ${selectedOffice.name}`}
        style={{
          width: "100%",
        }}
        icons={{
          FirstPage: FirstPage as TableIcon,
          LastPage: LastPage as TableIcon,
          NextPage: NextPage as TableIcon,
          PreviousPage: PreviousPage as TableIcon,
          Add: AddIcon as TableIcon,
          Check: CheckIcon as TableIcon,
          Clear: ClearIcon as TableIcon,
          Edit: EditIcon as TableIcon,
          Delete: DeleteIcon as TableIcon,
        }}
        options={{
          search: false,
          pageSizeOptions: [5, 10],
        }}
        actions={[
          {
            icon: () => <ArrowBackIcon />,
            tooltip: "Back",
            isFreeAction: true,
            onClick: () => setSelectedOffice(),
          },
        ]}
        editable={{
          isEditable: () => true,
          onRowAdd: (r) =>
            api.put(`office/${selectedOffice.id}/rates`, {
              ...r,
              updatedBy: userId,
            }),
          onRowUpdate: (r) =>
            api.put(`office/${selectedOffice.id}/rates`, {
              ...r,
              updatedBy: userId,
            }),
        }}
        localization={{
          header: {
            actions: "",
          },
        }}
      />
    </>
  );
};

const OfficesTable = ({
  setSelectedOffice,
}: {
  setSelectedOffice: (s: OfficeData) => void;
}) => {
  return (
    <>
      <MaterialTable
        columns={[
          { field: "id", hidden: true },
          { title: "Name", field: "name" },
          { title: "Address", field: "address" },
          { title: "Tax Id", field: "taxId" },
          { title: "Contact", field: "contact" },
        ]}
        data={() => api.get("offices").then((res) => res.data)}
        title="Office Management"
        style={{
          width: "100%",
        }}
        icons={{
          FirstPage: FirstPage as TableIcon,
          LastPage: LastPage as TableIcon,
          NextPage: NextPage as TableIcon,
          PreviousPage: PreviousPage as TableIcon,
          Add: AddIcon as TableIcon,
          Check: CheckIcon as TableIcon,
          Clear: ClearIcon as TableIcon,
          Edit: EditIcon as TableIcon,
          Delete: DeleteIcon as TableIcon,
        }}
        options={{
          search: false,
          pageSizeOptions: [5, 10],
        }}
        actions={[
          (r) => ({
            icon: () => <VisibilityIcon />,
            tooltip: "View Rates",
            onClick: () => setSelectedOffice(r),
          }),
        ]}
        localization={{
          header: {
            actions: "",
          },
        }}
        editable={{
          isEditable: () => true,
          isDeletable: () => true,
          onRowAdd: (r) => api.post("office", r),
          onRowUpdate: (r) => api.put(`office/${r.id}`, r),
          onRowDelete: (r) => api.delete(`office/${r.id}`),
        }}
      />
    </>
  );
};

const OfficesContent = () => {
  const [selectedOffice, setSelectedOffice] = useState<OfficeData>();
  return selectedOffice ? (
    <OfficeTable
      selectedOffice={selectedOffice}
      setSelectedOffice={setSelectedOffice}
    />
  ) : (
    <OfficesTable setSelectedOffice={setSelectedOffice} />
  );
};

export default OfficesContent;
