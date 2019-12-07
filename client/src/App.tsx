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

const App: React.FC = () => {
  return (
    <AppContainer>
      <AppHeader>
        MOONLIGHT HEALTH
      </AppHeader>
    </AppContainer>
  );
}

export default App;
