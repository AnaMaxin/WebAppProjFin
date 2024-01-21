import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUniversalCookies, ipAddress, port } from "./SignIn";

/* This component allows the user to leave and read reviews of a particular customer. */
const CustomerReview = () => {
  // This variable stores the id of the current user.
  const user = getUniversalCookies().get("user");

  // The id of the customer is received into the location object.
  const location = useLocation();
  const stateData = location.state;
  const customer = stateData.customer;

  // Here the customer's username and path to profile picture will be saved.
  const [custUsername, setCustUsername] = useState("");
  const [custPathToProfilePic, setCustPathToProfilePic] = useState("");

  // The data of the review that the user will be writing will be saved here.
  const [writtenReview, setWrittenReview] = useState({
    content: "",
    reviewTimestamp: "",
    reviewer: user,
    customer: customer,
  });
  // Here will be saved all the customer reviews retrieved from the database.
  const [reviews, setReviews] = useState([]);

  // When the component loads the customer's username and profile picture path
  // should be retrieved, as well as all of the reviews given to them.
  useEffect(() => {
    getCustomerBriefData();
    getCustomerReviews();
  }, []);

  // Every time the user writes on their review, the review timestamp is updated.
  useEffect(() => {
    setWrittenReview((prevWrittenReview) => ({
      ...prevWrittenReview,
      ["reviewTimestamp"]: Date.now(),
    }));
  }, [writtenReview.content]);

  // This function retrieves the customer's username and profile picture path
  // from the server and saves it.
  const getCustomerBriefData = async () => {
    try {
      const response = await fetch(
        `http://${ipAddress}:${port}/getBriefUserData/${customer}`,
        {
          method: "GET",
        }
      );
      let jsonData = await response.json();

      setCustUsername(jsonData.username);
      setCustPathToProfilePic(jsonData.profile_picture_path);
    } catch (err) {
      console.error(err);
    }
  };

  // This function retrieves all the customer's reviews and the username
  // and profile picture path of each reviewer.
  const getCustomerReviews = async () => {
    try {
      let response1 = await fetch(
        `http://${ipAddress}:${port}/getCustomerReviews/${customer}`,
        {
          method: "GET",
        }
      );
      let jsonData1 = await response1.json();

      let reviewsData = jsonData1;
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

  // Every time the user writes on the review the content must be updated.
  const handleInputChange = (e) => {
    setWrittenReview((prevWrittenReview) => ({
      ...prevWrittenReview,
      ["content"]: e.target.value,
    }));
  };

  // This function is called when the user presses the send button to upload their review.
  // The window is reloaded to display the new review.
  const handleSendReview = async () => {
    try {
      let response = await fetch(
        `http://${ipAddress}:${port}/sendCustomerReview`,
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
  };
  return (
    <div>
      {/*  Main container */}
      <div class="containerConv">
        <div class="msg-header">
          <div>
            {custPathToProfilePic != "" ? (
              <img
                src={"http://" + ipAddress + ":" + port + custPathToProfilePic}
                class="imgHeaderConv"
              />
            ) : (
              <img src="./no_picture_available.png" class="imgHeaderConv" />
            )}

            <div class="active">
              <br />
              <p>{custUsername}</p>
              <div id="divCustomerReview">
                <Link to="/Conversation" state={{ interlocutor: customer }}>
                  <p>Back to conversation </p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div class="cust-review-left">
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
                    class="imgReview"
                  />
                ) : (
                  <img src="./no_picture_available.png" class="imgReview" />
                )}
              </div>
              <b>{review.reviewerUsername} </b>
              <br />
              {review.reviewTimestamp}
              <br />
              {review.content}
            </p>
          ))}
        </div>
        <div class="cust-review" id="leaveReview">
          <textarea
            id="textarea-review"
            class="textarea-cust-review"
            onChange={handleInputChange}
            value={writtenReview.content}
          ></textarea>
          <br />
          <button class="button-cust-review" onClick={handleSendReview}>
            Send
          </button>
          <br />
          <br />
        </div>
      </div>
    </div>
  );
};
export default CustomerReview;
