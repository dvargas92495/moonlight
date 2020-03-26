import React from "react";
import styled from "styled-components";
import { PRIMARY_COLOR } from "../styles/colors";
import PublicPage from "./PublicPage";
import PrivatePage from "./PrivatePage";
import { useUserId } from "../hooks/router";

const MainHeader = styled.h1`
  color: ${PRIMARY_COLOR};
  text-align: center;
  width: 100%;
`;

export type UserIdProps = {
  userId: number;
  setUserId: (userId: number) => void;
};

const HomePageContent = () => (
  <MainHeader>MOONLIGHT HEALTH</MainHeader>
);

const HomePage = () => {
  const userId = useUserId();
  return userId === 0 ? (
    <PublicPage>
      <HomePageContent />
    </PublicPage>
  ) : (
    <PrivatePage>
      <HomePageContent />
    </PrivatePage>
  );
}

export default HomePage;
