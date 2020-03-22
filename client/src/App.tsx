import React, { useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import HomePage from "./components/HomePage";
import DentistPage from "./components/DentistPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import SpecialistPage from "./components/SpecialistPage";
import { SECONDARY_BACKGROUND_COLOR } from "./styles/colors";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${SECONDARY_BACKGROUND_COLOR};
  }

  code {
     font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;

const App: React.FC = () => {
  const [userId, setUserId] = useState(0);
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route path="/dentists">
          <DentistPage userId={userId} setUserId={setUserId}/>
        </Route>
        <Route path="/specialists">
          <SpecialistPage userId={userId} setUserId={setUserId}/>
        </Route>
        <Route path="/login">
          <LoginPage setUserId={setUserId} />
        </Route>
        <Route path="/signup/:type">
          <SignupPage setUserId={setUserId} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
