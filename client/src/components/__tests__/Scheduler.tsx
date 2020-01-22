import React from "react";
import { render } from "@testing-library/react";
import { range } from "lodash";
import Scheduler from "../Scheduler";

test("Renders Scheduler with days of week headers", () => {
  const { getByText } = render(<Scheduler />);

  const expectTextInDocument = (text: string) => {
    const headerElement = getByText(new RegExp(`^${text}`));
    expect(headerElement).toBeInTheDocument();
  };

  expectTextInDocument("SCHEDULE");
  expectTextInDocument("TIME");

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  daysOfWeek.forEach(expectTextInDocument);

  range(1, 13).forEach(i => {
    expectTextInDocument(`${i} AM`);
    expectTextInDocument(`${i} PM`);
  });
});
