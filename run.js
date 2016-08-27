
var path = require("path");

console.log(path.normalize("."));
//consle.log(path.resolve(path.dirname(),'./fs_mount_mqtt.js'));
mq = require(path.resolve(path.dirname(),'./fs_mount_mqtt.js'));

var should_run = (process.argv[2] == "yes");

console.log(process.argv);
root = path.resolve("./mock");
root1 = path.resolve("./mock0");
root_shared = path.resolve("../../run/mock");
var the_extensions = {
    "/actions/": ".action.json",
    "/states/":  ".state.json"
}

topics = [
    "/actions/fire",
    "/actions/water",
    "/actions/device0/air",
    "/states/device0/fire",
    "/states/device1/air",
    "/states/temperature",
    "/states/color"
]

if (should_run === true){
    console.log("should run = true , initializing topics ",topics);
    mq.initialize_mqtt_topics(root_shared,topics,the_extensions);
}

//mq.initialize_mqtt_topics(root,topics);
//mq.initialize_mqtt_topics(root1,topics);
