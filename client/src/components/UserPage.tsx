import React, { useState, ReactElement, useCallback } from "react";
import { Redirect, useHistory } from "react-router-dom";
import styled from "styled-components";
import { keys, map } from "lodash";
import AppHeader from "./AppHeader";
import Button from "./syncfusion/Button";
import { PRIMARY_BACKGROUND_COLOR, SECONDARY_BACKGROUND_COLOR, CONTENT_COLOR, PRIMARY_COLOR } from "../styles/colors";

export type UserPageProps = {
  userId: number;
  setUserId: (userId: number) => void;
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const AppContent = styled.div`
  display: flex;
  height: 100%;
`;

const StyledHeader = styled.h3`
  color: ${PRIMARY_COLOR};
  padding-left: 10px;
  text-transform: uppercase;
`;

const Sidebar = styled.div`
  min-width: 144px;
  max-width: 144px;
  background-color: ${PRIMARY_BACKGROUND_COLOR};
  display: inline-flex;
  flex-direction: column;
`;

const SidebarTab = styled.div<{ selected: boolean}>`
  height: 48px;
  color: ${CONTENT_COLOR};
  vertical-align: middle;
  padding-left: 10px;
  cursor: pointer;
  background: ${props => props.selected && SECONDARY_BACKGROUND_COLOR};
`;

const ContentContainer = styled.div`
  display: inline-flex;
  width: 100%;
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
  const history = useHistory();
  const [tab, setTab] = useState(initialTab);
  const logoutCallback = useCallback(() => {
    setUserId(0);
    history.push("/");
  }, [setUserId, history]);
  return userId === 0 ? (
    <Redirect to={"/login"} />
  ) : (
    <PageContainer>
      <AppHeader>
        <Button isPrimary onClick={logoutCallback}>LOG OUT</Button>
      </AppHeader>
      <AppContent>
        <Sidebar>
          <StyledHeader>{header}</StyledHeader>
          {map(keys(tabContent), (t, i) => (
            <SidebarTab key={i} onClick={() => setTab(t)} selected={t===tab}>
              {t.toUpperCase()}
            </SidebarTab>
          ))}
        </Sidebar>
        <ContentContainer>{tabContent[tab]}</ContentContainer>
      </AppContent>
    </PageContainer>
  );
};

export default UserPage;
