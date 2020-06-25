import React, { useState, useCallback, ChangeEvent, useEffect } from "react";
import MaterialTable, { Column } from "material-table";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import NextPage from "@material-ui/icons/NavigateNext";
import PreviousPage from "@material-ui/icons/NavigateBefore";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import FilledInput from "@material-ui/core/FilledInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import { reject, find, sortBy, map } from "lodash";
import api from "../hooks/apiClient";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

type TableIcon = React.ForwardRefExoticComponent<
  React.RefAttributes<SVGSVGElement>
>;

type RowData = {
  office: string;
  [specialist: string]: string;
};

const AddOfficeDialog = ({
  onSuccess,
  open,
  closeDialog,
}: {
  onSuccess: (r: RowData) => void;
  open: boolean;
  closeDialog: () => void;
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const onSubmit = useCallback(
    () =>
      api
        .post("office", {
          name,
        })
        .then((res) => {
          onSuccess(res.data);
          closeDialog();
        })
        .catch((e) => setError(e.message)),
    [closeDialog, name, onSuccess]
  );
  return (
    <Dialog open={open} onClose={closeDialog}>
      <DialogTitle>Add Office</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          name="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        {error && <Typography variant={"body2"}>{error}</Typography>}
        <Button onClick={closeDialog} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const OfficesContent = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RowData[]>([]);
  const [specialists, setSpecialists] = useState<Column<RowData>[]>([]);
  const setRowData = useCallback(
    (rest: RowData[], other: RowData) =>
      setData(sortBy([...reject(rest, { id: other.id }), other], "office")),
    [setData]
  );
  const onInputChange = useCallback(
    (office, specialist) => (e: ChangeEvent<HTMLInputElement>) => {
      const row = find(data, { office });
      if (row) {
        setRowData(data, { ...row, [specialist]: e.target.value });
      }
    },
    [data, setRowData]
  );
  const onSuccess = useCallback((r: RowData) => setRowData(data, r), [
    setRowData,
    data,
  ]);
  const closeDialog = useCallback(() => setOpen(false), [setOpen]);
  const openDialog = useCallback(() => setOpen(true), [setOpen]);
  useEffect(() => {
    api
      .get("offices")
      .then((res) => {
        setSpecialists(res.data.specialists);
        setData(res.data.offices);
      })
      .catch()
      .finally(() => setLoading(false));
  }, [setLoading, setData, setSpecialists]);
  return (
    <>
      <MaterialTable
        columns={[
          { title: "Office", field: "office" },
          ...map(specialists, (s) => ({
            ...s,
            render: (rowData: RowData) => (
              <FormControl fullWidth variant="filled">
                <InputLabel htmlFor={`drPatel~${rowData.office}`}>
                  Amount
                </InputLabel>
                <FilledInput
                  id={`drPatel~${rowData.office}`}
                  value={rowData.drPatel}
                  onChange={onInputChange(rowData.office, "drPatel")}
                  startAdornment={
                    <InputAdornment position="start">$</InputAdornment>
                  }
                />
              </FormControl>
            ),
          })),
        ]}
        data={data}
        title="Chair Rates"
        style={{
          width: "100%",
        }}
        icons={{
          FirstPage: FirstPage as TableIcon,
          LastPage: LastPage as TableIcon,
          NextPage: NextPage as TableIcon,
          PreviousPage: PreviousPage as TableIcon,
        }}
        options={{
          search: false,
          pageSizeOptions: [5, 10],
        }}
        isLoading={loading}
        actions={[
          {
            icon: () => <AddIcon />,
            tooltip: "Add Office",
            isFreeAction: true,
            onClick: openDialog,
          },
          () => ({
            icon: () => <EditIcon />,
            tooltip: "Edit Office",
            onClick: () => {
              openDialog();
              // setDialogRowData(r);
            },
          }),
        ]}
        localization={{
          header: {
            actions: "",
          },
        }}
      />
      <AddOfficeDialog
        onSuccess={onSuccess}
        open={open}
        closeDialog={closeDialog}
      />
    </>
  );
};

export default OfficesContent;
