import React from "react";
import logo from "./logo.svg";
import "./App.css";
import $ from "jquery";
import constants from "./constants";

// ****************************************************************************

import Fortmatic from "fortmatic";
// Works for web3 1.0 and pre-1.0 versions
import Web3 from "web3";

const apiKey = constants.API_KEY;
const secretKey = constants.SECRET_KEY;

const WyreClient = require("@wyre/api").WyreClient;

let wyre = new WyreClient({
  format: "json_numberstring",
  apiKey: apiKey,
  secretKey: secretKey,
  baseUrl: "https://api.testwyre.com"
});

wyre.get("/v2/account").then(
  account => {
    console.log("I am Wyre account ", account.id);
  },
  err => {
    console.log("Problems, cap'n: ", err);
  }
);

const fm = new Fortmatic("pk_test_4D175B5BE5D1ACA4");
let web3 = new Web3(fm.getProvider());

let setUserInfo = async () => {
  web3.eth.getAccounts((err, accounts) => {
    if (err) throw err;
    let address = accounts[0];
    console.log(address);
    $("#user-address").text(address);
  });
  // Get user balance (includes ERC20 tokens as well)
  let balances = await fm.user.getBalances();
  console.log(balances);
  let ethBalance = balances.find(e => {
    return e.crypto_currency == "ETH";
  });
  $("#user-balance").text(ethBalance.crypto_amount_display + " ETH");
};

let handleSendTransaction = () => {
  fm.transactions.send((err, txnHash) => {
    if (err) throw err;
    setUserInfo();
  });
};

let handleLogin = async () => {
  // Authenticate user
  let accounts = await fm.user.login();
  if (accounts.length > 0) {
    $("#section-login").hide();
    $("#section-account").show();
    setUserInfo();
  }
};

let handleLogout = () => {
  fm.user.logout();
  $("#section-login").show();
  $("#section-account").hide();
};

console.log("Web3.eth", Web3.eth);

$("#section-account").hide();

// Check if user has logged in
let handleDisplay = async () => {
  let isLoggedIn = await fm.user.isLoggedIn();
  if (isLoggedIn) {
    $("#section-login").hide();
    $("#section-account").show();
    setUserInfo();
  } else {
    $("#section-login").show();
    $("#section-account").hide();
  }
};

handleDisplay();

// ****************************************************************************

function App() {
  return (
    <div className="App">
      <header className="App-header" />

      <div className="container">
        <img alt="logo" src={logo} />
        <h1>Your Favorite Ethereum Wallet 💎</h1>
        <div className="divider" />
        <div id="section-login">
          <a
            id="btn-login"
            className="btn"
            onClick={() => {
              handleLogin();
            }}
          >
            Login with SMS
          </a>
        </div>
        <div id="section-account">
          <div id="user-address" />
          <div id="user-balance" />
          <a
            id="btn-send"
            className="btn"
            onClick={() => {
              handleSendTransaction();
            }}
          >
            Send Transaction
          </a>
          <a
            id="btn-logout"
            className="btn"
            onClick={() => {
              handleLogout();
            }}
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
