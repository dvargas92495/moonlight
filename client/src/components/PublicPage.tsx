import React from "react";
import styled from "styled-components";
import PageLink from "./PageLink";
import { CONTENT_COLOR, QUARTER_OPAQUE } from "../styles/colors";
import AppHeader from "./AppHeader";

const StyledPageLink = styled(PageLink)`
  border-left: 1px solid ${CONTENT_COLOR}${QUARTER_OPAQUE};
`;

const PublicPage = ({ children }: {
  children: React.ReactNode,
}) => (
    <div>
      <AppHeader>
        <StyledPageLink label="Dentists" path='/signup/dentist' />
        <StyledPageLink label="Specialists" path='/signup/specialist' />
        <StyledPageLink label="Log In" path="/login" />
      </AppHeader>
      <div>
          {children}
      </div>
    </div>
);

export default PublicPage;