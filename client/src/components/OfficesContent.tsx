import React, { useState, useEffect, useCallback } from "react";
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
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import { map, sortBy, keys } from "lodash";
import { Typography } from "@material-ui/core";

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

const ChairRatesTable = ({
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
            editable: "onAdd",
            initialEditValue: 1,
            editComponent: (props) => (
              <FormControl fullWidth>
                <InputLabel id={`specialist-${props.rowData.specialistId}`}>
                  Specialist
                </InputLabel>
                <Select
                  labelId={`specialist-${props.rowData.specialistId}`}
                  value={props.rowData.specialistId}
                  onChange={(e) => props.onChange(e.target.value)}
                  fullWidth
                >
                  <MenuItem value={1}>Dr. Patel</MenuItem>
                </Select>
              </FormControl>
            ),
            lookup: { 1: "Dr. Patel" },
          },
          { title: "Rate", field: "rate", type: "currency" },
          {
            title: "Updated On",
            field: "updatedDateUtc",
            editable: "never",
            type: "datetime",
          },
          { title: "Updated By", field: "updatedBy", editable: "never" },
        ]}
        data={() =>
          api.get(`office/${selectedOffice.id}/rates`).then((res) => res.data)
        }
        title={`Chair Rates for ${selectedOffice.name}`}
        style={{
          width: "100%",
          height: "100%",
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
          paging: false,
          draggable: false,
          sorting: false,
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

const IntegrationsTable = ({
  selectedOffice,
}: {
  selectedOffice: OfficeData;
}) => {
  const [vcitaClients, setVcitaClients] = useState<{
    [clientId: string]: string;
  }>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("integrations")
      .then((res) => setVcitaClients(res.data.vcitaClients))
      .finally(() => setLoading(false));
  }, [setLoading, setVcitaClients]);
  const onRowUpsert = useCallback(
    (r) =>
      api.put(`office/${selectedOffice.id}/integration`, {
        ...r,
        officeId: selectedOffice.id,
      }),
    [selectedOffice]
  );
  const menuItems = sortBy(
    map(keys(vcitaClients), (id: string) => ({
      id,
      link: vcitaClients[id],
    })),
    "link"
  );
  return loading ? (
    <Typography variant={"body1"}>Loading...</Typography>
  ) : (
    <MaterialTable
      columns={[
        {
          field: "integration",
          title: "Integration",
          editable: "onAdd",
          initialEditValue: 1,
          editComponent: (props) => (
            <FormControl fullWidth>
              <InputLabel id={`integration-${props.rowData.integration}`}>
                Integration
              </InputLabel>
              <Select
                labelId={`integration-${props.rowData.integration}`}
                value={props.rowData.integration}
                onChange={(e) => props.onChange(e.target.value)}
                fullWidth
              >
                <MenuItem value={1}>vCita</MenuItem>
              </Select>
            </FormControl>
          ),
          lookup: { 1: "vCita" },
        },
        {
          field: "link",
          title: "Link",
          render: (r) => (
            <Link href={r.url} target="_blank" rel="noopener">
              {vcitaClients[r.link]}
            </Link>
          ),
          initialEditValue: menuItems[0].id,
          editComponent: (props) => (
            <FormControl fullWidth>
              <InputLabel id={`integration-link-${props.rowData.link}`}>
                Link
              </InputLabel>
              <Select
                labelId={`integration-link-${props.rowData.link}`}
                value={props.rowData.link}
                onChange={(e) => props.onChange(e.target.value)}
                fullWidth
              >
                {map(menuItems, (mi, i) => (
                  <MenuItem value={mi.id} key={i}>
                    {mi.link}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ),
          lookup: vcitaClients,
        },
        { field: "url", hidden: true },
      ]}
      data={() =>
        api
          .get(`office/${selectedOffice.id}/integrations`)
          .then((res) => res.data)
      }
      title={`Integrations for ${selectedOffice.name}`}
      style={{
        width: "100%",
        height: "100%",
      }}
      icons={{
        Add: AddIcon as TableIcon,
        Check: CheckIcon as TableIcon,
        Clear: ClearIcon as TableIcon,
        Edit: EditIcon as TableIcon,
        Delete: DeleteIcon as TableIcon,
      }}
      options={{
        search: false,
        paging: false,
        draggable: false,
        sorting: false,
      }}
      localization={{
        header: {
          actions: "",
        },
      }}
      editable={{
        isEditable: () => true,
        isDeletable: () => true,
        onRowAdd: onRowUpsert,
        onRowUpdate: onRowUpsert,
        onRowDelete: (r) =>
          api.delete(
            `office/${selectedOffice.id}/integration/${r.integration}`
          ),
      }}
    />
  );
};

const OfficesTable = ({
  setSelectedOffice,
}: {
  setSelectedOffice: (s: OfficeData) => void;
}) => (
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
      draggable: false,
      sorting: false,
    }}
    actions={[
      (r) => ({
        icon: () => <VisibilityIcon />,
        tooltip: "View Details",
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
);

const OfficesContent = () => {
  const [selectedOffice, setSelectedOffice] = useState<OfficeData>();
  return selectedOffice ? (
    <Grid container>
      <Grid item xs={12}>
        <ChairRatesTable
          selectedOffice={selectedOffice}
          setSelectedOffice={setSelectedOffice}
        />
      </Grid>
      <Grid item xs={12}>
        <IntegrationsTable selectedOffice={selectedOffice} />
      </Grid>
    </Grid>
  ) : (
    <OfficesTable setSelectedOffice={setSelectedOffice} />
  );
};

export default OfficesContent;
