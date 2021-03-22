import React, { useRef } from "react";
import { Navbar } from "../components/index";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import {axiosNode, axiosFlask} from "../helpers/axios";
import cookie from "react-cookies";

const PostService = () => {
  const serviceInfoRef = useRef();
  const priceRef = useRef();

  const postService = () => {
    axiosNode
      .post("/createProvider", {
        provider_service: serviceInfoRef.current.value,
        provider_price: priceRef.current.value,
      })
      .then((response) => {
        console.log(response);
      });
  };

  const updateProvider = () => {
    const user = cookie.load("user");
    axiosFlask
      .post("/TB/api/v1.0/registerService", {
        client_addr: user.address,
        op_state: 2,
        service_info: serviceInfoRef.current.value,
      })
      .then((response) => {
        if (response.data.registerService === "Succeed") {
          window.alert("service post successful");
        }
      });
  };

  const test = () => {
    console.log(cookie.load("user"));
  };

  return (
    <div>
      <Navbar />
      <Wrapper>
        <div className="container">
          <form>
            <div className="form-group">
              <label htmlFor="provider_service">service info</label>
              <input
                type="text"
                className="form-control"
                name="provider_service"
                placeholder="please enter your service info"
                ref={serviceInfoRef}
              />
            </div>
            <div className="form-group">
              <label htmlFor="provider_price">service price</label>
              <input
                type="text"
                className="form-control"
                name="provider_price"
                placeholder="please enter your price"
                ref={priceRef}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                postService();
                updateProvider();
              }}
            >
              post service
            </button>
          </form>
          <button onClick={test}>test</button>
        </div>
      </Wrapper>
    </div>
  );
};

const Wrapper = styled.div`
  .container {
    display: block;
    justify-content: center;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 80%;
    padding: 1rem;
  }

  .btn.btn-primary {
    display: flex;
    justify-content: center;
    margin: auto;
  }
`;
export default PostService;
