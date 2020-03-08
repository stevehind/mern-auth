module.exports = function listAllMessages(data) {
    
    var subSid = data.sid;
    var subtoken = data.token;

    const subClient = require("twilio")(subSid, subtoken);

    var message_list = [];

    return subClient.messages.list()
        .then(function (messages) {
            messages.forEach(function (m) {
                var message_data = {
                    timestamp: m.dateCreated,
                    direction: m.direction,
                    to: m.to,
                    from: m.from,
                    body: m.body
                }
                message_list.push(message_data);
            });
            return message_list;
        })
        .catch(function (messages) {
            return messages;
        });
}