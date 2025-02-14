const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train')
const isAuth = require("../middleware/isAuth")

router.get('/getStation', trainController.getStation);
router.post('/getTrains', trainController.getTrains);
router.post('/getTrains/avlFareEnquiry', trainController.getTrainsAvailableFareEnquiry);
router.get('/getTrainSchedule/:trainNumber', trainController.getTrainSchedule);
router.post('/getBoardingStations', trainController.getBoardingStations);
router.get('/getUsernameFromIRCTC/:userName',isAuth.token, trainController.getUsernameFromIRCTC);
router.get('/getCountryList', trainController.getCountryList);

module.exports = router;