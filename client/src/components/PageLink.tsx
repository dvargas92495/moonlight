import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { PRIMARY_COLOR, CONTENT_COLOR } from "../styles/colors";

const StyledContainer = styled.div`
  background-color: transparent;
  display: inline-block;
  padding: 10px;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: ${CONTENT_COLOR};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    color: ${PRIMARY_COLOR};
  }
`;

const PageLink = ({ label = "", path = "/", className }: {
  label: string;
  path: string;
  className?: string;
}) => (
  <StyledContainer className={className}>
    <StyledLink to={path}>{label.toUpperCase()}</StyledLink>
  </StyledContainer>
);

export default PageLink;
