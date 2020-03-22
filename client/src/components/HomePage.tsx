import React from "react";
import styled from "styled-components";
import { PRIMARY_COLOR } from "../styles/colors";
import PublicPage from "./PublicPage";

const MainHeader = styled.h1`
  color: ${PRIMARY_COLOR};
`;

const HomePage = () => (
  <PublicPage>
    <MainHeader>MOONLIGHT HEALTH</MainHeader>
  </PublicPage>
);

export default HomePage;
