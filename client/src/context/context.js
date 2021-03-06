import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import abi from "../contracts/SrvExchange.json";
import accounts from "./data/accounts";
import Axios from "axios";

const TBContext = React.createContext();
const TBProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState();
  const [providers, setProviders] = useState({});
  const [recipient, setRecipient] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // search the specific service
  // const searchTBService = (serviceName) => {
  //   if (serviceName) {
  //     const result = menu.filter(
  //       (item) =>
  //         item.category.includes(serviceName) ||
  //         item.title.includes(serviceName)
  //     );
  //     setService(result);
  //     console.log(result);
  //   } else {
  //     setService(menu);
  //   }
  // };

  // load browser web3
  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const initContract = async () => {
    if (
      typeof window.ethereum == "undefined" ||
      typeof window.web3 == "undefined"
    ) {
      return;
    }
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    setCurrentAccount(account);

    const networkId = await web3.eth.net.getId();
    const address = abi.networks[networkId].address;
    const newContract = new web3.eth.Contract(abi.abi, address);
    setContract(newContract);
  };

  return (
    <TBContext.Provider
      value={{
        loadWeb3,
        initContract,
        currentAccount,
        setCurrentAccount,
        contract,
        providers,
        setProviders,
        recipient,
        setRecipient,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </TBContext.Provider>
  );
};

export { TBProvider, TBContext };
