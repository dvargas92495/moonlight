import React, { useState, ReactElement } from "react";
import { Redirect } from "react-router-dom";
import PageLink from "./PageLink";
import styled from "styled-components";
import { keys, map } from "lodash";

type UserPageProps = {
  userId: number;
  initialTab: string;
  tabContent: {
    [tab: string]: ReactElement;
  };
  header: string;
};

const StyledHeader = styled.header`
  color: white;
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
  header
}: UserPageProps) => {
  const [tab, setTab] = useState(initialTab);
  return userId === 0 ? (
    <Redirect to={"/login"} />
  ) : (
    <>
      <Sidebar>
        <PageLink label="Home" path="/" />
        <StyledHeader>{header}</StyledHeader>
        {map(keys(tabContent), (t, i) => (
          <SidebarTab key={i} onClick={() => setTab(t)}>
            {t}
          </SidebarTab>
        ))}
      </Sidebar>
      <ContentContainer>{tabContent[tab]}</ContentContainer>
    </>
  );
};

export default UserPage;
