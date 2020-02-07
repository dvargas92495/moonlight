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
  userId: number;
  setUserId: (userId: number) => void;
};

const HomePage = ({ userId, setUserId }: HomePageProps) => {
  const [showSignUp, setShowSignup] = useState(false);
  const signUpToggleCallback = useCallback(() => setShowSignup(!showSignUp), [
    showSignUp,
    setShowSignup
  ]);
  const logoutCallback = useCallback(() => setUserId(0), [setUserId]);
  return (
    <AppContainer>
      <PageLink label="Dentists" path="/dentists" />
      <PageLink label="Specialists" path="/specialists" />
      {userId === 0 ? (
        <PageLink label="Log In" path="/login" />
      ) : (
        <button onClick={logoutCallback}>LOG OUT</button>
      )}
      <AppHeader>
        <p>Offer more. Worry less.</p>
        <MainHeader>MOONLIGHT HEALTH</MainHeader>
      </AppHeader>
      {showSignUp && (
        <SignUpWidget
          setUserId={setUserId}
          signUpToggleCallback={signUpToggleCallback}
        />
      )}
      {userId > 0 ? (
        <div>{`Logged in as ${userId}`}</div>
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
