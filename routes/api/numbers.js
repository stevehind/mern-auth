const express = require("express");
const router = express.Router();
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const listAllMessages = require("../../functions/messages");
const sendMessage = require("../../functions/send");

var keys = require("../../config/keys");
var client = require("twilio")(keys.twilioAccountSid, keys.twilioAuthToken);

// @route POST api/numbers/create-number-account
// @desc Provision a Twilio sub-account for the user
// @access Public
router.post("/create-number-account", (req, res) => {

    const user_email = req.body.email;

    // Write the Twilio sub-account ID to the database
    // TODO

    // Provision a Twilio sub-account for the user
    client.api.accounts.create({
        friendlyName: user_email
    })
    .then(account => {
        return res.status(200).json({ 
            account: account.sid,
            token: account.authToken,
            email: account.friendlyName
         })
    })
    .catch( account => { return res.status(400).json(account)});
});

// @route POST api/numbers/buy-number
// @desc Search available numbers, and buy one, assign to the provided sub-account
// @access Public
router.post("/buy-number", (req, res) => {
    // extract and validate area code
    const area_code = req.body.area_code;
    const user_email = req.body.email;
    const user_sid = req.body.sid;

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
    .then(list => {
        // Purchase the first available number on the list, and return the number.
        client.incomingPhoneNumbers.create({
            phoneNumber: list[0].phoneNumber,
            smsUrl: "https://fbe30584.ngrok.io/api/numbers/receive"
        })
        .then(incoming_phone_number => {
            client.incomingPhoneNumbers(incoming_phone_number.sid)
            .update({ 
                accountSid: user_sid,
                friendlyName: user_email 
            })
            .then( updated_phone_number => { return res.status(200).json(updated_phone_number) })
            // TODO: write the phone number and its id to the database under the user's id.
            .catch( updated_phone_number => { return res.status(400).json(updated_phone_number) });
        });
    });

});

// @route POST api/numbers/send
// @desc Send a message on behalf of a sub-account
// @acccess Public
router.post("/send", (req, res) => {

    const body = req.body;

    return sendMessage(body)
    .then(m => { return res.status(200).json(m) })
    .catch(m => { return res.status(400).json(m) });
});

// @route POST api/numbers/receive
// @desc Webhook to receive message for a given number
// @access public
router.post("/receive", (req, res) => {
    
    const inbound_message = req.body.Body;
    const to = req.body.To;
    const from = req.body.From;

    const twiml = new MessagingResponse();
    
    twiml.message(inbound_message);

    res.writeHead(200, { 'Content-Type': 'text/xml'});
    res.end(twiml.toString());

});


// @route POST api/numbers/list-messages
// @desc List all the messages for a given number
// @access public
router.post("/list-messages", (req, res) => {

    const body = req.body;

    return listAllMessages(body)
    .then(m => { return res.status(200).json(m) })
    .catch(m => { return res.status(400).json(m) });
});

module.exports = router;