import React, { useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import HomePage from "./components/HomePage";
import DentistPage from "./components/DentistPage";
import LoginPage from "./components/LoginPage";
import SpecialistPage from "./components/SpecialistPage";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
     font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;

const App: React.FC = () => {
  const [globalUuid, setGlobalUuid] = useState("");
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Switch>
        <Route exact path="/">
          <HomePage globalUuid={globalUuid} setGlobalUuid={setGlobalUuid} />
        </Route>
        <Route path="/dentists">
          <DentistPage globalUuid={globalUuid} />
        </Route>
        <Route path="/specialists">
          <SpecialistPage globalUuid={globalUuid} />
        </Route>
        <Route path="/login">
          <LoginPage setGlobalUuid={setGlobalUuid} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
