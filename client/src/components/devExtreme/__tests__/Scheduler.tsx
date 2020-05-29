import React from "react";
import { render } from "@testing-library/react";
import Scheduler from "../Scheduler";

const USER_ID = 1;

test("Render Scheduler with just user id", () => {
  const { container } = render(<Scheduler userId={USER_ID} />);
  expect(container).toBeInDocument();
});
