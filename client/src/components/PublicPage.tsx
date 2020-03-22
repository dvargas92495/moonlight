import React from "react";
import styled from "styled-components";
import PageLink from "./PageLink";
import { SECONDARY_BACKGROUND_COLOR, CONTENT_COLOR, QUARTER_OPAQUE } from "../styles/colors";
import AppHeader from "./AppHeader";

const AppContainer = styled.div`
  text-align: center;
  background: ${SECONDARY_BACKGROUND_COLOR};
`;

const StyledPageLink = styled(PageLink)`
  border-left: 1px solid ${CONTENT_COLOR}${QUARTER_OPAQUE};
`;

const PublicPage = ({ children }: {
  children: React.ReactNode,
}) => (
    <AppContainer>
      <AppHeader>
        <StyledPageLink label="Dentists" path='/signup/dentist' />
        <StyledPageLink label="Specialists" path='/signup/specialist' />
        <StyledPageLink label="Log In" path="/login" />
      </AppHeader>
      <div>
          {children}
      </div>
    </AppContainer>
);

export default PublicPage;