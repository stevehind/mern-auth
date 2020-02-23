const express = require("express");
const router = express.Router();

var keys = require("../../config/keys");
var client = require("twilio")(keys.twilioAccountSid, keys.twilioAuthToken);

// @route POST api/twilio/new-number
// @desc Buy a new number from Twilio
// @access Public
router.post("/new-number", (req, res) => {
    // extract and validate area code
    const area_code = req.body.area_code;
    
    if (area_code.length != 3 || isNaN(area_code)) {
            return res.status(400).json({ message: "Provide a three digit area code."});
    }

    client.availablePhoneNumbers('US').local.list({
          areaCode: area_code,
          voiceEnabled: true,
          smsEnabled: true
    }).then(function(searchResults) {
        if (searchResults.availablePhoneNumbers.length === 0) {
            throw { message: 'No available numbers with that area code. Try another!' };
        } else {
            console.log(searchResults.availablePhoneNumbers[0]);
        }
    });
    
    return res.status(200).json({ message: "It ran..."})

});

// Test sending a message from a purchased number.
router.get("/test", (req, res) => {

    client.messages
        .create({
            body: "Test",
            from: "+1 910 672 6127",
            to: "+1 617 528 8447"
        })
        .then(message => console.log(message.sid));

     return res.status(200).json({ message: "success"});   

});

module.exports = router;