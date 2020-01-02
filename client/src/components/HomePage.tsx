import React, { useState, useCallback } from "react";
import styled from "styled-components";
import PageLink from "./PageLink";
import SignUpWidget from "./SignUpWidget";

const AppContainer = styled.div`
  text-align: center;
`;

const AppHeader = styled.header`
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: Navy;
`;

const MainHeader = styled.p`
  font-size: 32px;
  font-weight: 700;
`;

type HomePageProps = {
  globalUuid: string;
  setGlobalUuid: (uuid: string) => void;
};

const HomePage = ({ globalUuid, setGlobalUuid }: HomePageProps) => {
  const [showSignUp, setShowSignup] = useState(false);
  const signUpToggleCallback = useCallback(() => setShowSignup(!showSignUp), [
    showSignUp,
    setShowSignup
  ]);
  return (
    <AppContainer>
      <PageLink label="Dentists" path="/dentists" />
      <PageLink label="Specialists" path="/specialists" />
      <PageLink label="Patients" path="/patients" />
      <AppHeader>
        <p>Offer more. Worry less.</p>
        <MainHeader>MOONLIGHT HEALTH</MainHeader>
      </AppHeader>
      {showSignUp && <SignUpWidget setGlobalUuid={setGlobalUuid} />}
      {globalUuid ? (
        <div>{`Logged in as ${globalUuid}`}</div>
      ) : (
        <div>
          <button onClick={signUpToggleCallback}>
            {showSignUp ? "CLOSE SIGN UP" : "SIGN UP HERE"}
          </button>
        </div>
      )}
    </AppContainer>
  );
};

export default HomePage;
