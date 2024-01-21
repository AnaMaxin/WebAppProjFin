import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MainFrame.css";
import { getUniversalCookies, ipAddress, port } from "./SignIn";

/* This component contains the drop down menu shown to the user
 once they sign in successfully.*/
const MainFrame = () => {
  // This variable stores the id of the current user.
  const user = getUniversalCookies().get("user");

  // These variables store the username and the path
  //on the server to their profile picture. The username
  // and their profile picture will be shown on top of
  // the menu.
  const [currUsername, setCurrUsername] = useState("");
  const [currProfilePic, setCurrProfilePic] = useState("");

  // Once this component is accessed, the user's brief data
  // (username, path to profile picture) should be retrieved.
  useEffect(() => {
    getBriefCurrData();
  }, []);

  // This function retrieves the username and the path to the profile picture
  // of the current username by making a get request to the server.
  const getBriefCurrData = async () => {
    try {
      const response = await fetch(
        `http://${ipAddress}:${port}/getBriefUserData/${user}`,
        {
          method: "GET",
        }
      );
      let jsonData = await response.json();

      setCurrUsername(jsonData.username);
      setCurrProfilePic(jsonData.profile_picture_path);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div class="dropdown">
      <button class="dropbtn">
        <img class="imgMenu" src={require("./Static_Images/menu.png")} />
      </button>
      <div class="dropdownContent">
        <div class="divProfileMenu">
          {currProfilePic != "" ? (
            <img
              src={"http://" + ipAddress + ":" + port + currProfilePic}
              class=" profilePicMenu"
            />
          ) : (
            <img src="./no_picture_available.png" class="profilePicMenu " />
          )}
          <br />
          <div>
            <p class="pUsernameMenu">{currUsername}</p>
          </div>
        </div>

        <Link
          class="menuLink"
          to="/Home"
          state={{
            previousLocation: "",
            previousProduct: "",
            previousResults: [],
          }}
        >
          Home
        </Link>
        <Link class="menuLink" to="/Edit account">
          Edit account
        </Link>
        <Link class="menuLink" to="/My products">
          My products
        </Link>
        <Link class="menuLink" to="/List product">
          List new product
        </Link>

        <Link class="menuLink" to="/All conversations">
          Conversations
        </Link>

        <Link class="menuLink" to="/">
          Sign out
        </Link>
      </div>
    </div>
  );
};

export default MainFrame;
