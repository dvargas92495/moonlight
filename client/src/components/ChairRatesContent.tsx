import React, { useState, useCallback, ChangeEvent } from "react";
import MaterialTable from "material-table";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import NextPage from "@material-ui/icons/NavigateNext";
import PreviousPage from "@material-ui/icons/NavigateBefore";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import FilledInput from "@material-ui/core/FilledInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import { reject, find, sortBy, map } from "lodash";

type TableIcon = React.ForwardRefExoticComponent<
  React.RefAttributes<SVGSVGElement>
>;

type RowData = {
  office: string;
  [specialist: string]: string;
};

const specialists = [
  {
    title: "Dr. Patel",
    field: "drPatel",
  },
];

const ChairRatesContent = () => {
  const [data, setData] = useState<RowData[]>([
    { office: "Happy Smiles", drPatel: "200" },
    { office: "Shiny Teeth", drPatel: "150" },
  ]);
  const onInputChange = useCallback(
    (office, specialist) => (e: ChangeEvent<HTMLInputElement>) => {
      const row = find(data, { office });
      if (row) {
        const rest = reject(data, { office });
        setData(
          sortBy([...rest, { ...row, [specialist]: e.target.value }], "office")
        );
      }
    },
    [data, setData]
  );
  return (
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
    />
  );
};

export default ChairRatesContent;
