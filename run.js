
var path = require("path");
mq = require(path.resolve('./fs_mount_mqtt.js'));

root = path.resolve("./mock");
root1 = path.resolve("./mock0");
var the_extensions = {
    "/actions/": ".action.json",
    "/states/":  ".state.json"
}

topics = [
    "actions/fire",
    "/actions/water",
    "/actions/device0/air",
    "/states/device0/fire",
    "/states/device1/air",
    "/states/temperature",
    "/states/color"
]

//mq.initialize_mqtt_topics(root,topics);
//mq.initialize_mqtt_topics(root1,topics);
