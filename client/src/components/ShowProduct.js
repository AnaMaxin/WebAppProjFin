import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUniversalCookies, ipAddress, port } from "./SignIn";
import "./StyleConversation.css";

/* This component shows the details of a product once it is selected from the SearchBarAndResults component. */
const ShowProduct = () => {
  // This variable stores the id of the current user.
  const user = getUniversalCookies().get("user");

  // I used the useLocation React hook to get the product data
  // that is saved into the location object under state.
  const location = useLocation();
  const { product } = location.state;

  // This state variable will store the data of the user
  // who listed this product.
  const [ownerData, setOwnerData] = useState({
    profilePicturePath: "",
    username: "",
  });

  // Here all the reviews of the product, as they were retrieved from the database
  // will be stored.
  const [reviews, setReviews] = useState([]);

  // Here the details of the review of the current user will be saved.
  const [writtenReview, setWrittenReview] = useState({
    content: "",
    reviewTimestamp: "",
    reviewer: user,
    product: product.product_id,
  });

  // When the user accesses this component, the data of the product' owner
  // and the product reviews are saved into variables.The div element where
  // the user can leave their review and the button that permits the user to
  // abandon their review are hidden.
  useEffect(() => {
    getUserData();
    getReviews();
    document.getElementById("leaveReview").style.display = "none";
    document.getElementById("buttonExit").style.visibility = "hidden";
    if (user == product.owner) {
      document.getElementById("buttonLeaveReview").style.visibility = "hidden";
      document.getElementById("buttonConversation").style.visibility = "hidden";
    }
  }, []);

  // Every time the user alters the content of the review,
  // the review timestamp is updated.
  useEffect(() => {
    setWrittenReview((prevWrittenReview) => ({
      ...prevWrittenReview,
      ["reviewTimestamp"]: Date.now(),
    }));
  }, [writtenReview.content]);

  // This function sends a get request to retrieve the data of the product owner.
  // It saves the username and the path to the user's profile picture in order
  // to display them to the current user that views the product.
  const getUserData = async () => {
    try {
      let response = await fetch(
        `http://${ipAddress}:${port}/getUserData/${product.owner}`,
        {
          method: "GET",
        }
      );
      let userData = await response.json();

      let ownerDataAux = {
        username: userData.username,
        profilePicturePath: userData.profile_picture_path,
      };

      setOwnerData(ownerDataAux);
    } catch (err) {
      console.error(err);
    }
  };

  // This function collects the reviews, the reviewers' usernames,
  // and their paths to the profile pictures. It saves all this
  // data into the reviews variable.
  const getReviews = async () => {
    try {
      let response1 = await fetch(
        `http://${ipAddress}:${port}/getProductReviews/${product.product_id}`,
        {
          method: "GET",
        }
      );
      let jsonData1 = await response1.json();
      let reviewsData;
      reviewsData = jsonData1;

      let reviewsAux = [];

      if (reviewsData.length > 0) {
        for (let review of reviewsData) {
          let currentReview = {};

          currentReview.reviewer = review.reviewer;
          currentReview.content = review.content;
          let dateTime = new Date(parseInt(review.review_timestamp));

          dateTime = dateTime.toString();
          dateTime = dateTime.substring(0, dateTime.indexOf("("));

          currentReview.reviewTimestamp = dateTime;
          let response2 = await fetch(
            `http://${ipAddress}:${port}/getBriefUserData/${review.reviewer}`,
            {
              method: "GET",
            }
          );
          let jsonData2 = await response2.json();
          currentReview.reviewerUsername = jsonData2.username;
          currentReview.reviewerProfilePicturePath =
            jsonData2.profile_picture_path;
          reviewsAux.push(currentReview);
        }
      }

      setReviews(reviewsAux);
    } catch (err) {
      console.error(err);
    }
  };

  // This function is called when the user presses the "Leave Review" button.
  // It shows the box where the review can be written, hides the "Leave Review"
  // button and displays the "Exit Leave Review" buttton.
  const handleLeaveReview = (e) => {
    document.getElementById("leaveReview").style.display = "inline-block";
    document.getElementById("buttonLeaveReview").style.visibility = "hidden";
    document.getElementById("buttonExit").style.visibility = "visible";
  };

  // This function is called when the user presses the "Exit Leave Review"
  // button. It hides the review box and the "Exit Leave Review" button and
  // and shows the "Leave Review" button.
  const handleExitReview = (e) => {
    document.getElementById("leaveReview").style.display = "none";
    document.getElementById("buttonLeaveReview").style.visibility = "visible";
    document.getElementById("buttonExit").style.visibility = "hidden";
  };

  // This is called when the user writes into the review box and
  // updates writtenReview variable.
  const handleInputChange = (e) => {
    setWrittenReview((prevWrittenReview) => ({
      ...prevWrittenReview,
      ["content"]: e.target.value,
    }));
  };

  // This function is called when the user clicks the button to send
  // their reviews to the server and if this is successfull it reloads
  // the component. Once the component is reloaded it should display
  // the review of the user besides the other reviews.
  const handleSendReview = async () => {
    if (writtenReview.content.length > 0) {
      try {
        let response = await fetch(
          `http://${ipAddress}:${port}/sendProductReview`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(writtenReview),
          }
        );
        let jsonData = await response.json();

        if ((jsonData.message = "ok")) {
          window.location.reload(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  return (
    <div class="container">
      <div class="insideContainer">
        <div>
          <h2>{product.title}</h2>
        </div>

        <div>
          <h3>Produced by: </h3>
          <div>
            {ownerData.profilePicturePath !== "" ? (
              <img
                src={
                  "http://" +
                  ipAddress +
                  ":" +
                  port +
                  ownerData.profilePicturePath
                }
                class="imgConversation msgimg"
              />
            ) : (
              <img
                src="./no_picture_available.png"
                class="imgConversation msgimg"
              />
            )}

            <br />
            <b>{ownerData.username}</b>
          </div>
        </div>
        <br />
        <br />
        <div>
          <b>Location: </b>
          {product.location}
        </div>

        <div>
          <b>Price: </b>
          {product.price + " " + product.currency + "/" + product.unit}
        </div>
        <div>
          <b>Available quantity: </b>
          {product.quantity}
        </div>

        {product.description != "" && (
          <div>
            <b>Description: </b>
            {product.description}
          </div>
        )}

        <div>
          {product.picture_path_0 != "" && (
            <img
              class="imgSmall"
              src={
                "http://" +
                ipAddress +
                ":" +
                port +
                "/" +
                product.picture_path_0
              }
            />
          )}
        </div>
        <div>
          {product.picture_path_1 != "" && (
            <img
              class="imgSmall"
              src={
                "http://" +
                ipAddress +
                ":" +
                port +
                "/" +
                product.picture_path_1
              }
            />
          )}
        </div>
        <div>
          {product.picture_path_2 != "" && (
            <img
              class="imgSmall"
              src={
                "http://" +
                ipAddress +
                ":" +
                port +
                "/" +
                product.picture_path_2
              }
            />
          )}
        </div>
        <div>
          <h3>Contact producer via:</h3>

          <b>Phone number:</b>
          {product.phone_contact}
          <br />

          {product.email_contact != "" && (
            <div>
              <b>Email: </b>
              {product.email_contact}
            </div>
          )}
          <br />
          <div>
            {product.owner != user && (
              <b>
                Or contact them within the platform by clicking the button
                below:
              </b>
            )}
          </div>
          <br />
          <div id="buttonConversation">
            <Link to="/Conversation" state={{ interlocutor: product.owner }}>
              <button>Talk to the producer</button>
            </Link>
          </div>
        </div>
        <div>
          <h3>Reviews</h3>

          <div class="review-left">
            {reviews.map((review) => (
              <p>
                <div>
                  {review.reviewerProfilePicturePath != "" ? (
                    <img
                      src={
                        "http://" +
                        ipAddress +
                        ":" +
                        port +
                        review.reviewerProfilePicturePath
                      }
                      class="imgReview "
                    />
                  ) : (
                    <img src="./no_picture_available.png" class="imgReview" />
                  )}
                </div>
                <b>{review.reviewerUsername} </b>
                <br />
                <i>{review.reviewTimestamp}</i>
                <br />
                {review.content}
              </p>
            ))}
          </div>
        </div>
        <div class="prod-review" id="leaveReview">
          <textarea
            id="textarea-product-review"
            class="textarea-prod-review"
            onChange={handleInputChange}
            value={writtenReview.content}
          ></textarea>
          <button class="button-review" onClick={handleSendReview}>
            Send
          </button>
        </div>
        <br />
        <br />
        <div id="buttonLeaveReview">
          <button onClick={handleLeaveReview}>Leave a review</button>
        </div>
        <div id="buttonExit">
          <button onClick={handleExitReview}>Exit leave a review</button>
        </div>
      </div>
    </div>
  );
};

export default ShowProduct;
