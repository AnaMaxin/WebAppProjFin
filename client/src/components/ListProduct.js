import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUniversalCookies, ipAddress, port } from "./SignIn";

/* This component allows the user to list a new product to the platform.*/
const ListProduct = () => {
  // This variable stores the id of the current user.
  const user = getUniversalCookies().get("user");

  // Instantiating useNavigate to be able to navigate
  // to the home page once the user updated their account.
  const navigate = useNavigate();

  // These state variables will store the file objects
  // that represent the uploaded pictures with the product
  // and the url that were generated for those pictures.
  // A maximum of 3 pictures per product are allowed.
  const [files, setFiles] = useState([]);
  const [imagesURLs, setImagesURLs] = useState([]);

  // Every time a change occurs to the state variable that stores the pictures,
  // we check if the user already uploaded 3 pictures and if so we hide the
  // input element that allows the user to upload pictures.
  useEffect(() => {
    if (files.length >= 3) {
      document.getElementById("file-input-label").style.visibility = "hidden";
    } else {
      document.getElementById("file-input-label").style.visibility = "visible";
    }
  }, [files]);

  // Every time a change happens to the variable that stores the generated urls
  // the function responsible to display the pictures is called.
  useEffect(() => {
    showImages();
  }, [imagesURLs]);

  // This variable stores the product data introduced by the user.
  const [formData, setformData] = useState({
    title: "",
    app_user: user,
    location: "",
    emailContact: "",
    phoneContact: "",
    price: "",
    currency: "",
    unit: "",
    quantity: "",
    description: "",
  });

  // This function is called once all the mandatory data was intruduced succesffuly.
  // It communicates with the server through a fetch post request and transmits the product data
  // that should be saved inside the database, as well as the product pictures that should be store
  // on the server to be easily retrieved whenever it is necessarily. If the server saves the product
  // successfully, the home page is reached.
  const saveProduct = async () => {
    const formAbcd = new FormData();
    for (let formDataPiece in formData) {
      formAbcd.append(formDataPiece, formData[formDataPiece]);
    }
    let date = new Date().toString();
    formAbcd.append("date", date);

    formAbcd.append("numberOfSelectedFiles", files.length);

    for (let i = 0; i < files.length; i++) {
      let extension = files[i].name.substring(
        files[i].name.lastIndexOf("."),
        files[i].name.length
      );

      let fileName = "" + user + "_" + Date.now() + "_" + i + extension;

      formAbcd.append("files", files[i], fileName);

      formAbcd.append("fileNames", fileName);
    }

    try {
      const result = await fetch(
        "http://" + ipAddress + ":" + port + "/listProduct",
        {
          method: "POST",

          body: formAbcd,
        }
      );

      const data = await result.json();
    } catch (err) {
      console.error(err);
    }
  };

  // This function is called when a change occurs in one of the
  // form fields and updates the formData accordingly.
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setformData((prevformData) => ({
      ...prevformData,
      [name]: value,
    }));
  };

  // This function is responsible to display the pictures that
  // the user uploaded.
  const showImages = () => {
    for (let i = 2; i >= files.length; i--) {
      const imgId = "img" + i;
      const imgSection = "imgSection" + i;
      const imgElement = document.getElementById(imgId);
      const imgSectionElement = document.getElementById(imgSection);
      imgSectionElement.style.display = "none";
      imgElement.src = "#";
    }
    for (let i = 0; i < files.length; i++) {
      const imgId = "img" + i;
      const imgSection = "imgSection" + i;

      const imgElement = document.getElementById(imgId);
      const imgSectionElement = document.getElementById(imgSection);
      if (i < 3) {
        imgSectionElement.style.display = "block";
        imgElement.src = imagesURLs[i];
      }
    }
  };

  // This function is called when the user uploads a new picture.
  const handleFileChange = async (e) => {
    if (files.length < 3) {
      if (e.target.files) {
        setFiles([...files, ...e.target.files]);
      }

      const source = URL.createObjectURL(e.target.files[0]);
      setImagesURLs([...imagesURLs, source]);
    }
  };

  // This function is called when the user clicks the delete button
  // to delete one of the uploaded pictures. It makes the file input element
  // visible, and deleates the file and the url of that file from the
  // corresponding state variables.
  const handleImageDelete = (e) => {
    if (files.length < 3) {
      document.getElementById("file-input-label").style.visibility = "visible";
    }
    e.preventDefault();
    const buttonId = e.target.id;
    const lastChar = buttonId.slice(-1);

    const i = parseInt(lastChar);

    files.splice(i, 1);
    setFiles([...files]);

    imagesURLs.splice(i, 1);
    setImagesURLs([...imagesURLs]);
  };

  // This is called when the user clicks the submit button.
  // It makes sure that the user filled the mandatory fields
  // and entered a valid price value, calls saveProduct(),
  // and navigates to the home page.
  const handleSubmit = (e) => {
    e.preventDefault();

    const attentionMessage = document.getElementById("attention");
    attentionMessage.style.color = "red";
    let message = "Please fill the mandatory fields! <br/>";
    if (formData.title == "") {
      attentionMessage.innerHTML = message;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      return;
    }
    if (formData.location == "") {
      attentionMessage.innerHTML = message;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      return;
    }
    if (formData.phoneContact == "") {
      attentionMessage.innerHTML = message;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      return;
    }
    if (formData.price == "") {
      attentionMessage.innerHTML = message;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      return;
    }
    if (formData.currency == "") {
      attentionMessage.innerHTML = message;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      return;
    }
    if (formData.unit == "") {
      attentionMessage.innerHTML = message;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      return;
    }

    message = "Please enter a valid price! <br/>";
    let price = parseFloat(formData.price);

    if (isNaN(price)) {
      attentionMessage.innerHTML = message;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      return;
    }
    if (price > 9999999999 || price <= 0) {
      attentionMessage.innerHTML = message;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      return;
    }

    if (formData.price.split(".").length > 1) {
      if (formData.price.split(".")[1].length > 2) {
        attentionMessage.innerHTML = message;
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        return;
      }
    }

    saveProduct();
    navigate("/home", {
      state: {
        previousLocation: "",
        previousProduct: "",
        previousResults: [],
      },
    });
  };
  return (
    <div class="container">
      <form id="formListProduct">
        <div class="insideContainer">
          <h1>List Product</h1>
          <label id="attention"></label>

          <label for="title" class="required">
            <b>Title</b>
          </label>
          <input
            type="text"
            placeholder="Enter title"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleInputChange}
          />

          <label for="location">
            <b class="required">Location</b>
            <br />
            Where your customers can pick up the products.
          </label>
          <input
            type="text"
            placeholder="Enter location"
            name="location"
            id="location"
            value={formData.location}
            onChange={handleInputChange}
          />

          <label for="contact">
            <b class="required">Contact</b>
            <br />
            Please enter at least your phone number!
            <br />
          </label>
          <input
            type="text"
            placeholder="Enter phone"
            name="phoneContact"
            id="phoneContact"
            value={formData.phoneContact}
            onChange={handleInputChange}
          />

          <input
            type="text"
            placeholder="Enter email"
            name="emailContact"
            id="emailContact"
            value={formData.contactEmail}
            onChange={handleInputChange}
          />
          <br />

          <label for="price">
            <b class="required">Price</b>
            <br />
            Price number is expected to be between 10000000000 and 0.
            <br />
            "." is the decimal separator and the maximum number of decimals is
            2.
          </label>
          <br />

          <input
            type="text"
            placeholder="Enter price"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleInputChange}
          />
          <br />
          <label class="required">
            <b>Currency and Unit</b>
          </label>
          <div class="currencyUnit">
            <select
              class="selectListProduct"
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
            >
              <option>Currency</option>
              <option value="EUR">Euro</option>
              <option value="USD">US Dollar</option>
              <option value="AFN">Afghan Afghani</option>
              <option value="ALL">Albanian Lek</option>
              <option value="DZD">Algerian Dinar</option>
              <option value="AOA">Angolan Kwanza</option>
              <option value="ARS">Argentine Peso</option>
              <option value="AMD">Armenian Dram</option>
              <option value="AWG">Aruban Florin</option>
              <option value="AUD">Australian Dollar</option>
              <option value="AZN">Azerbaijani Manat</option>
              <option value="BSD">Bahamian Dollar</option>
              <option value="BHD">Bahraini Dinar</option>
              <option value="BDT">Bangladeshi Taka</option>
              <option value="BBD">Barbadian Dollar</option>
              <option value="BYR">Belarusian Ruble</option>
              <option value="BEF">Belgian Franc</option>
              <option value="BZD">Belize Dollar</option>
              <option value="BMD">Bermudan Dollar</option>
              <option value="BTN">Bhutanese Ngultrum</option>
              <option value="BTC">Bitcoin</option>
              <option value="BOB">Bolivian Boliviano</option>
              <option value="BAM">Bosnia-Herzegovina Convertible Mark</option>
              <option value="BWP">Botswanan Pula</option>
              <option value="BRL">Brazilian Real</option>
              <option value="GBP">British Pound Sterling</option>
              <option value="BND">Brunei Dollar</option>
              <option value="BGN">Bulgarian Lev</option>
              <option value="BIF">Burundian Franc</option>
              <option value="KHR">Cambodian Riel</option>
              <option value="CAD">Canadian Dollar</option>
              <option value="CVE">Cape Verdean Escudo</option>
              <option value="KYD">Cayman Islands Dollar</option>
              <option value="XOF">CFA Franc BCEAO</option>
              <option value="XAF">CFA Franc BEAC</option>
              <option value="XPF">CFP Franc</option>
              <option value="CLP">Chilean Peso</option>
              <option value="CNY">Chinese Yuan</option>
              <option value="COP">Colombian Peso</option>
              <option value="KMF">Comorian Franc</option>
              <option value="CDF">Congolese Franc</option>
              <option value="CRC">Costa Rican ColÃ³n</option>
              <option value="HRK">Croatian Kuna</option>
              <option value="CUC">Cuban Convertible Peso</option>
              <option value="CZK">Czech Republic Koruna</option>
              <option value="DKK">Danish Krone</option>
              <option value="DJF">Djiboutian Franc</option>
              <option value="DOP">Dominican Peso</option>
              <option value="XCD">East Caribbean Dollar</option>
              <option value="EGP">Egyptian Pound</option>
              <option value="ERN">Eritrean Nakfa</option>
              <option value="EEK">Estonian Kroon</option>
              <option value="ETB">Ethiopian Birr</option>

              <option value="FKP">Falkland Islands Pound</option>
              <option value="FJD">Fijian Dollar</option>
              <option value="GMD">Gambian Dalasi</option>
              <option value="GEL">Georgian Lari</option>
              <option value="DEM">German Mark</option>
              <option value="GHS">Ghanaian Cedi</option>
              <option value="GIP">Gibraltar Pound</option>
              <option value="GRD">Greek Drachma</option>
              <option value="GTQ">Guatemalan Quetzal</option>
              <option value="GNF">Guinean Franc</option>
              <option value="GYD">Guyanaese Dollar</option>
              <option value="HTG">Haitian Gourde</option>
              <option value="HNL">Honduran Lempira</option>
              <option value="HKD">Hong Kong Dollar</option>
              <option value="HUF">Hungarian Forint</option>
              <option value="ISK">Icelandic KrÃ³na</option>
              <option value="INR">Indian Rupee</option>
              <option value="IDR">Indonesian Rupiah</option>
              <option value="IRR">Iranian Rial</option>
              <option value="IQD">Iraqi Dinar</option>
              <option value="ILS">Israeli New Sheqel</option>
              <option value="ITL">Italian Lira</option>
              <option value="JMD">Jamaican Dollar</option>
              <option value="JPY">Japanese Yen</option>
              <option value="JOD">Jordanian Dinar</option>
              <option value="KZT">Kazakhstani Tenge</option>
              <option value="KES">Kenyan Shilling</option>
              <option value="KWD">Kuwaiti Dinar</option>
              <option value="KGS">Kyrgystani Som</option>
              <option value="LAK">Laotian Kip</option>
              <option value="LVL">Latvian Lats</option>
              <option value="LBP">Lebanese Pound</option>
              <option value="LSL">Lesotho Loti</option>
              <option value="LRD">Liberian Dollar</option>
              <option value="LYD">Libyan Dinar</option>
              <option value="LTL">Lithuanian Litas</option>
              <option value="MOP">Macanese Pataca</option>
              <option value="MKD">Macedonian Denar</option>
              <option value="MGA">Malagasy Ariary</option>
              <option value="MWK">Malawian Kwacha</option>
              <option value="MYR">Malaysian Ringgit</option>
              <option value="MVR">Maldivian Rufiyaa</option>
              <option value="MRO">Mauritanian Ouguiya</option>
              <option value="MUR">Mauritian Rupee</option>
              <option value="MXN">Mexican Peso</option>
              <option value="MDL">Moldovan Leu</option>
              <option value="MNT">Mongolian Tugrik</option>
              <option value="MAD">Moroccan Dirham</option>
              <option value="MZM">Mozambican Metical</option>
              <option value="MMK">Myanmar Kyat</option>
              <option value="NAD">Namibian Dollar</option>
              <option value="NPR">Nepalese Rupee</option>
              <option value="ANG">Netherlands Antillean Guilder</option>
              <option value="TWD">New Taiwan Dollar</option>
              <option value="NZD">New Zealand Dollar</option>
              <option value="NIO">Nicaraguan CÃ³rdoba</option>
              <option value="NGN">Nigerian Naira</option>
              <option value="KPW">North Korean Won</option>
              <option value="NOK">Norwegian Krone</option>
              <option value="OMR">Omani Rial</option>
              <option value="PKR">Pakistani Rupee</option>
              <option value="PAB">Panamanian Balboa</option>
              <option value="PGK">Papua New Guinean Kina</option>
              <option value="PYG">Paraguayan Guarani</option>
              <option value="PEN">Peruvian Nuevo Sol</option>
              <option value="PHP">Philippine Peso</option>
              <option value="PLN">Polish Zloty</option>
              <option value="QAR">Qatari Rial</option>
              <option value="RON">Romanian Leu</option>
              <option value="RUB">Russian Ruble</option>
              <option value="RWF">Rwandan Franc</option>
              <option value="SVC">Salvadoran ColÃ³n</option>
              <option value="WST">Samoan Tala</option>
              <option value="SAR">Saudi Riyal</option>
              <option value="RSD">Serbian Dinar</option>
              <option value="SCR">Seychellois Rupee</option>
              <option value="SLL">Sierra Leonean Leone</option>
              <option value="SGD">Singapore Dollar</option>
              <option value="SKK">Slovak Koruna</option>
              <option value="SBD">Solomon Islands Dollar</option>
              <option value="SOS">Somali Shilling</option>
              <option value="ZAR">South African Rand</option>
              <option value="KRW">South Korean Won</option>
              <option value="XDR">Special Drawing Rights</option>
              <option value="LKR">Sri Lankan Rupee</option>
              <option value="SHP">St. Helena Pound</option>
              <option value="SDG">Sudanese Pound</option>
              <option value="SRD">Surinamese Dollar</option>
              <option value="SZL">Swazi Lilangeni</option>
              <option value="SEK">Swedish Krona</option>
              <option value="CHF">Swiss Franc</option>
              <option value="SYP">Syrian Pound</option>
              <option value="STD">São Tomé and Príncipe Dobra</option>
              <option value="TJS">Tajikistani Somoni</option>
              <option value="TZS">Tanzanian Shilling</option>
              <option value="THB">Thai Baht</option>
              <option value="TOP">Tongan pa'anga</option>
              <option value="TTD">Trinidad & Tobago Dollar</option>
              <option value="TND">Tunisian Dinar</option>
              <option value="TRY">Turkish Lira</option>
              <option value="TMT">Turkmenistani Manat</option>
              <option value="UGX">Ugandan Shilling</option>
              <option value="UAH">Ukrainian Hryvnia</option>
              <option value="AED">United Arab Emirates Dirham</option>
              <option value="UYU">Uruguayan Peso</option>

              <option value="UZS">Uzbekistan Som</option>
              <option value="VUV">Vanuatu Vatu</option>
              <option value="VEF">Venezuelan BolÃ­var</option>
              <option value="VND">Vietnamese Dong</option>
              <option value="YER">Yemeni Rial</option>
              <option value="ZMK">Zambian Kwacha</option>
            </select>
            <select
              class="selectListProduct"
              name="unit"
              id="unit"
              value={formData.unit}
              onChange={handleInputChange}
            >
              <option>Unit</option>
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilogram(kg)</option>
              <option value="g">Gram(g)</option>
              <option value="kg">Pound(lbs)</option>
              <option value="l">Liter(l)</option>
            </select>
          </div>

          <br />
          <label for="quantity">
            <b class="required">Available Quantity</b>
          </label>
          <br />
          <input
            type="text"
            placeholder="Enter quantity"
            name="quantity"
            id="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
          />
          <br />
          <label for="description">
            <b>Description</b>
          </label>
          <textarea
            rows="40"
            placeholder="Type the description of your product"
            name="description"
            id="decription"
            value={formData.description}
            onChange={handleInputChange}
          />

          <label>
            <b>Picture</b>
            <br />
            Here you can choose pictures with your product.
          </label>

          <div class="imgSection" id="imgSection0">
            <img class="imgSmall" id="img0" src="#" />
            <button class="deletebtn" id="btn0" onClick={handleImageDelete}>
              Delete image
            </button>
          </div>
          <br />

          <div class="imgSection" id="imgSection1">
            <img class="imgSmall" id="img1" src="#" />
            <button class="deletebtn" id="btn1" onClick={handleImageDelete}>
              Delete image
            </button>
          </div>
          <br />

          <div class="imgSection" id="imgSection2">
            <img class="imgSmall" id="img2" src="#" />
            <button class="deletebtn" id="btn2" onClick={handleImageDelete}>
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
          <br />
          <label
            id="file-input-label"
            for="pictures"
            onChange={handleFileChange}
          >
            Select a File
          </label>
          <br />
          <br />
          <button
            type="submit"
            id="buttonSubmit"
            class="formbtn"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListProduct;
