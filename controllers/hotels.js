const connection = require("../utils/database");
const moment = require("moment");
const { default: axios } = require("axios");
const { response } = require("express");
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
const e = require("express");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const base_url = "https://sandboxentityapi.trateq.com/";
const credentials = {
  Type: "C",
  Module: "X",
  Domain: process.env.DOMAIN,
  LoginID: process.env.LOGIN_ID,
  Password: process.env.PASSWORD,
  LanguageLocale: process.env.LANGUAGE,
  IpAddress: "8.8.8.8",
};

exports.getHotelCities = async (req, res) => {
  const { input } = req.body;
  try {
    const response = await axios.post(`${base_url}/SIGNIX/B2B/StaticData/AC`, {
      Credential: credentials,
      AcType: "CityHotel",
      SearchText: input || "",
      AllData: input ? true : false,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching hotel cities:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getHotelsList = async (req, res) => {
  const {
    cityId,
    checkInDate,
    checkOutDate,
    Rooms,
    PageNo,
    SessionID,
    Filter,
    Sort,
  } = req.body;

  if (!cityId || !checkInDate || !checkOutDate || !Rooms) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Hotel/CacheSearch`,
      {
        Credential: credentials,
        CheckInDate: checkInDate,
        CheckOutDate: checkOutDate,
        Currency: "INR",
        showDetail: true,
        Rooms: Rooms,
        CityId: cityId,
        PageNo: PageNo,
        PageSize: 1000,
        HotelID: null,
        SessionID: SessionID,
        TravellerNationality: "IN",
        CheckInDate: checkInDate,
        CheckOutDate: checkOutDate,
        Currency: "INR",
        //"Rooms": Rooms,
        ShowDetail: true,
        Filter: Filter,
        RoomCriteria: "A",
        SortCriteria: Sort || { SortBy: "StarRating", SortOrder: "Desc" },
        SearchProviders: null,
      }
    );
    // console.log("Response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching hotels:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getHotelDetails = async (req, res) => {
  const {
    CityId,
    HotelId,
    SessionID = null,
    TravellerNationality = "IN",
    CheckInDate,
    CheckOutDate,
    Currency = "INR",
    PageNo = 1,
    PageSize = 100,
    showDetail = true,
    Rooms,
    Filter = {
      MinPrice: 1,
      MaxPrice: 99999999,
      MealPlans: "",
      StarRatings: "",
      Hotels: "",
      Favorite: "",
    },
    RoomCriteria = "A",
    SortCriteria = { SortBy: "StarRating", SortOrder: "Desc" },
  } = req.body;

  // console.log("Received request to get hotel details with body:", req.body);

  // 3) Build the full payload
  const payload = {
    Credential: credentials,
    HotelId,
    SessionID,
    CityId,
    TravellerNationality,
    CheckInDate,
    CheckOutDate,
    Currency,
    PageNo,
    PageSize,
    ShowDetail: showDetail,
    Rooms,
    Filter,
    RoomCriteria,
    SortCriteria,
  };

  console.log("Calling /Hotel/DetailWithPrice with payload:", payload);

  // 4) Make the request
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Hotel/DetailWithPrice`,
      payload
    );
    // console.log("====> Response from getHotelDetails:", response.data);
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching hotel details:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

exports.getPriceValidation = async (req, res) => {
  // 1) Destructure everything (with defaults)
  const request = req.body;
  request.Credential = credentials;
  // console.log("Received request to get hotel details with body:", req.body);

  // 3) Build the full payload
  const payload = request;

  console.log("Calling SIGNIX/B2B/PriceValidation with payload:", payload);

  // 4) Make the request
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PriceValidation`,
      payload
    );
    // console.log("====> Response from getHotelDetails:", response.data);
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching PriceValidation:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

exports.getHotelServiceTax = async (req, res) => {
  const request = req.body;
  request.Credential = credentials;
  const payload = request;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/ServiceTax`,
      payload
    );
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching PriceValidation:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

exports.getHotelPrebook = async (req, res) => {
  const PreBookRequest = req.body;
  PreBookRequest.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PreBook`,
      PreBookRequest
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get hotel pics
exports.getHotelImages = async (req, res) => {
  const { HotelProviderSearchId } = req.body;
  // console.log('Hotels provider id ', HotelProviderSearchId)

  try {
    const response = await axios.post(`${base_url}/SIGNIX/B2B/Hotel/Media`, {
      HotelProviderSearchId,
      Credential: credentials,
    });
    // console.log("====> Response from the get hotels pics are: ", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    // console.log("Error came while fetching the hotel pics ", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  const { amount, currency, receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency: currency,
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getHotelBooked = async (req, res) => {
  const BookRequest = req.body;
  BookRequest.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/BookComplete`,
      BookRequest
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHotelBookedDetails = async (req, res) => {
  const BookedDetailsRequest = req.body;
  BookedDetailsRequest.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}SIGNIX/B2B/ReservationDetail`,
      BookedDetailsRequest
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getHotelsGeoList = async (req, res) => {
  const { SessionId } = req.body;
  console.log("getHotelsGeoList - Request body:", req.body);
  console.log("getHotelsGeoList - SessionId:", SessionId);

  try {
      const payload = {
          SessionId,
          "Credential": credentials
      };
      console.log("getHotelsGeoList - Payload to external API:", payload);
      
      const response = await axios.post(`${base_url}/SIGNIX/B2B/Hotel/GpsCoordinateList`, payload);
      console.log("getHotelsGeoList - Full response from external API:", JSON.stringify(response.data, null, 2));
      console.log("getHotelsGeoList - Response keys:", Object.keys(response.data || {}));

      res.status(200).json(response.data);
  } catch (error) {
      console.error("getHotelsGeoList - Error:", error.message);
      console.error("getHotelsGeoList - Error response:", error.response?.data);
      res.status(500).json({ "error": error.message });
  }
}