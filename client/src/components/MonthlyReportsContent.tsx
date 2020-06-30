import React, { useState, useCallback } from "react";
import MaterialTable from "material-table";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import Previous from "@material-ui/icons/NavigateBefore";
import Next from "@material-ui/icons/NavigateNext";
import { format, subMonths, addMonths, startOfMonth } from "date-fns";
import api from "../hooks/apiClient";

type TableIcon = React.ForwardRefExoticComponent<
  React.RefAttributes<SVGSVGElement>
>;

const MonthlyReportsContent = () => {
  const tableRef = React.createRef<any>();
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const onDateClick = useCallback(
    (f: (d: Date, n: number) => Date) => () => {
      setCurrentDate(f(currentDate, 1));
      tableRef?.current?.onQueryChange();
    },
    [setCurrentDate, currentDate, tableRef]
  );
  return (
    <MaterialTable
      tableRef={tableRef}
      actions={[
        {
          icon: Previous,
          tooltip: "Previous Month",
          isFreeAction: true,
          onClick: onDateClick(subMonths),
        },
        {
          icon: Next,
          tooltip: "Next Month",
          isFreeAction: true,
          onClick: onDateClick(addMonths),
        },
      ]}
      columns={[
        {
          title: "Office",
          field: "office",
        },
        { title: "Total Due", field: "totalDue", type: "currency" },
        { field: "parentOffice", hidden: true },
      ]}
      data={() =>
        api
          .get(`offices/reports?date=${currentDate.toJSON()}`)
          .then((res) => res.data)
      }
      title={`Office Report for ${format(currentDate, "MMMM yyyy")}`}
      style={{
        width: "100%",
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
      icons={{
        DetailPanel: KeyboardArrowRightIcon as TableIcon,
      }}
      onRowClick={(_, __, togglePanel) => togglePanel && togglePanel()}
      parentChildData={(row, rows) =>
        rows.find((a) => a.office === row.parentOffice)
      }
    />
  );
};

export default MonthlyReportsContent;
