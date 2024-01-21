import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import AllConversations from "./components/AllConversations.js";
import Conversation from "./components/Conversation.js";
import CustomerReview from "./components/CustomerReview.js";
import EditAccount from "./components/EditAccount.js";
import EditProduct from "./components/EditProduct.js";
import ListProduct from "./components/ListProduct.js";
import MainFrame from "./components/MainFrame.js";
import MyProducts from "./components/MyProducts.js";
import SearchBarAndResults from "./components/SearchBarAndResults.js";
import ShowProduct from "./components/ShowProduct.js";
import SignIn from "./components/SignIn.js";
import SignUp from "./components/SignUp.js";
import "./components/Style.css";
import TermsAndPrivacy from "./components/TermsAndPrivacy.js";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route index element={<SignIn />} />
        <Route path="SignUp" element={<SignUp />} />
        <Route path="Terms and Privacy" element={<TermsAndPrivacy />} />
        <Route
          path="Edit Account"
          element={
            <div>
              <MainFrame />
              <EditAccount />
            </div>
          }
        />
        <Route
          path="My products"
          element={
            <div>
              <MainFrame />
              <MyProducts />
            </div>
          }
        />
        <Route
          path="/Edit product"
          element={
            <div>
              <MainFrame />
              <EditProduct />
            </div>
          }
        />

        <Route
          path="/Show product"
          element={
            <div>
              <MainFrame />
              <ShowProduct />
            </div>
          }
        />

        <Route
          path="Home"
          element={
            <div>
              <SearchBarAndResults />
            </div>
          }
        />
        <Route
          path="List product"
          element={
            <div>
              <MainFrame />

              <ListProduct />
            </div>
          }
        />
        <Route
          path="All conversations"
          element={
            <div>
              <MainFrame />

              <AllConversations />
            </div>
          }
        />

        <Route
          path="/Conversation"
          element={
            <div>
              <MainFrame />

              <Conversation />
            </div>
          }
        />

        <Route
          path="/Leave Customer Review"
          element={
            <div>
              <MainFrame />

              <CustomerReview />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
