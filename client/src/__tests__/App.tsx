import React from "react";
import { render } from "@testing-library/react";
import App from "../App";

test("renders Moonlight header", () => {
  const { getByText } = render(<App />);
  const headerElement = getByText("MOONLIGHT");
  expect(headerElement).toBeInTheDocument();
});
