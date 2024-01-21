import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUniversalCookies, ipAddress, port } from "./SignIn";

/* This component displays the products that the current user already listed*/
const MyProducts = () => {
  // This variable stores the id of the current user.
  const user = getUniversalCookies().get("user");

  // This state variable will store the products once they are retrieved from the database.
  const [products, setProducts] = useState([]);

  // As a first step every time the user reaches this page, the products must be retrieved
  // from the database by calling the getProducts() function and the div container showing
  // the results must be made visible. The page should be refreshed when one of the products
  // has been updated.
  useEffect(() => {
    getProducts();
    document.getElementById("containerMyProd").style.visibility = "visible";
    const refresh = localStorage.getItem("refresh");
    if (refresh == "true") {
      localStorage.setItem("refresh", false);
      window.location.reload();
    }
  }, []);

  // This is called every time the user wants to delete a product
  // by clicking the product's delete button. The user is asked to
  // confirm if they really want to delete the product or not.
  // If they give their confirmation it will send a fetch with
  // a delete request to the server.
  const handleDelete = async (id) => {
    if (!window.confirm("Do you really want to delete this product?")) {
      window.location.reload(false);
      return;
    }
    try {
      const deleteProduct = await fetch(
        `http://${ipAddress}:${port}/delete/${id}`,
        {
          method: "DELETE",
        }
      );
      const response = await deleteProduct.json();

      window.location.reload(false);
    } catch (err) {
      console.error(err);
    }
  };

  // This function retrieves the products from the database
  // by sending a get request to the server. It saves the
  // array that contains the retrieved products inside the
  // products state variable.
  const getProducts = async () => {
    try {
      let response = await fetch(
        `http://${ipAddress}:${port}/getMyProducts/${user}`,
        {
          method: "GET",
        }
      );
      let jsonData = await response.json();
      let productsArray = [];

      for (let product of jsonData) {
        productsArray.push(product);
      }

      setProducts(productsArray);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="containerMyProd" class="containerResults">
      <b>
        These are your products:
        <br />
      </b>
      {/* Every product is displayed.*/}
      {products.map((product) => (
        <div class="containerSingleResult">
          <div>
            <span class="spanResults">
              <b>{product.title}</b>
            </span>
            <br />
            <span class="spanResults">{product.location}</span>

            <br />
            {/* The edit product button is a link to the EditProduct component. */}
            <Link to="/Edit product" state={{ product: product }}>
              <button class="editbtnMyProducts">Edit Product</button>
            </Link>

            <button
              class="deletebtnMyProducts"
              onClick={() => handleDelete(product.product_id)}
            >
              Delete Product
            </button>
            {product.picture_path_0 != "" ? (
              <img
                class="imgResults"
                src={
                  "http://" +
                  ipAddress +
                  ":" +
                  port +
                  "/" +
                  product.picture_path_0
                }
              />
            ) : (
              <img class="imgResults" src="./no_picture_available.png" />
            )}
            <br />
          </div>
        </div>
      ))}
    </div>
  );
};
export default MyProducts;
