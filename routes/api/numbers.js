const express = require("express");
const router = express.Router();

var keys = require("../../config/keys");
var client = require("twilio")(keys.twilioAccountSid, keys.twilioAuthToken);

// @route POST api/numbers/buy-number
// @desc Provision a Twilio sub-account for the user, search available numbers, and buy one
// @access Public
router.post("/buy-number", (req, res) => {
    // extract and validate area code
    const area_code = req.body.area_code;
    const user_email = req.body.email;

    var user_sid;

    // Provision a Twilio sub-account for the user
    client.api.accounts.create({
        friendlyName: user_email
    }).then(function (account) {
        user_sid = account.sid
    });

    // Write the Twilio sub-account ID to the database
    // TODO

    // By default, we ask the search API to look for SMS-enabled numbers with a specific area code
    var search_payload = {
        smsEnabled: true,
        areaCode: area_code
    };

    // If no area code is provided, search without specifying an area codes
    if (area_code.length === 0) {
        console.log("No area code provided, will choose at random.");

        search_payload = {
            smsEnabled: true
        };
    // If an area code _is_ provided, it needs to be three digits
    } else if (area_code.length != 3 || isNaN(area_code)) {
            return res.status(400).json({ message: "Provide a three digit area code."});
    }

    // Return the first number in the list of available numbers for that area code
    return client.availablePhoneNumbers('US').local.list(search_payload)
    .then(function(list) {
        // Purchase the first available number on the list, and return the number.
        client.incomingPhoneNumbers.create({
            phoneNumber: list[0].phoneNumber
        })
        .then(function(incoming_phone_number) {
            return res.status(200).json({ purchased: incoming_phone_number.phoneNumber});
            // TODO
            // transfer the number from master account to the sub account
            // requires:
            // sub-account sid
            // phone number id
            // TODO
            // write the phone number + its id to the database under the user's id.
        });
    });

});

// Test sending a message from a purchased number.
router.get("/test", (req, res) => {

    client.messages
        .create({
            body: "Test",
            from: "+1 872 213 7265",
            to: "+1 617 528 8447"
        })
        .then(message => console.log(message.sid));

     return res.status(200).json({ message: "success"});   

});

module.exports = router;