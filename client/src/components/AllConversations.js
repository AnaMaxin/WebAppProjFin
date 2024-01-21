import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUniversalCookies, ipAddress, port } from "./SignIn";

/* This component shows all the conversations the user is involved into. */
const AllConversations = () => {
  // This variable stores the id of the current user.
  const user = getUniversalCookies().get("user");

  // Here will be stored all the conversations
  // that will be retrived from the server.
  const [conversations, setConversations] = useState([]);

  // When the user accesses this component all their conversations should
  // be loaded from the server.
  useEffect(() => {
    getAllConversations();
  }, []);

  // This function makes a get request and should receive the conversations
  // from the database. For each conversation, the interlocutor's username and the path to their
  // profile picture should be retrieved, as well as the number of unread messages
  // in each conversation. All this data is saved into the conversations variable.
  const getAllConversations = async () => {
    try {
      const response1 = await fetch(
        `http://${ipAddress}:${port}/getAllConversations/${user}`,
        {
          method: "GET",
        }
      );
      let jsonData1 = await response1.json();

      let conversationData;
      if (jsonData1.length > 0) {
        conversationData = jsonData1;
      }

      let conversationsAux = [];

      for (let conversation of conversationData) {
        let currentConversation = {};

        if (conversation.participant1 == user) {
          currentConversation.intId = conversation.participant2;
        } else {
          currentConversation.intId = conversation.participant1;
        }

        const response2 = await fetch(
          `http://${ipAddress}:${port}/getBriefUserData/${currentConversation.intId}`,
          {
            method: "GET",
          }
        );
        let jsonData2 = await response2.json();
        currentConversation.intUsername = jsonData2.username;
        currentConversation.intProfilePicturePath =
          jsonData2.profile_picture_path;

        let response3 = await fetch(
          `http://${ipAddress}:${port}/countUnreadMessages/${user}/${currentConversation.intId}`,
          {
            method: "GET",
          }
        );

        let jsonData3 = await response3.json();

        currentConversation.countUnreadMessages = jsonData3.count;

        conversationsAux.push(currentConversation);
      }

      setConversations(conversationsAux);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div class="containerAllConv">
      <ul>
        {/* Each conversation is displayed as a li element 
        and as a Link to the Conversation component */}
        {conversations.map((conversation) => (
          <Link
            class="link-react"
            to="/Conversation"
            state={{ interlocutor: conversation.intId }}
          >
            <li>
              <div class="liConversation">
                {conversation.intProfilePicturePath != "" ? (
                  <img
                    src={
                      "http://" +
                      ipAddress +
                      ":" +
                      port +
                      conversation.intProfilePicturePath
                    }
                    class="imgConvList"
                  />
                ) : (
                  <img src="./no_picture_available.png" class="imgConvList" />
                )}
                <br />
                <span class="spanConversation">
                  <b>{conversation.intUsername} </b> <br />{" "}
                  {parseInt(conversation.countUnreadMessages) > 0 && (
                    <b class="newMessage">
                      {"New messages: " + conversation.countUnreadMessages}
                    </b>
                  )}
                </span>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default AllConversations;
