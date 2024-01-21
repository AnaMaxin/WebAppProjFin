import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MainFrame from "./MainFrame.js";
import "./SearchBar.css";

import { ipAddress, port } from "./SignIn";

/* This component allows the user
  to search for products. */

const SearchBarAndResults = () => {
  // This is a React hook used to navigate directly to a path
  const navigate = useNavigate();

  // This is a React hook that returns the location object
  const location = useLocation();

  // Using the location object we get the state values.
  // Every time we access "./Home" we have to declare these state values.
  const previousResults = location.state.previousResults;
  const previousLocation = location.state.previousLocation;
  const previousProduct = location.state.previousProduct;

  // This constant variable is holding the search results.
  const results = previousResults;

  // These variables store the input typed by the user into the search fields.
  // We update their values using the useState React hook.
  const [searchedProduct, setSearchedProduct] = useState(previousProduct);
  const [searchedLocation, setSearchedLocation] = useState(previousLocation);

  // These variables store the lists of products and locations that will appear as search suggestions to the user.
  const products = [
    "apple",
    "orange",
    "lemon",
    "cabbage",
    "onion",
    "asparagus",
    "potato",
    "tomato",
    "spinach",
    "carrot",
    "peas",
    "celery",
    "beans",
    "pumpkin",
    "cucumber",
    "broccoli",
    "apricots",
    "avocado",
    "bananas",
    "blueberries",
    "cherries",
    "grapes",
    "lemons",
    "mangos",
    "mulberries",
    "olives",
    "peaches",
    "pears",
    "peppers",
    "plums",
    "pomegranates",
    "pineapples",
    "strawberries",
    "tangerines",
    "watermelon",
    "cheese",
    "milk",
    "eggs",
  ].sort();
  const locations = [
    "Rothenburg ob der Tauber, Bavaria",
    "Görlitz, Saxony",
    "Bad Wimpfen, Baden-Württemberg",
    "Marburg, Hesse",
    "Piber, Styria",
    "Tremosine sul Garda, Italy",
    "Terricciola, Italy",
    "Quedlinburg, Saxony-Anhalt",
    "Ahrenshoop, Mecklenburg-Western Pomerania",
  ].sort();

  // These variables store the updated search suggestions, as they are updated to match the typed inputs.
  // They are initialized with the alphabetically-sorted suggestions lists.
  let products1 = products;
  let locations1 = locations;

  // useEffect is a React hook. As it is used here, it will run the code
  // when the component is first rendered. I used this hook, because
  // otherwise, if the code is written outside of it, getElementById() returns null.
  // If there are search results, the div container which displays them
  // should become visible.
  useEffect(() => {
    if (results.length > 0) {
      document.getElementById("divResults").style.visibility = "visible";
    }
  }, []);

  // The handleChange function will be called every time a change occurs in the
  // search fields. It will update the state variables that store the searched inputs
  // to the content of the serach input fields. Based on the name of the input elements
  // that triggered this function, the correct state variable is chosen to be updated.
  const handleChange = (e) => {
    if (e.target.name == "product") {
      setSearchedProduct(e.target.value);
    } else {
      setSearchedLocation(e.target.value);
    }
  };

  // The handleClick function is called when the user selects one of the
  // search suggestions. It updates the values of the search input variables
  // according to the selected suggestion.
  const handleClick = (e) => {
    if (e.target.id == "clickedProduct") {
      setSearchedProduct(e.target.innerHTML);
    } else {
      setSearchedLocation(e.target.innerHTML);
    }
  };

  // These section is responsible to get rid of those search suggestions
  // which are not compliant to the typed inputs.
  if (searchedProduct.length > 0) {
    products1 = products.filter((product) => {
      if (product != searchedProduct && product.startsWith(searchedProduct)) {
        return product;
      }
    });
  } else {
    products1 = products;
  }

  if (searchedLocation.length > 0) {
    locations1 = locations.filter((location) => {
      if (
        location != searchedLocation &&
        location.startsWith(searchedLocation)
      ) {
        return location;
      }
    });
  } else {
    locations1 = locations;
  }

  // This function is triggered every time the user clicks inside
  // the area of the input fields. It will bring the visual focus
  // to the search fields, by changing the opacity of the already shown
  // results and displaying the search suggestions. Also, it will disable
  // the links to each product.
  const handleFocus = () => {
    document.getElementById("trSuggestions").style.display = "table-row";
    const elements = document.getElementsByClassName("linkElements");

    for (var index = 0; index < elements.length; index++) {
      elements[index].style.opacity = "0.4";
      elements[index].style.pointerEvents = "none";
    }
  };

  // This async function is responsible to get the results that match
  // the searched words. It communicates to the server through a fetch
  // request, which in turn accesses the database and sends the results.
  // It accesses the current "/Home" path providing the results and searched
  // inputs as state values inside the location object. I chose this method
  // to allow the user to reach the previously searched results after viewing
  // one single product from the given results.
  const searchResults = async () => {
    try {
      let resultsArray = [];
      const substitute = "noInput";

      if (searchedLocation != "" && searchedProduct != "") {
        const response = await fetch(
          `http://${ipAddress}:${port}/searchResults/${searchedProduct}/${searchedLocation}`,
          {
            method: "GET",
          }
        );
        resultsArray = await response.json();
      } else if (searchedProduct == "" && searchedLocation != "") {
        const response = await fetch(
          `http://${ipAddress}:${port}/searchResults/${substitute}/${searchedLocation}`,
          {
            method: "GET",
          }
        );
        resultsArray = await response.json();
      } else if (searchedProduct != "" && searchedLocation == "") {
        const response = await fetch(
          `http://${ipAddress}:${port}/searchResults/${searchedProduct}/${substitute}`,
          {
            method: "GET",
          }
        );
        resultsArray = await response.json();
      }

      navigate("/home", {
        state: {
          previousLocation: searchedLocation,
          previousProduct: searchedProduct,
          previousResults: resultsArray,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // This function is called every time the user clicks the search button.
  // It makes the results div container visible, hides the search suggestions,
  // calls searchResults(), changes the opacity of the results and reactivates
  // the links that enable the user to select and view one single result in detail.
  const handleButtonClick = () => {
    document.getElementById("divResults").style.visibility = "visible";
    document.getElementById("trSuggestions").style.display = "none";

    try {
      searchResults();
    } catch (err) {
      console.error(err);
    }

    const elements = document.getElementsByClassName("linkElements");
    for (var index = 0; index < elements.length; index++) {
      elements[index].style.opacity = "1";
      elements[index].style.pointerEvents = "";
    }
  };

  // The HTML structure that renders every time the SearchBarAndResults component is calle.
  return (
    <div>
      <MainFrame />
      {/* The search bar container. 
      It is structured as a table.*/}
      <div class="containerSearchBar">
        <table class="tableSearchBar">
          <tbody>
            <tr>
              <th class="thSearchBar">
                <input
                  class="inputSearchBar"
                  name="product"
                  type="search"
                  placeholder="Products"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  value={searchedProduct}
                />
              </th>
              <th class="thSearchBar">
                <input
                  class="inputSearchBar"
                  name="location"
                  type="search"
                  placeholder="Location"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  value={searchedLocation}
                />
              </th>
              <th class="thSearchBar">
                <button class="buttonSearchBar" onClick={handleButtonClick}>
                  <img src={require("./Static_Images/magnifier.png")} />
                </button>
              </th>
            </tr>
            <tr id="trSuggestions">
              <td class="tdProductsSearchBar">
                <ul class="ulSearchBar">
                  {products1.map((product) => (
                    <li
                      class="liSearchBar"
                      id="clickedProduct"
                      onClick={handleClick}
                    >
                      {product}
                    </li>
                  ))}
                </ul>
              </td>
              <td class="tdProductsSearchBar">
                <ul class="ulSearchBar">
                  {locations1.map((location) => (
                    <li
                      class="liSearchBar"
                      id="clickedLocation"
                      onClick={handleClick}
                    >
                      {location}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* The results container*/}
      <div class="containerResults" id="divResults">
        <h3>
          Results:
          <br />
        </h3>
        {results.length == 0 && <p>No results found...</p>}

        {results.map((result) => (
          <Link
            class="linkElements"
            to="/Show product"
            state={{ product: result }}
          >
            <div class="containerSingleResult">
              <span class="spanResults">
                <b>{result.title}</b>
              </span>
              <br />

              <span class="spanResults">{result.location}</span>
              <br />
              <span class="spanResults">
                {"Price: " +
                  result.price +
                  " " +
                  result.currency +
                  "/" +
                  result.unit}
              </span>

              <span class="spanResults">
                {"Available: " + result.quantity + " " + result.unit}
              </span>

              {result.picture_path_0 != "" ? (
                <img
                  class="imgResults"
                  src={
                    "http://" +
                    ipAddress +
                    ":" +
                    port +
                    "/" +
                    result.picture_path_0
                  }
                />
              ) : (
                <img class="imgResults" src="./no_picture_available.png" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchBarAndResults;
