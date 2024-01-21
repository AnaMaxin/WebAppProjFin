import bcryptjs from "bcryptjs";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUniversalCookies, ipAddress, port } from "./SignIn";

/* This component allows the user to make changes to their account.*/
const EditAccount = () => {
  // This variable stores the id of the current user.
  const user = getUniversalCookies().get("user");

  // Instantiating useNavigate to be able to navigate
  // to the home page once the user updated their account.
  const navigate = useNavigate();

  // This number will be used to encrypt the password of the user.
  const numSaltRounds = 8;

  // These state variables will store the file object
  // that represents the uploaded profile picture
  // and the url that was generated for that picture.
  const [file, setFile] = useState("");
  const [url, setUrl] = useState("");

  // This state variable will store the path to the profile picture
  // if the user has already a profile picture saved on the server.
  const [pathProfilePicture, setPathProfilePicture] = useState("");

  // This variable will hold the initial data of the user account,
  // as it is initially retrieved from the database.
  const [initialFormData, setInitialFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });

  // This variable will hold the data introduced by the user to
  // the form fields and a few boolean values that denote if
  // the mandatory data is valid.
  const [formData, setformData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    password_repeat: "",
    emailValid: false,
    usernameValid: false,
    passwordValid: false,
    password_repeatValid: false,
  });

  // When the page is rendered, the user data must be retrieved from
  // the server and the div section that permits the user to change
  // their password is not displayed.
  useEffect(() => {
    getUserData();
    document.getElementById("changePasswordSection").style.display = "none";
    document.getElementById("password_repeatAttention").innerHTML = "";
  }, []);

  // This function retrieves the user data from the database.
  // It does this by sending a fetch request to the server,
  // with the user id as parameter. Once the user data has
  // been served to the client, it is saved in the initialFormData
  // variable and the formData is also assigned with the fetched data.
  // The server path to the profile picture is also saved in the pathProfilePicture
  // state variable.
  const getUserData = async () => {
    try {
      let response = await fetch(
        `http://${ipAddress}:${port}/getUserData/${user}`,
        {
          method: "GET",
        }
      );
      let userData = await response.json();

      let initialFormDataAux = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        username: userData.username,
        password: userData.password,
      };
      let formDataAux = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        username: userData.username,
        password: "",
        password_repeat: "",
        emailValid: true,
        usernameValid: true,
        passwordValid: true,
        password_repeatValid: true,
      };

      setPathProfilePicture(userData.profile_picture_path);

      setInitialFormData(initialFormDataAux);
      setformData(formDataAux);
    } catch (err) {
      console.error(err);
    }
  };

  // If there is a profile picture already selected, the file input
  // that allows the user to upload their profile picture should be hidden.
  useEffect(() => {
    if (file != "" || pathProfilePicture != "") {
      document.getElementById("file-input-label").style.visibility = "hidden";
    } else {
      document.getElementById("file-input-label").style.visibility = "visible";
    }
  }, [file, pathProfilePicture]);

  // Every time an url is generated for a new profile picture
  // or the profile picture path on the server is saved,
  // the function responsible to show the image is called.
  useEffect(() => {
    showImage();
  }, [url, pathProfilePicture]);

  // This function is called every time the user checks or unchecks the checkbox
  // to change their password or to dismiss the change password process.
  // It reassigns the initial default values regarding the password within the formData.
  // Also it activates the the submit button if the username and email are valid, and
  // of course, displays or hides the div section that allows the user to change their password.
  const handleCheckBox = () => {
    let element = document.getElementById("changePasswordSection");

    setformData((prevformData) => ({
      ...prevformData,
      ["password"]: "",
      ["password_repeat"]: "",
      ["passwordValid"]: true,
      ["password_repeatValid"]: true,
    }));
    if (formData.emailValid && formData.usernameValid) {
      document.getElementById("register").removeAttribute("disabled");
    }

    if (document.getElementById("changePsw").checked) {
      element.style.display = "block";
      document.getElementById("passwordAttention").innerHTML = "";
      document.getElementById("password").style.outline = "none";

      document.getElementById("password_repeatAttention").innerHTML = "";
      document.getElementById("password_repeat").style.outline = "";
    } else {
      element.style.display = "none";
    }
  };

  // This function displays the selected profile picture.
  const showImage = () => {
    const imgElement = document.getElementById("imgProfile");
    const imgSectionElement = document.getElementById("imgProfileSection");

    if (pathProfilePicture != "") {
      imgSectionElement.style.display = "block";

      imgElement.src = "http://" + ipAddress + ":" + port + pathProfilePicture;
    } else {
      if (file != "") {
        imgSectionElement.style.display = "block";
        imgElement.src = url;
      } else {
        imgElement.src = "#";
        imgSectionElement.style.display = "none";
      }
    }
  };

  // This function is called when the user uploads their profile picture.
  // It saves the file, generates a local URL ans saves that url.
  const handleFileChange = async (e) => {
    if (e.target.files) {
      setPathProfilePicture("");
      setFile(e.target.files[0]);
      const source = URL.createObjectURL(e.target.files[0]);
      setUrl(source);
    }
  };

  // This function is called when the user clicks the delete button
  // to delete their profile picture.
  const handleImageDelete = async (e) => {
    e.preventDefault();
    setPathProfilePicture("");
    setFile("");
    setUrl("");
  };

  // This function returns a boolean value that indicates if
  // the user introduced valid data for all the mandatory fields.
  const buttonCanBeActivated = () => {
    return (
      formData.emailValid &&
      formData.usernameValid &&
      formData.passwordValid &&
      formData.password_repeatValid
    );
  };

  // This function is called every time the user leaves a specific
  // mandatory input field and checks if the value introduced by
  // the user inside that field is compliant to the rules of that
  // type of data. However, it does not verify if the username or email
  // address already exist inside the database. This will be done only once
  // the submit button is pressed. It also calls the previously defined
  // buttonCanBeActivated() function to enable the submit button if this
  // returns true.
  const checkForIncorrectInput = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) {
          document.getElementById("email").style.outline = "2px solid red";
          document.getElementById("emailAttention").style.color = "red";
          document.getElementById("emailAttention").innerHTML =
            "Please provide a valid email! <br/>";
          formData.emailValid = false;
        } else {
          formData.emailValid = true;
        }
        break;
      case "username":
        if (formData.username.length < 5) {
          document.getElementById("username").style.outline = "2px solid red";
          document.getElementById("usernameAttention").style.color = "red";
          document.getElementById("usernameAttention").innerHTML =
            "Username must have at least 5 characters! <br/>";
          formData.usernameValid = false;
        } else {
          formData.usernameValid = true;
        }
        break;

      case "password":
        if (formData.password.length < 6) {
          document.getElementById("password").style.outline = "2px solid red";
          document.getElementById("passwordAttention").style.color = "red";
          document.getElementById("passwordAttention").innerHTML =
            "Password must have at least 6 characters! <br/>";
          formData.passwordValid = false;
        } else {
          formData.passwordValid = true;
        }
        if (
          formData.password_repeat.length > 0 &&
          formData.password.localeCompare(formData.password_repeat) !== 0
        ) {
          document.getElementById("passwordAttention").innerHTML =
            "The password does not match the repeated password! <br/>";
          formData.passwordValid = false;
        }
        break;

      case "password_repeat":
        if (formData.password.localeCompare(formData.password_repeat) !== 0) {
          document.getElementById("password_repeat").style.outline =
            "2px solid red";
          document.getElementById("password_repeatAttention").style.color =
            "red";
          document.getElementById("password_repeatAttention").innerHTML =
            "The repeated password is incorrect! <br/>";
          formData.password_repeatValid = false;
        } else {
          if (formData.password_repeat.length > 0)
            formData.password_repeatValid = true;
        }
        break;
    }

    if (buttonCanBeActivated()) {
      document.getElementById("register").removeAttribute("disabled");
    } else {
      document.getElementById("register").setAttribute("disabled", "");
    }
  };

  // This function sends the data of the user to the server
  // which will update the user data inside the database.
  // Once this is done successfully, it will navigate to the home page.
  const updateUser = async () => {
    try {
      let auxformData = formData;
      if (formData.password != "") {
        const hashedPassword = bcryptjs.hashSync(
          formData.password,
          numSaltRounds
        );
        auxformData.password = hashedPassword;
      } else {
        auxformData.password = initialFormData.password;
      }

      setformData(auxformData);

      const formAbcd = new FormData();
      formAbcd.append("appUserId", user);
      for (let formDataPiece in formData) {
        formAbcd.append(formDataPiece, formData[formDataPiece]);
      }
      let date = new Date().toString();
      formAbcd.append("date", date);

      formAbcd.append("isProfilePictureSelected", file != "");
      formAbcd.append("isTheSameProfilePicture", pathProfilePicture != "");
      if (file != "") {
        let extension = file.name.substring(
          file.name.lastIndexOf("."),
          file.name.length
        );
        let fileName = "" + formData.username + "_" + Date.now() + extension;
        formAbcd.append("file", file, fileName);
        formAbcd.append("fileName", fileName);
      }

      if (pathProfilePicture != "") {
        formAbcd.append("pathName", pathProfilePicture);
      }

      const response = await fetch(`http://${ipAddress}:${port}/editAccount`, {
        method: "POST",

        body: formAbcd,
      });

      navigate("/home", {
        state: {
          previousLocation: "",
          previousProduct: "",
          previousResults: [],
        },
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  // This function verifies the introduced username and email by
  // making a request to the server to check if they have not been
  // previously used by another user, but only if the user altered
  // their username or email. If they have been previously used,
  // messages are shown that ask the user to introduce another username
  // or email. If all the checks go well, updateUser() is called.
  const checkForm = async () => {
    try {
      let isEmailOk = true;
      let isUsernameOK = true;
      let response;
      let jsonData;
      if (formData.email != initialFormData.email) {
        response = await fetch(
          `http://${ipAddress}:${port}/checkEmail/${formData.email}`,
          {
            method: "GET",
          }
        );

        let jsonData = await response.json();
        if (jsonData[0].count == 0) {
          isEmailOk = true;
        } else {
          document.getElementById("emailAttention").style.color = "red";
          document.getElementById("emailAttention").innerHTML =
            "Email already exists. Please provide another email! <br/>";
          isEmailOk = false;
        }
      }
      if (formData.username != initialFormData.username) {
        response = await fetch(
          `http://${ipAddress}:${port}/checkUsername/${formData.username}`,
          {
            method: "GET",
          }
        );
        jsonData = await response.json();
        if (jsonData[0].count == 0) {
          isUsernameOK = true;
        } else {
          document.getElementById("usernameAttention").innerHTML =
            "Username already exists. Please provide another username.";
          isUsernameOK = false;
        }
      }
      if (isEmailOk && isUsernameOK) {
        updateUser();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // This fnction is called everytime a change occurs in one of the
  // input fields of the edit account form. The formData state variable is
  // updated accordingly. If an error message was previously displayed
  // due to an incorrect input in that specific field, once the user
  // begins to alter its content that message and
  // the red outline of the field should disappear.
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    document.getElementById(name).style.outline = "none";
    if (name !== "firstName" && name != "lastName") {
      let labelId = name + "Attention";
      document.getElementById(labelId).innerHTML = "";
    }

    setformData((prevformData) => ({
      ...prevformData,
      [name]: value,
    }));
  };

  // This function is called when the user clicks the Update button.
  // Prevents the default reload of the page and calls checkForm().
  const handleUpdate = (e) => {
    e.preventDefault();
    checkForm();

    e.preventDefault();
  };

  return (
    <div>
      <div class="container">
        <form>
          <fieldset id="fieldset">
            <div class="insideContainer">
              <h1>Edit Account</h1>

              <div>
                <label class="name" for="firstName">
                  <b>First name</b>
                </label>

                <input
                  class="inputFirstName"
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />

                <label class="name" for="lastName">
                  <b> Last name</b>
                </label>

                <input
                  class="inputLastName"
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <label id="emailAttention" for="email"></label>
              <label class="required" for="email">
                <b>Email</b>
              </label>

              <input
                type="text"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={checkForIncorrectInput}
                required
              />

              <label id="usernameAttention" for="username"></label>
              <label class="required" for="username">
                <b>Username</b>
              </label>
              <input
                type="text"
                placeholder="Enter username"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                onBlur={checkForIncorrectInput}
                required
              />

              <input
                type="checkbox"
                name="changePsw"
                id="changePsw"
                onChange={handleCheckBox}
              ></input>
              <label for="changePsw">I want to change my password.</label>
              <br />
              <div id="changePasswordSection">
                <label id="passwordAttention" for="password"></label>
                <label class="required" for="password">
                  <b> New password</b>
                </label>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={checkForIncorrectInput}
                  required
                />

                <label
                  id="password_repeatAttention"
                  for="password_repeat"
                ></label>
                <label class="required" for="psw-repeat">
                  <b>Repeat Password</b>
                </label>
                <input
                  type="password"
                  placeholder="Repeat Password"
                  name="password_repeat"
                  id="password_repeat"
                  value={formData.password_repeat}
                  onChange={handleInputChange}
                  onBlur={checkForIncorrectInput}
                  required
                />
              </div>

              <label>
                <b>Profile picture</b>
                <br />
                Here you can choose your profile picture.
              </label>
              <br />
              <br />
              <div class="imgSection" id="imgProfileSection">
                <img class="imgSmall" id="imgProfile" src="#" />
                <button
                  class="deletebtn"
                  id="btnProfile"
                  onClick={handleImageDelete}
                >
                  Delete image
                </button>
              </div>
              <br />
              <br />
              <br />
              <input
                type="file"
                id="pictures"
                name="pictures"
                value=""
                accept="image/png, image/gif, image/jpeg"
                onChange={handleFileChange}
              />
              <label
                id="file-input-label"
                for="pictures"
                onChange={handleFileChange}
              >
                Select a File
              </label>
              <br />
              <br />
              <br />

              <br />

              <button
                type="submit"
                class="formbtn"
                id="register"
                onClick={handleUpdate}
              >
                Update
              </button>
              <br />
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default EditAccount;
