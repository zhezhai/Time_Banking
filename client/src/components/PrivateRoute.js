import React, { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import cookie from "react-cookies";
import { TBContext } from "../context/context";

const PrivateRoute = ({ children, ...rest }) => {
  const status = cookie.load("user");
  return (
    <Route
      {...rest}
      render={() => {
        return status ? children : <Redirect to="/login" />;
      }}
    ></Route>
  );
};

export default PrivateRoute;
