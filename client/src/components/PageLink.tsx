import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { PRIMARY_COLOR, CONTENT_COLOR, QUARTER_OPAQUE } from "../styles/colors";

const StyledContainer = styled.div<{isPage: boolean}>`
  background-color: transparent;
  display: inline-block;
  padding: 10px;
  text-align: center;
  border-left: ${props => props.isPage && `1px solid ${CONTENT_COLOR}${QUARTER_OPAQUE}`};
`;

const StyledLink = styled(Link)`
  color: ${CONTENT_COLOR};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    color: ${PRIMARY_COLOR};
  }
`;

const PageLink = ({ label = "", path = "/", state = {}, isPage = false}: {
  label: string;
  path: string;
  state?: object;
  isPage?: boolean;
}) => (
  <StyledContainer isPage={isPage}>
    <StyledLink to={{
      pathname: path,
      state,
    }}>{label.toUpperCase()}</StyledLink>
  </StyledContainer>
);

export default PageLink;
