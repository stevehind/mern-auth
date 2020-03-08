module.exports = function sendMessage(data) {

    var from_number = data.from_number;
    var to_number = data.to_number;
    var message = data.message;
    var subSid = data.sid;
    var subtoken = data.token;

    const subClient = require("twilio")(subSid, subtoken)

    return subClient.messages.create({
        from: from_number,
        to: to_number,
        body: message
    }).then(function (m) {
        return m;
    }).catch(function (m) {
        return m;
    })
}