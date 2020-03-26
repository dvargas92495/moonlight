import React, { useState, ReactElement } from "react";
import styled from "styled-components";
import { keys, map } from "lodash";
import { PRIMARY_BACKGROUND_COLOR, SECONDARY_BACKGROUND_COLOR, CONTENT_COLOR, PRIMARY_COLOR } from "../styles/colors";
import PrivatePage from "./PrivatePage";

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
  initialTab,
  tabContent,
  header,
}: {
  initialTab: string;
  tabContent: {
    [tab: string]: ReactElement;
  };
  header: string;
}) => {
  const [tab, setTab] = useState(initialTab);
  return (
    <PrivatePage>
      <Sidebar>
        <StyledHeader>{header}</StyledHeader>
        {map(keys(tabContent), (t, i) => (
          <SidebarTab key={i} onClick={() => setTab(t)} selected={t===tab}>
            {t.toUpperCase()}
          </SidebarTab>
        ))}
      </Sidebar>
      <ContentContainer>{tabContent[tab]}</ContentContainer>
    </PrivatePage>
  );
};

export default UserPage;
