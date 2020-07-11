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
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import VisibilityIcon from "@material-ui/icons/Visibility";
import api from "../hooks/apiClient";
import { useUserId } from "../hooks/router";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import { map, sortBy, keys, keyBy, mapValues } from "lodash";
import { Typography } from "@material-ui/core";

type TableIcon = React.ForwardRefExoticComponent<
  React.RefAttributes<SVGSVGElement>
>;

type SpecialistData = {
  name: string;
  id: number;
  email: string;
};

const ChairRatesTable = ({
  selectedSpecialist,
  setSelectedSpecialist,
}: {
  selectedSpecialist: SpecialistData;
  setSelectedSpecialist: (o?: SpecialistData) => void;
}) => {
  const userId = useUserId();
  const [lookup, setLookup] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("offices")
      .then((res) => setLookup(sortBy(res.data.data, "name")))
      .finally(() => setLoading(false));
  }, [setLoading, setLookup]);

  return loading ? (
    <Typography variant={"body1"}>Loading...</Typography>
  ) : (
    <>
      <MaterialTable
        columns={[
          {
            title: "Office",
            field: "officeId",
            editable: "onAdd",
            initialEditValue: lookup[0]?.id,
            editComponent: (props) => (
              <FormControl fullWidth>
                <InputLabel id={`office-${props.rowData.officeId}`}>
                  Office
                </InputLabel>
                <Select
                  labelId={`office-${props.rowData.officeId}`}
                  value={props.rowData.officeId}
                  onChange={(e) => props.onChange(e.target.value)}
                  fullWidth
                >
                  {map(lookup, (l) => (
                    <MenuItem value={l.id}>{l.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ),
            lookup: mapValues(keyBy(lookup, "id"), "name"),
          },
          { title: "Rate", field: "rate", type: "currency" },
          {
            title: "Updated On",
            field: "updatedDateUtc",
            editable: "never",
            type: "datetime",
          },
          { title: "Updated By", field: "updatedBy", editable: "never" },
          { field: "latestDate", hidden: true },
        ]}
        data={() =>
          api
            .get(`specialist/${selectedSpecialist.id}/rates`)
            .then((res) => res.data)
        }
        title={`Chair Rates for ${selectedSpecialist.name}`}
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
          DetailPanel: KeyboardArrowRightIcon as TableIcon,
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
            onClick: () => setSelectedSpecialist(),
          },
        ]}
        editable={{
          isEditable: () => true,
          onRowAdd: (r) =>
            api.put(`specialist/${selectedSpecialist.id}/rates`, {
              ...r,
              updatedBy: userId,
            }),
          onRowUpdate: (r) =>
            api.put(`specialist/${selectedSpecialist.id}/rates`, {
              ...r,
              updatedBy: userId,
            }),
        }}
        localization={{
          header: {
            actions: "",
          },
        }}
        parentChildData={(row, rows) =>
          rows.find(
            (a) =>
              a.updatedDateUtc === row.latestDate &&
              row.updatedDateUtc !== row.latestDate &&
              a.officeId === row.officeId
          )
        }
      />
    </>
  );
};

const IntegrationsTable = ({
  selectedOffice,
}: {
  selectedOffice: SpecialistData;
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

const SpecialistsTable = ({
  setSelectedSpecialist,
}: {
  setSelectedSpecialist: (s: SpecialistData) => void;
}) => (
  <MaterialTable
    columns={[
      { field: "id", hidden: true },
      { title: "Name", field: "name" },
      { title: "Email", field: "email" },
    ]}
    data={() => api.get("specialists").then((res) => res.data)}
    title="Specialist Management"
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
        onClick: () => setSelectedSpecialist(r),
      }),
    ]}
    localization={{
      header: {
        actions: "",
      },
    }}
  />
);

const SpecialistsContent = () => {
  const [selectedSpecialist, setSelectedSpecialist] = useState<
    SpecialistData
  >();
  return selectedSpecialist ? (
    <Grid container>
      <Grid item xs={12}>
        <ChairRatesTable
          selectedSpecialist={selectedSpecialist}
          setSelectedSpecialist={setSelectedSpecialist}
        />
      </Grid>
      <Grid item xs={12}>
        <IntegrationsTable selectedOffice={selectedSpecialist} />
      </Grid>
    </Grid>
  ) : (
    <SpecialistsTable setSelectedSpecialist={setSelectedSpecialist} />
  );
};

export default SpecialistsContent;
