import React, { useState, ReactElement, useCallback } from "react";
import { Redirect } from "react-router-dom";
import styled from "styled-components";
import { keys, map } from "lodash";
import AppHeader from "./AppHeader";
import Button from "./syncfusion/Button";

export type UserPageProps = {
  userId: number;
  setUserId: (userId: number) => void;
};

const StyledHeader = styled.header`
  color: white;
  margin-left: 10px;
`;

const Sidebar = styled.div`
  width: 180px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  background-color: #535959;
  display: inline-block;
`;

const SidebarTab = styled.div`
  height: 48px;
  color: white;
  vertical-align: middle;
  margin-left: 10px;
`;

const ContentContainer = styled.div`
  position: fixed;
  display: inline-block;
  top: 0;
  bottom: 0;
  left: 180px;
  right: 0;
`;

const UserPage = ({
  userId,
  initialTab,
  tabContent,
  header,
  setUserId,
}: {
  initialTab: string;
  tabContent: {
    [tab: string]: ReactElement;
  };
  header: string;
} & UserPageProps) => {
  const [tab, setTab] = useState(initialTab);
  const logoutCallback = useCallback(() => setUserId(0), [setUserId]);
  return userId === 0 ? (
    <Redirect to={"/login"} />
  ) : (
    <>
      <AppHeader>
        <Button isPrimary onClick={logoutCallback}>LOG OUT</Button>
      </AppHeader>
      <Sidebar>
        <StyledHeader>{header}</StyledHeader>
        {map(keys(tabContent), (t, i) => (
          <SidebarTab key={i} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </SidebarTab>
        ))}
      </Sidebar>
      <ContentContainer>{tabContent[tab]}</ContentContainer>
    </>
  );
};

export default UserPage;
