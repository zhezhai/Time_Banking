import React, { useState } from "react";
import Web3 from "web3";
import SrvExchange from "../contracts/SrvExchange.json";
import accounts from "./data/accounts";

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
    const web3 = new Web3('http://127.0.0.1:8042');
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    setCurrentAccount(account);
    console.log(accounts);

    const networkId = await web3.eth.net.getId();
    const address = SrvExchange.networks[networkId].address;
    const newContract = new web3.eth.Contract(SrvExchange.abi, address);
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
