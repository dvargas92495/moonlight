import React from "react";
import styled from "styled-components";
import { PRIMARY_BACKGROUND_COLOR, CONTENT_COLOR, QUARTER_OPAQUE } from "../styles/colors";
import PageLink from "./PageLink";

const Container = styled.header`
  font-size: calc(10px + 2vmin);
  background: ${PRIMARY_BACKGROUND_COLOR};
  border-bottom: 1px solid ${CONTENT_COLOR}${QUARTER_OPAQUE};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SubContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const AppHeader = ({ children }: {children: React.ReactNode}) => (
  <Container>
    <PageLink label="Home" path='/' />
    <SubContainer>
      {children}
    </SubContainer>
  </Container>
);

export default AppHeader;
