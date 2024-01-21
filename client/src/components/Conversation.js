import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUniversalCookies, ipAddress, port } from "./SignIn";
import "./StyleConversation.css";
// Part of the html and css is taken from:: https://www.scaler.com/topics/chat-interface-project-css/

const Conversation = () => {
  // This variable stores the id of the current user.
  const user = getUniversalCookies().get("user");

  // The id of the interlocutor is saved from the location object.
  const location = useLocation();
  const stateData = location.state;
  const interlocutorId = stateData.interlocutor;

  // This variable will keep the id of the interlocutor if they
  // have the role of a customer in the conversation.
  const [customer, setCustomer] = useState("");

  // These two variables will hold the path to the profile pictures
  // of the current user and their interlocutor.
  const [currProfilePic, setCurrProfilePic] = useState("");
  const [intProfilePic, setIntProfilePic] = useState("");

  // This variable will hold the username of the interlocutor.
  const [intUsername, setIntUsername] = useState("");

  // Here I will store all the messages of this conversation.
  const [convMessages, setConvMessages] = useState([]);

  // This variable stores the data of the messages that is
  // currently written by the user.
  const [messageToBeSent, setMessageToBeSent] = useState({
    content: "",
    messageTimestamp: "",
    sender: user,
    receiver: interlocutorId,
  });

  // As a first step, the current user's data, the interlocutor data
  // and the messages must be retrieved from server.
  useEffect(() => {
    getBriefCurrData();
    getBriefIntData();
    getMessages();
  }, []);

  // Every time the user writes on their message
  // the message's timestamp updates.
  useEffect(() => {
    setMessageToBeSent((prevMessageToBeSent) => ({
      ...prevMessageToBeSent,
      ["messageTimestamp"]: Date.now(),
    }));
  }, [messageToBeSent.content]);

  // This function retrieves the user's profile picture path and
  // saves it in the currProfilePic state variable.
  const getBriefCurrData = async () => {
    try {
      const response = await fetch(
        `http://${ipAddress}:${port}/getBriefUserData/${user}`,
        {
          method: "GET",
        }
      );
      let jsonData = await response.json();
      setCurrProfilePic(jsonData.profile_picture_path);
    } catch (err) {
      console.error(err);
    }
  };

  // This function retrieves the interlocutor's profile picture path
  // and username and saves them into the variables.
  const getBriefIntData = async () => {
    try {
      const response = await fetch(
        `http://${ipAddress}:${port}/getBriefUserData/${interlocutorId}`,
        {
          method: "GET",
        }
      );
      let jsonData = await response.json();
      setIntUsername(jsonData.username);
      setIntProfilePic(jsonData.profile_picture_path);
    } catch (err) {
      console.error(err);
    }
  };

  // This function retrieves all the messages of the conversation,
  // saves them, and sends a post request to the server in order
  // to update the status of the previously unread messages to "read"
  // within the database. It also updates the customer variable and
  // displays the link element to view/write customer reviews if
  // the interlocutor is a customer. This can be easily done because
  // always the first message into a conversation must be written by
  // an interested customer.
  const getMessages = async () => {
    try {
      let response = await fetch(
        `http://${ipAddress}:${port}/getConversation/${user}/${interlocutorId}`,
        {
          method: "GET",
        }
      );
      let jsonData = await response.json();

      if (jsonData.length > 0) {
        await fetch(
          `http://${ipAddress}:${port}/updateMessagesStatus/${user}/${interlocutorId}`,
          {
            method: "POST",
          }
        );

        setConvMessages(jsonData);

        if (jsonData[0].sender == user) {
          document.getElementById("divCustomerReview").style.visibility =
            "hidden";

          setCustomer("");
        } else {
          document.getElementById("divCustomerReview").style.visibility =
            "visible";

          setCustomer(jsonData[0].sender);
        }
      } else {
        document.getElementById("divCustomerReview").style.visibility =
          "hidden";
      }
    } catch (err) {
      console.error(err);
    }
  };

  // This function is called every time the user is writing on their message.
  // It updates the content section of the messageToBeSent variable.
  const handleInputChange = (e) => {
    setMessageToBeSent((prevMessageToBeSent) => ({
      ...prevMessageToBeSent,
      ["content"]: e.target.value,
    }));
  };

  // This function is called every time the user clicks the send button
  // to upload their message. The message is sent to the server which
  // should save it into the database. The window is reloaded so that
  // the sent message will be displayed in the conversation.
  const handleSend = async (e) => {
    try {
      let response = await fetch(`http://${ipAddress}:${port}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageToBeSent),
      });

      let jsonData = await response.json();

      if ((jsonData.message = "ok")) {
        window.location = "/Conversation";
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* <-- Main container --> */}
      <div class="containerConv">
        {/* <!-- msg-header section starts --> */}
        <div class="msg-header">
          <div>
            {intProfilePic != "" ? (
              <img
                src={"http://" + ipAddress + ":" + port + intProfilePic}
                class="imgHeaderConv"
              />
            ) : (
              <img src="./no_picture_available.png" class="imgHeaderConv" />
            )}

            <div class="active">
              <br />
              <p>{intUsername}</p>
              <div id="divCustomerReview">
                <Link
                  to="/Leave Customer Review"
                  state={{ customer: customer }}
                >
                  <p>Write/view reviews </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* <!-- msg-header section ends --> */}

        {/* <!-- Chat inbox  --> */}
        <div class="chat-page">
          <div class="msg-inbox">
            <div class="chats">
              <b>Please refresh the page to see any new messages!</b>
              {/* <!-- Message container --> */}
              <div>
                {convMessages.map((message) => (
                  <div>
                    {message.sender == interlocutorId ? (
                      <div class="received-chats">
                        <div class="received-chats-img">
                          {intProfilePic != "" ? (
                            <img
                              src={
                                "http://" +
                                ipAddress +
                                ":" +
                                port +
                                intProfilePic
                              }
                              class="imgConversation "
                            />
                          ) : (
                            <img
                              src="./no_picture_available.png"
                              class="imgConversation "
                            />
                          )}
                        </div>
                        <br />
                        <div class="received-msg">
                          <div class="received-msg-inbox">
                            <p>{message.content}</p>
                            <span class="time">
                              {new Date(parseInt(message.message_timestamp))
                                .toString()
                                .substring(
                                  0,
                                  new Date(parseInt(message.message_timestamp))
                                    .toString()
                                    .indexOf("(")
                                )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div class="outgoing-chats">
                        <div class="outgoing-chats-img">
                          {currProfilePic != "" ? (
                            <img
                              src={
                                "http://" +
                                ipAddress +
                                ":" +
                                port +
                                currProfilePic
                              }
                              class="imgConversation "
                            />
                          ) : (
                            <img
                              src="./no_picture_available.png"
                              class="imgConversation "
                            />
                          )}
                        </div>
                        <br />
                        <div class="outgoing-msg">
                          <div class="outgoing-chats-msg">
                            <p>{message.content}</p>

                            <span class="time">
                              {/* The timestamp initially saved as milliseconds is converted
                               to a readable format according to the user's timezone.*/}
                              {new Date(parseInt(message.message_timestamp))
                                .toString()
                                .substring(
                                  0,
                                  new Date(parseInt(message.message_timestamp))
                                    .toString()
                                    .indexOf("(")
                                )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* <!-- msg-bottom section --> */}
                <div class="msg-bottom">
                  <div class="input-group">
                    <textarea
                      id="messageInput"
                      class="textarea-conv"
                      onChange={handleInputChange}
                      value={messageToBeSent.content}
                    ></textarea>
                    <button onClick={handleSend}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
