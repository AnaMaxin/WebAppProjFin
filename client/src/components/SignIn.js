import bcryptjs from "bcryptjs";

import Cookies from "js-cookie";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// These variables should store the ip address and port of the back-end server.
const ipAddress = "localhost";
const port = "5000";

/* This component enables the sign in process.*/
const SignIn = () => {
  // State variables that will keep the values introduced by user
  // as account and password.
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  // We will use this React hook to navigate to the home page,
  // once the user signed in successfully.
  const navigate = useNavigate();

  // This function tells the user that their input is not valid
  // by displaying a message.
  const alertUser = () => {
    const accountAttention = document.getElementById("accountAttention");
    accountAttention.innerHTML = "Incorrect username and/or password! <br/>";
    accountAttention.style.color = "red";
  };

  // This function checks if the account introduced by the user is correct.
  // It communicates to the server to get the appropriate response. If the
  // user provides their account and password correctly, they will be taken to
  // the home page. This is done with useNavigate. The id of the current user
  // is saved as a cookie value.
  const checkAccount = async () => {
    try {
      if (account != "") {
        let response = await fetch(
          `http://${ipAddress}:${port}/checkAccount/${account}`,
          {
            method: "GET",
          }
        );

        let jsonData = await response.json();

        if (jsonData == "") {
          alertUser();
        } else if (!bcryptjs.compareSync(password, jsonData.password)) {
          alertUser();
        } else {
          Cookies.set("user", jsonData.app_user_id);

          navigate("/home", {
            state: {
              previousLocation: "",
              previousProduct: "",
              previousResults: [],
            },
          });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // This is the function that is called when the user presses the Sign In button.
  // It prevents the default reload of the page and calls the function checkAccount().
  const handleSignIn = (e) => {
    e.preventDefault();
    checkAccount();
  };

  return (
    <div class="container">
      <form>
        <div class="insideContainer">
          <h1>Sign In</h1>
          <label id="accountAttention" for="account"></label>
          <label for="account">
            <b>Username/email</b>
          </label>
          <input
            type="text"
            placeholder="Enter username or email address"
            name="account"
            id="account"
            onChange={(e) => setAccount(e.target.value)}
          />
          <label id="passwordAttention" for="password"></label>
          <label for="password">
            <b>Password</b>
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" class="formbtn" onClick={handleSignIn}>
            Sign In
          </button>
        </div>
        <div class="otherOption">
          <p>
            Don't have an account?{" "}
            <Link class="links" to="/SignUp">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

// The component and the variables that store the ip address of the server,
// and the port are exported to be ready for use within
// other components. The cookies are also exported so that other components
// will be able to get the id of the user.
export default SignIn;
export { ipAddress, port };
export const getUniversalCookies = () => Cookies;
