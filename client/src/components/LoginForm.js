import React, { useRef, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import Axios from "axios";
import cookie from "react-cookies";
import { TBContext } from "../context/context";
import { Link, Redirect, useHistory } from "react-router-dom";

const LoginForm = () => {
  const nameRef = useRef();
  const passwordRef = useRef();
  const { isLoggedIn, setIsLoggedIn } = React.useContext(TBContext);
  const history = useHistory();
  const [log, setLog] = useState();

  Axios.defaults.withCredentials = true;
  const loginHandler = (e) => {
    e.preventDefault();
    Axios.post("http://localhost:3001/login", {
      name: nameRef.current.value,
      password: passwordRef.current.value,
    }).then((response) => {
      if (response.data.message == "you are logged in") {
        cookie.save("user", response.data.result[0]);
        console.log(response.data.result[0]);
        setLog(response.data.message);
        setIsLoggedIn(true);
        history.push("/");
      }
      if (response.data.message == "no matched user") {
        setLog("wrong username or password");
        console.log("no matched user");
      }
    });
  };

  return (
    <>
      <Card>
        <Card.Body>
          <Form onSubmit={loginHandler}>
            <h2 className="text-center mb-4">Login</h2>
            <Form.Group id="name">
              <Form.Label>username</Form.Label>
              <Form.Control type="text" ref={nameRef} />
              {log && <Form.Text className="text-muted">{log}</Form.Text>}
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>password</Form.Label>
              <Form.Control type="password" ref={passwordRef} />
            </Form.Group>
            <Row>
              <Col>
                <Button className="w-100" type="submit">
                  Login
                </Button>
              </Col>
              <Col>
                <Link to="/register">
                  <Button className="w-100">Register</Button>
                </Link>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default LoginForm;
