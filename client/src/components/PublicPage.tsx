import React from "react";
import PageLink from "./PageLink";
import AppHeader from "./AppHeader";
import AppContent from "./AppContent";

const PublicPage = ({ children }: { children: React.ReactNode }) => (
  <div>
    <AppHeader>
      <PageLink label="Dentists" path="/apply/dentist" isPage />
      <PageLink label="Specialists" path="/apply/specialist" isPage />
      <PageLink label="Log In" path="/login" isPage />
    </AppHeader>
    <AppContent>{children}</AppContent>
  </div>
);

export default PublicPage;
