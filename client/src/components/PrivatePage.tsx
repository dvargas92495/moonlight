import React from "react";
import styled from "styled-components";
import AppHeader from "./AppHeader";
import { Redirect } from "react-router-dom";
import AppContent from "./AppContent";
import { useUserId, useUserType } from "../hooks/router";
import PageLink from "./PageLink";
import { clearAuth } from "../hooks/apiClient";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PrivatePage = ({ children }: { children: React.ReactNode }) => {
  const userId = useUserId();
  const type = useUserType();
  return userId === 0 ? (
    <Redirect to={"/login"} />
  ) : (
    <PageContainer>
      <AppHeader>
        <PageLink
          isPage
          path={`/${type}`}
          state={{ userId, type }}
          label="Dashboard"
        />
        <PageLink
          isPage
          path={"/"}
          state={{ userId: 0 }}
          label="Log out"
          onClick={clearAuth}
        />
      </AppHeader>
      <AppContent>{children}</AppContent>
    </PageContainer>
  );
};

export default PrivatePage;
