import React from "react";
import PublicPage from "./PublicPage";
import PrivatePage from "./PrivatePage";
import { useUserId } from "../hooks/router";

const WebPage = ({ children }: { children: React.ReactNode }) => {
  const userId = useUserId();
  return userId === 0 ? (
    <PublicPage>
      <div>{children}</div>
    </PublicPage>
  ) : (
    <PrivatePage>
      <div>{children}</div>
    </PrivatePage>
  );
};

export default WebPage;
