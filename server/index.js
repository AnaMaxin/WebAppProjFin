const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const pool = require("./db");
const fs = require("fs");

// middleware
// This specifies that incoming requests should be parsed
// with JSON payloads and is based on body-parser.
app.use(express.json());

// Cors enables open access across domain boundaries.
app.use(cors());

// It enables the server to serve static files and sets
// the root directory to __dirname(this is the absolute
// path of the directory containing the current file)
app.use(express.static(__dirname));

// Using multer to upload multiple files.
// This will be used to save the pictures
// with products. Save the files under their
// original names.
const storageFolder1 = "./Pictures/Products/";
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storageFolder1);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadMultiple = multer({ storage: storage1 });
// This will be used to save the correct path where the files are stored
const pathToStorageFolder1 = "/Pictures/Products/";

// Using multer to upload single files.
// This will be used to save the profile pictures.
const storageFolder2 = "./Pictures/Profile/";
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storageFolder2);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage2 });
// This will be used to save the correct path.
const pathToStorageFolder2 = "/Pictures/Profile/";

// Set listening port to 5000.
// Show message on the console to confirm it started.
app.listen(5000, () => {
  console.log("server has started on port 5000");
});

// Get the email as paramater.
// Make a postgresql query to count the entries that
// have the given email. Send the query result to client
// in json format.
app.get("/checkEmail/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const queryResult = await pool.query(
      "SELECT COUNT(*) FROM app_user WHERE email = $1",
      [email]
    );
    res.json(queryResult.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// The same process, but for username instead of email.
app.get("/checkUsername/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const queryResult = await pool.query(
      "SELECT COUNT(*) FROM app_user WHERE username = $1",
      [username]
    );
    res.json(queryResult.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Get the user data from the body of the request.
// Upload the profile picture, that comes under the "file" field.
// Save the data into the database inside the app_user table.
app.post("/saveUser", upload.single("file"), async (req, res) => {
  try {
    // get user data from the body of the request
    const data = req.body;

    // The profile picture path that will be saved inside the database.
    let path = "";

    // If the user chose a profile picture save the correct path.
    if (data.isProfilePictureSelected == "true") {
      path = "" + pathToStorageFolder2 + data.fileName;
    }

    // save user into datbase
    const response = await pool.query(
      "INSERT INTO app_user (first_name, last_name, email, username, password, date, profile_picture_path) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        data.firstName,
        data.lastName,
        data.email,
        data.username,
        data.password,
        data.date,
        path,
      ]
    );
    res.json(response);
  } catch (err) {
    console.error(err.message);
  }
});

// Edit user data inside the database.
app.post("/editAccount", upload.single("file"), async (req, res) => {
  try {
    // Get the data from the body of the request.
    const data = req.body;

    // save the correct profile picture path
    let path = "";
    if (data.isProfilePictureSelected == "true") {
      path = "" + pathToStorageFolder2 + data.fileName;
    }

    // If user kept the same profile picture, save the
    // old profile picture path.
    if (data.isTheSameProfilePicture == "true") {
      path = data.pathName;
    }

    // Get the old profile picture path.
    // We need this to delete the file if a new one has been received.
    const result = await pool.query(
      "SELECT profile_picture_path FROM app_user WHERE app_user_id=$1",
      [data.appUserId]
    );

    // Update the user data inside the database.
    const response = await pool.query(
      "UPDATE app_user SET first_name=$1, last_name=$2, email=$3, username=$4, password=$5, date=$6, profile_picture_path=$7 WHERE app_user_id=$8 RETURNING *",
      [
        data.firstName,
        data.lastName,
        data.email,
        data.username,
        data.password,
        data.date,
        path,
        data.appUserId,
      ]
    );

    // If the user chose a new profile picture, delete the old one.
    if (data.isTheSameProfilePicture == "false") {
      try {
        fs.unlinkSync("." + result.rows[0].profile_picture_path);
        console.log("File deleted!");
      } catch (err) {
        console.error(err.message);
      }
    }

    res.json(response);
  } catch (err) {
    console.error(err.message);
  }
});

// Check if the account introduced by user exists, and if it does,
// send back the user' id and encrypted password.
app.get("/checkAccount/:account", async (req, res) => {
  try {
    // Get the account from the parameter.
    const { account } = req.params;

    // Count how many app_user entities with this account are in the database.
    const queryResult = await pool.query(
      "SELECT COUNT(*) FROM app_user WHERE username = $1 OR email = $1",
      [account]
    );

    // An empty string will be sent as response if the account does not exist.
    let response = "";

    // If the account exists (there are more than 0 entities),
    // get the id and the encrypted password for that account.
    if (queryResult.rows[0].count != 0) {
      const userIdAndPasswordResponse = await pool.query(
        "SELECT app_user_id, password FROM app_user WHERE username = $1 OR email=$1",
        [account]
      );
      response = userIdAndPasswordResponse.rows[0];
    }

    // send response
    res.json(response);
  } catch (err) {
    console.error(err.message);
  }
});

// Save product into the database and upload product pictures.
app.post("/listProduct", uploadMultiple.array("files"), async (req, res) => {
  // get product data from the body
  const data = req.body;

  // Save the correct file paths for the images.
  let paths = ["", "", ""];
  if (data.numberOfSelectedFiles > 0) {
    if (data.numberOfSelectedFiles > 1) {
      for (let i = 0; i < data.numberOfSelectedFiles; i++) {
        paths[i] = pathToStorageFolder1 + data.fileNames[i];
      }
    } else {
      paths[0] = pathToStorageFolder1 + data.fileNames;
    }
  }

  // save product into the database
  const response = await pool.query(
    "INSERT INTO product (owner, title, location, email_contact, phone_contact, price, currency, unit, quantity, description, date, picture_path_0, picture_path_1, picture_path_2) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
    [
      data.app_user,
      data.title,
      data.location,
      data.emailContact,
      data.phoneContact,
      data.price,
      data.currency,
      data.unit,
      data.quantity,
      data.description,
      data.date,
      paths[0],
      paths[1],
      paths[2],
    ]
  );

  res.json("");
});

// send all the products listed by user
app.get("/getMyProducts/:user", async (req, res) => {
  // get user id from params
  const { user } = req.params;

  // get all the products of this user from product table
  const queryResult = await pool.query(
    "SELECT * FROM product WHERE owner = $1",
    [user]
  );

  // send query result
  res.json(queryResult.rows);
});

// Delete product with a given id from database.
app.delete("/delete/:id", async (req, res) => {
  try {
    // get product id
    const { id } = req.params;

    // get the paths to product pictures
    const result = await pool.query(
      "SELECT  picture_path_0, picture_path_1, picture_path_2 FROM product WHERE product_id=$1",
      [id]
    );

    // save the correct paths
    let pic0 = "." + result.rows[0].picture_path_0;
    let pic1 = "." + result.rows[0].picture_path_1;
    let pic2 = "." + result.rows[0].picture_path_2;

    // delete the files containing the product pictures
    if (pic0.length > 1) {
      try {
        fs.unlinkSync(pic0);
      } catch (err) {}
      if (pic1.length > 1) {
        try {
          fs.unlinkSync(pic1);
        } catch (err) {}
        if (pic2.length > 1) {
          try {
            fs.unlinkSync(pic2);
          } catch (err) {}
        }
      }
    }

    // Delete all the reviews of this product
    await pool.query("DELETE FROM product_review WHERE product = $1", [id]);
    // Delete product from database
    await pool.query("DELETE FROM product WHERE product_id = $1", [id]);

    // send response
    res.json("Product was deleted.");
  } catch (err) {
    console.error(err);
  }
});

// save changes made by user to their product
// upload new product images
app.post("/editProduct", uploadMultiple.array("files"), async (req, res) => {
  // get product data from body
  const data = req.body;

  // get the old picture paths
  const result = await pool.query(
    "SELECT  picture_path_0, picture_path_1, picture_path_2 FROM product WHERE product_id=$1",
    [data.product_id]
  );

  let pic0 = "." + result.rows[0].picture_path_0;
  let pic1 = "." + result.rows[0].picture_path_1;
  let pic2 = "." + result.rows[0].picture_path_2;

  // save the new picture paths
  let paths = ["", "", ""];
  if (data.numberOfSelectedFiles > 0) {
    // if only one picture is selected that is a special case
    if (data.numberOfSelectedFiles > 1) {
      for (let i = 0; i < data.numberOfSelectedFiles; i++) {
        paths[i] = pathToStorageFolder1 + data.fileNames[i];
      }
    } else {
      paths[0] = pathToStorageFolder1 + data.fileNames;
    }
  }

  // update product data inside the database
  const response = await pool.query(
    "UPDATE product SET title=$1, location=$2, email_contact=$3, phone_contact=$4, price=$5, currency=$6, unit=$7, description=$8, date=$9, picture_path_0=$10, picture_path_1=$11, picture_path_2=$12 WHERE product_id=$13 RETURNING *",
    [
      data.title,
      data.location,
      data.emailContact,
      data.phoneContact,
      data.price,
      data.currency,
      data.unit,
      data.description,
      data.date,
      paths[0],
      paths[1],
      paths[2],
      data.product_id,
    ]
  );

  // Delete the old product pictures.
  if (pic0.length > 1) {
    try {
      fs.unlinkSync(pic0);
    } catch (err) {}
    if (pic1.length > 1) {
      try {
        fs.unlinkSync(pic1);
      } catch (err) {}
      if (pic2.length > 1) {
        try {
          fs.unlinkSync(pic2);
        } catch (err) {}
      }
    }
  }

  res.json({ message: "Ok" });
});

// send the user data from database
app.get("/getUserData/:user", async (req, res) => {
  // get user id
  const { user } = req.params;

  // get user data from database
  const queryResult = await pool.query(
    "SELECT * FROM app_user WHERE app_user_id=$1",
    [user]
  );

  // send query result
  res.json(queryResult.rows[0]);
});

// send all the products that match the params
app.get("/searchResults/:product/:location", async (req, res) => {
  // get the params
  let product = req.params.product;
  let location = req.params.location;

  // if one of the params was set to "noInput" that means the user
  // left that search field empty
  if (product == "noInput") {
    const queryResult = await pool.query(
      `SELECT * FROM product WHERE Location ILIKE '%'|| $1||'%';`,
      [location]
    );
    res.json(queryResult.rows);
  } else {
    if (location == "noInput") {
      const queryResult = await pool.query(
        `SELECT * FROM product WHERE title ILIKE '%'|| $1||'%';`,
        [product]
      );
      res.json(queryResult.rows);
    } else {
      const queryResult = await pool.query(
        `SELECT * FROM product WHERE title ILIKE '%'|| $1||'%' AND Location ILIKE '%'|| $2||'%';`,
        [product, location]
      );

      res.json(queryResult.rows);
    }
  }
});

// send the username and psh to profile picture of the user with a specified id
app.get("/getBriefUserData/:user", async (req, res) => {
  // get user id from params
  const { user } = req.params;

  // get query result
  const queryResult = await pool.query(
    "SELECT username, profile_picture_path FROM app_user WHERE app_user_id=$1",
    [user]
  );
  // send query result
  res.json(queryResult.rows[0]);
});

// send all the messages between two specified users
app.get("/getConversation/:participant1/:participant2", async (req, res) => {
  // get the conversation participants ids
  let participant1 = req.params.participant1;
  let participant2 = req.params.participant2;

  // participant1 must have the smaller id, that is how they are
  // stored in the conversation table.
  if (participant2 < participant1) {
    [participant1, participant2] = [participant2, participant1];
  }

  // check if the two participants had a conversation before by counting the
  // entities from the conversation table that have these two participants
  const queryResult1 = await pool.query(
    `SELECT COUNT(*) FROM conversation WHERE participant1=$1 AND participant2=$2;`,
    [participant1, participant2]
  );

  // if there was no previous conversation between the two, send an empty string as result,
  // else select their conversation id, get all the messages from the message table which have
  // that specific conversation id and send to the client them as a response to the get request
  if (queryResult1.rows[0].count == 0) {
    res.json("");
  } else {
    const queryResult2 = await pool.query(
      `SELECT conversation_id FROM conversation WHERE participant1=$1 AND participant2=$2;`,
      [participant1, participant2]
    );
    const conversation_id = queryResult2.rows[0].conversation_id;

    const queryResult3 = await pool.query(
      "SELECT * FROM message WHERE conversation=$1 ORDER BY message_timestamp;",
      [conversation_id]
    );

    res.json(queryResult3.rows);
  }
});

// save a new message into the database
app.post("/sendMessage", async (req, res) => {
  // get the message data from the body of the request
  const data = req.body;

  // compare the ids of the sender and receiver and save the smaller one into the
  // participant1 variable, we need this to search/save the correct conversation
  // entity
  let participant1, participant2;
  if (data.sender < data.receiver) {
    participant1 = data.sender;
    participant2 = data.receiver;
  } else {
    participant1 = data.receiver;
    participant2 = data.sender;
  }

  // check if the participants had a previous conversation
  const queryResult1 = await pool.query(
    `SELECT COUNT(*) FROM conversation WHERE participant1=$1 AND participant2=$2;`,
    [participant1, participant2]
  );

  // if this is their first conversation, save this conversation into the conversation table
  if (queryResult1.rows[0].count == 0) {
    const queryResult2 = await pool.query(
      `INSERT INTO conversation (participant1, participant2) VALUES($1, $2) RETURNING*`,
      [participant1, participant2]
    );
  }

  // get the id of the conversation
  const queryResult3 = await pool.query(
    `SELECT conversation_id FROM conversation WHERE participant1=$1 AND participant2=$2;`,
    [participant1, participant2]
  );
  const conversation_id = queryResult3.rows[0].conversation_id;

  // save the message with the correct conversation id
  const queryResult4 = await pool.query(
    "INSERT INTO message (conversation, sender, receiver, content, message_timestamp) VALUES($1, $2, $3, $4, $5) RETURNING*",
    [
      conversation_id,
      data.sender,
      data.receiver,
      data.content,
      data.messageTimestamp,
    ]
  );
  res.json({ message: "ok" });
});

// send all the conversations in which the given user is involved
app.get("/getAllConversations/:user", async (req, res) => {
  // get the user id from the rquest params
  let user = req.params.user;

  // count how the number of conversations in which the user is involved
  const queryResult1 = await pool.query(
    `SELECT COUNT(*) FROM conversation WHERE participant1=$1 OR participant2=$1;`,
    [user]
  );

  // if they had no conversation, send an empty string as a response
  // otherwise select all of their conversations and send them as response
  if (queryResult1.rows[0].count == 0) {
    res.json("");
  } else {
    const queryResult2 = await pool.query(
      `SELECT conversation_id, participant1, participant2 FROM conversation WHERE participant1=$1 OR participant2=$1;`,
      [user]
    );
    res.json(queryResult2.rows);
  }
});

// send all the reviews that were given to a specific product
app.get("/getProductReviews/:product", async (req, res) => {
  // get product id from the request params
  let product = req.params.product;
  // select the product reviews from the database
  const queryResult = await pool.query(
    `SELECT * FROM product_review WHERE product=$1;`,
    [product]
  );

  // send them to the client
  res.json(queryResult.rows);
});

// save a new product review into the database
app.post("/sendProductReview", async (req, res) => {
  // get the review data from the request body
  const data = req.body;
  // save the review
  const queryResult = await pool.query(
    `INSERT INTO product_review (product, reviewer, review_timestamp, content) VALUES($1, $2, $3, $4) RETURNING*`,
    [data.product, data.reviewer, data.reviewTimestamp, data.content]
  );

  // send a confirmation message
  res.json({ message: "ok" });
});

// send all the reviews given to a specified customer
app.get("/getCustomerReviews/:customer", async (req, res) => {
  // get user id from the request params
  let customer = req.params.customer;
  //select the reviews and send them back to the client
  const queryResult = await pool.query(
    `SELECT * FROM customer_review WHERE customer=$1;`,
    [customer]
  );
  res.json(queryResult.rows);
});

// save a customer review
app.post("/sendCustomerReview", async (req, res) => {
  // get data from the body of the request
  const data = req.body;

  // save the review into the customer_review table of the database
  const queryResult = await pool.query(
    `INSERT INTO customer_review (customer, reviewer, review_timestamp, content) VALUES($1, $2, $3, $4) RETURNING*`,
    [data.customer, data.reviewer, data.reviewTimestamp, data.content]
  );
  res.json({ message: "ok" });
});

// update the status of all the messages with a particular sender and receiver from unread to read
app.post("/updateMessagesStatus/:receiver/:sender", async (req, res) => {
  // get the sender and receiver
  let receiver = req.params.receiver;
  let sender = req.params.sender;

  // update the messages
  const queryResult = await pool.query(
    `UPDATE message SET status='read' WHERE receiver=$1 AND sender=$2 RETURNING*`,
    [receiver, sender]
  );
  res.json(queryResult);
});

// count and send how many unread messages are there with a specified sender and receiver
app.get("/countUnreadMessages/:receiver/:sender", async (req, res) => {
  // get the ids of the sender and receiver
  let receiver = req.params.receiver;
  let sender = req.params.sender;

  // count the unread messages and send the result
  const queryResult = await pool.query(
    `SELECT COUNT (*) FROM message WHERE receiver=$1 AND sender=$2 AND status='unread';`,
    [receiver, sender]
  );

  res.json(queryResult.rows[0]);
});
