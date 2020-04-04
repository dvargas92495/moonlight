import React, { useState, useEffect } from "react";
import PublicPage from "./PublicPage";
import PrivatePage from "./PrivatePage";
import { useUserId } from "../hooks/router";
import styled from "styled-components";

const Container = styled.div<{ loaded: boolean }>`
    opacity: ${(props) => (props.loaded ? 1 : 0)}
    transition: opacity ${(props) => (props.loaded ? 0.78 : 0.12)}s;
`;

const WebPage = ({ children }: { children: React.ReactNode }) => {
  const userId = useUserId();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [setLoaded]);
  return userId === 0 ? (
    <PublicPage>
      <Container loaded={loaded}>{children}</Container>
    </PublicPage>
  ) : (
    <PrivatePage>
      <Container loaded={loaded}>{children}</Container>
    </PrivatePage>
  );
};

export default WebPage;
