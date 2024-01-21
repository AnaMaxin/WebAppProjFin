import bcryptjs from "bcryptjs";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ipAddress, port } from "./SignIn";

/* This component enables the new users to sign up. */
const SignUp = () => {
  // This number will be used to encrypt the password of the user.
  const numSaltRounds = 8;

  // These state variables will store the file object
  // that represents the uploaded profile picture
  // and the url that was generated for that picture
  // to display it to the user.
  const [file, setFile] = useState("");
  const [url, setUrl] = useState("");

  // This is a state variable that stores the values introduced
  // by the user inside the sign up form and a few boolean values
  // that should indicate if the mandatory fields contain valid data.
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

  // Every time the page is first rendered, the submit button
  // should be disabled since the form is not filled yet.
  useEffect(() => {
    document.getElementById("register").setAttribute("disabled", "");
  }, []);

  // Every time the value of the file state variable changes,
  // the input element that facilitates file upload is made
  // visible or hidden depending on whether there is a file uploaded
  // alredy or not. One user is allowed to upload one or no profile picture.
  useEffect(() => {
    if (file != "") {
      document.getElementById("file-input-label").style.visibility = "hidden";
    } else {
      document.getElementById("file-input-label").style.visibility = "visible";
    }
  }, [file]);

  // Every time the url state variable changes, the function that is responsible
  // to display the picture is called, since that means that a change was made to
  // the uploaded profile picture.
  useEffect(() => {
    showImage();
  }, [url]);

  // This function displays the file that the user uploaded as a profile picture.
  // If there is no profile picture selected or if the user deleted the uploaded
  // picture, no picture should be displayed.
  const showImage = () => {
    const imgElement = document.getElementById("imgProfile");
    const imgSectionElement = document.getElementById("imgProfileSection");

    if (file != "") {
      imgSectionElement.style.display = "block";
      imgElement.src = url;
    } else {
      imgElement.src = "#";
      imgSectionElement.style.display = "none";
    }
  };

  // This function is called every time a file is uploaded within the form
  // as profile picture.
  // It updates the file and the url state variables.
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      const source = URL.createObjectURL(e.target.files[0]);
      setUrl(source);
    }
  };

  // This function is called when the user deletes the previously selected
  // profile picture. It prevents the default reload of the page and
  // assigns an empty string to  the file and the url variables.
  // This indicates that no profile picture is selected at the moment.
  const handleImageDelete = (e) => {
    e.preventDefault();

    setFile("");
    setUrl("");
  };

  // This function returns a boolean value that indicates if
  // the user introduced valid data for all the mandatory fields.
  const buttonCanBeActivated = () => {
    return (
      document.getElementById("agree").checked &&
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
  // return true.
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

  // This function is called when the user checks the checkbox
  // to show his agreement to the Terms and Conditions.
  // If buttonCanBeActivated() returns true, the submit butten is
  // enabled.
  const checkForButtonActivation = () => {
    if (buttonCanBeActivated()) {
      document.getElementById("register").removeAttribute("disabled");
    } else {
      document.getElementById("register").setAttribute("disabled", "");
    }
  };

  // This function is called once all the mandatory data was intruduced succesffuly.
  // It communicates with the server through a fetch post request and transmits the user data
  // that should be saved inside the database, as well as the profile picture that should be store
  // on the server to be easily retrieved whenever it is necessarily. If the server saves the user
  // successfully, the form is disabled so that the user cannot alter the introduced data and a message
  // will appear at the top of the page with a link to the Sign In page.
  const saveUser = async () => {
    try {
      // here the password is encrypted
      const hashedPassword = bcryptjs.hashSync(
        formData.password,
        numSaltRounds
      );

      // The encrypted (hashed) password is saved instead of the real password
      // within the formData state variable.
      let auxformData = formData;
      auxformData.password = hashedPassword;
      setformData(auxformData);

      // Here a FormData object is instantiated.
      // It will store all the data to be sent to
      // the server.
      const formAbcd = new FormData();
      for (let formDataPiece in formData) {
        formAbcd.append(formDataPiece, formData[formDataPiece]);
      }

      // The current date and time is also appended to the FormData object.
      // It will also be saved inside the database.
      let date = new Date().toString();
      formAbcd.append("date", date);

      // If the user uploaded a profile picture file, it will also be appended to the
      // FormData object and named according to the following patern "username_datetime_extension"
      // where username is the chosen username, datetime is the date and time expressed as milliseconds
      // since the epoch (January 1, 1970, UTC.)
      formAbcd.append("isProfilePictureSelected", file != "");
      if (file != "") {
        let extension = file.name.substring(
          file.name.lastIndexOf("."),
          file.name.length
        );
        let fileName = "" + formData.username + "_" + Date.now() + extension;

        formAbcd.append("file", file, fileName);
        formAbcd.append("fileName", fileName);
      }

      // Here the FormData object is send as body of a post fetch request.
      const response = await fetch(
        "http://" + ipAddress + ":" + port + "/saveUser",
        {
          method: "POST",

          body: formAbcd,
        }
      );
      if (response.status == 200) {
        document.getElementById("fieldset").setAttribute("disabled", "");
        document.getElementById("fieldset").style.opacity = "0.6";
        document.getElementById("success").style.visibility = "visible";
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // This function verifies the introduced username and email by
  // making a request to the server to check if they have not been
  // previously used by another user. If they have been previously used
  // messages are shown that ask the user to introduce another username
  // or email. If they are used for the first time, the saveUser() function is called.
  const checkForm = async () => {
    try {
      let response = await fetch(
        `http://${ipAddress}:${port}/checkEmail/${formData.email}`,
        {
          method: "GET",
        }
      );

      let jsonData = await response.json();
      if (jsonData[0].count > 0) {
        document.getElementById("emailAttention").style.color = "red";
        document.getElementById("emailAttention").innerHTML =
          "Email already exists. Please provide another email! <br/>";
        console.log("email is at fault");
      } else {
        response = await fetch(
          `http://${ipAddress}:${port}/checkUsername/${formData.username}`,
          {
            method: "GET",
          }
        );
        jsonData = await response.json();

        if (jsonData[0].count > 0) {
          document.getElementById("usernameAttention").style.color = "red";
          document.getElementById("usernameAttention").innerHTML =
            "Username already exists. Please provide another username.<br/>";
        } else {
          saveUser();
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // This fnction is called everytime a change occurs in one of the
  // input fields of the sign up form. The formData state variable is
  // updated accordingly. If an error message was previously displayed
  // due to an incorrect input in that specific field, once the user
  // begins to alter iys content that message and
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

  // This function is called every time the user clicks the submit button.
  // The default reload of the page is prevented and the checkForm() function
  // is called.
  const handleRegister = (e) => {
    e.preventDefault();

    checkForm();
    e.preventDefault();
  };
  return (
    <div>
      {/* This is the upper part of the page that will appear
      once the user signed up successfully.*/}
      <h3 id="success">
        You registered successfully!{" "}
        <Link class="links" to="/">
          {" "}
          Sign In{" "}
        </Link>
      </h3>
      {/* This is the div element that contains the form */}
      <div class="container">
        <form>
          <fieldset id="fieldset">
            <div class="insideContainer">
              <h1>Register</h1>
              <p>Please fill in this form to create an account.</p>
              <div>
                <label class="name" for="firstName">
                  <b>First name</b>
                </label>

                <input
                  class="inputFirstName"
                  type="text"
                  placeholder="Enter first name"
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
                  placeholder="Enter last name"
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
                placeholder="Enter Email"
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

              <label id="passwordAttention" for="password"></label>
              <label class="required" for="password">
                <b>Password</b>
              </label>
              <input
                type="password"
                placeholder="Enter Password"
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

              <label>
                <b>Profile picture</b>
                <br />
                Here you can choose yourprofile picture.
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

              <input
                type="checkbox"
                name="agree"
                id="agree"
                onChange={checkForButtonActivation}
              ></input>
              <label class="required" for="agree">
                I agree to the{" "}
                <Link class="links" to="/Terms and Privacy">
                  Terms & Privacy
                </Link>
              </label>
              <br />

              <button
                type="submit"
                class="formbtn"
                id="register"
                onClick={handleRegister}
              >
                Register
              </button>
              <br />
            </div>

            <div class="otherOption">
              <p>
                Already have an account?{" "}
                <Link class="links" to="/">
                  Sign in
                </Link>
                {/* <Outlet /> */}
              </p>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
