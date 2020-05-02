import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import HomePage from "./components/HomePage";
import DentistPage from "./components/DentistPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import SpecialistPage from "./components/SpecialistPage";
import { SECONDARY_BACKGROUND_COLOR } from "./styles/colors";
import AboutPage from "./components/AboutPage";
import NewPasswordPage from "./components/NewPasswordPage";
import SupportPage from "./components/SupportPage";
import ApplyPage from "./components/ApplyPage";

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

  html, body, #root {
    height: 100%;
  }
`;

const App: React.FC = () => (
  <BrowserRouter>
    <GlobalStyle />
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/dentist" component={DentistPage} />
      <Route path="/specialist" component={SpecialistPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/apply/:type" component={ApplyPage} />
      <Route path="/password" component={NewPasswordPage} />
    </Switch>
  </BrowserRouter>
);

export default App;
