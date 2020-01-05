import React from "react";
import { isEmpty } from "lodash";
import { Redirect } from "react-router-dom";
import PageLink from "./PageLink";

type UserPageProps = {
  globalUuid: string;
};

const UserPage: React.FC<UserPageProps> = ({ globalUuid, children }) =>
  isEmpty(globalUuid) ? (
    <Redirect to={"/login"} />
  ) : (
    <>
      <PageLink label="Home" path="/" />
      <br />
      {children}
    </>
  );

export default UserPage;
