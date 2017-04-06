
var path = require("path");

//console.log(path.normalize("."));
//consle.log(path.resolve(path.dirname(),'./fs_mount_mqtt.js'));
mq = require('./fs_mount_mqtt.js');

var should_run = (process.argv[2] == "yes");

console.log(process.argv);
root = path.resolve("./mock");
root1 = path.resolve("./mock0");
root_shared = path.resolve("./mock");
var the_extensions = {
    "/actions/": ".action.json",
    "/states/":  ".state.json"
}

topics = [
    //"/actions/fire",
    //"/actions/water",
    //"/actions/device0/air",
    //"/states/device0/fire",
    //"/states/device1/air",
    "/states/temperature",
    "/states/color",
    "/actions/test"
]

if (should_run === true){
    console.log("should run = true , initializing topics ",topics);
    mq.initialize_mqtt_topics(root_shared,topics,the_extensions);
}


const MQTT_MONGO_CONFIG = {
  MONGO_URL : 'mongodb://localhost:27017/myproject',
  MQTT_URL : 'http://127.0.0.1:1883',
  SYNC_FOLDER_PATH: './test',
};

