import React, { useState, useCallback } from "react";
import MaterialTable, { MTableBodyRow } from "material-table";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Previous from "@material-ui/icons/NavigateBefore";
import Next from "@material-ui/icons/NavigateNext";
import { format, subMonths, addMonths, differenceInHours } from "date-fns";
import { mapValues, keyBy, reduce, map, keys, groupBy } from "lodash";
import TableRow from "@material-ui/core/TableRow";
import { TableCell } from "@material-ui/core";

const EventData = [
  {
    startDate: new Date(2020, 6, 3, 9),
    endDate: new Date(2020, 6, 3, 12),
    office: "Happy Smiles",
    rate: 200,
  },
  {
    startDate: new Date(2020, 6, 4, 10),
    endDate: new Date(2020, 6, 4, 12),
    office: "Happy Smiles",
    rate: 200,
  },
  {
    startDate: new Date(2020, 6, 11, 9),
    endDate: new Date(2020, 6, 11, 13),
    office: "Happy Smiles",
    rate: 200,
  },
  {
    startDate: new Date(2020, 6, 14, 9),
    endDate: new Date(2020, 6, 14, 14),
    office: "Shiny Teeth",
    rate: 200,
  },
];

const MonthlyReportsContent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rowOpen, setRowOpen] = useState<{ [office: string]: boolean }>(
    mapValues(keyBy(EventData, "office"), () => false)
  );
  const eventsByOffice = groupBy(EventData, "office");
  const totalDuesByOffice = reduce(
    EventData,
    (acc, e) => {
      const hours = differenceInHours(e.endDate, e.startDate);
      const total = e.rate * hours;
      const previous = acc[e.office] || 0;
      return { ...acc, [e.office]: previous + total };
    },
    {} as { [office: string]: number }
  );
  const data = map(keys(totalDuesByOffice), (office) => ({
    office,
    totalDue: `$${totalDuesByOffice[office]}`,
  }));
  const openRow = useCallback(
    (_, { office }) => setRowOpen({ ...rowOpen, [office]: true }),
    [rowOpen, setRowOpen]
  );
  const closeRow = useCallback(
    (_, { office }) => setRowOpen({ ...rowOpen, [office]: false }),
    [rowOpen, setRowOpen]
  );
  return (
    <MaterialTable
      actions={[
        (rowData) =>
          rowOpen[rowData.office]
            ? {
                icon: KeyboardArrowUpIcon,
                tooltip: "Collapse",
                onClick: closeRow,
              }
            : {
                icon: KeyboardArrowDownIcon,
                tooltip: "Expand",
                onClick: openRow,
              },
        {
          icon: Previous,
          tooltip: "Previous Month",
          isFreeAction: true,
          onClick: () => setCurrentDate(subMonths(currentDate, 1)),
        },
        {
          icon: Next,
          tooltip: "Next Month",
          isFreeAction: true,
          onClick: () => setCurrentDate(addMonths(currentDate, 1)),
        },
      ]}
      columns={[
        {
          title: "Office",
          field: "office",
        },
        { title: "Total Due", field: "totalDue" },
      ]}
      data={data}
      title={`Office Report for ${format(currentDate, "MMMM yyyy")}`}
      style={{
        width: "100%",
      }}
      options={{
        search: false,
        paging: false,
      }}
      localization={{
        header: {
          actions: "",
        },
      }}
      components={{
        Row: (props) => {
          const {
            data: { office },
          } = props;
          return (
            <>
              <MTableBodyRow {...props} />
              {rowOpen[office] &&
                map(eventsByOffice[office], (event, i) => (
                  <TableRow key={i}>
                    <TableCell>{event.rate}</TableCell>
                    <TableCell>
                      {`${format(event.startDate, "MM/dd hh:mm a")} - ${format(
                        event.endDate,
                        "MM/dd hh:mm a"
                      )}`}
                    </TableCell>
                    <TableCell>
                      {`$${
                        differenceInHours(event.endDate, event.startDate) *
                        event.rate
                      }`}
                    </TableCell>
                  </TableRow>
                ))}
            </>
          );
        },
      }}
    />
  );
};

export default MonthlyReportsContent;
