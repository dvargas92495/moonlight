import React from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  text-align: center;
`;

const AppHeader = styled.header`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const MainHeader = styled.p`
  font-size: 32px;
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <AppHeader>
        <p>Offer more. Worry less.</p>
        <MainHeader>MOONLIGHT HEALTH</MainHeader>
      </AppHeader>
    </AppContainer>
  );
}

export default App;
