/**
    =|==================|=
    .| fs_mount_mqtt.js |.
    =|==================|=
    
    ----------------------------------------------------------------------------
    This code is intended to allow for mounting of mqtt topics to the file-system.
    The intent is to be able to take advantage of mqtt in a unix style way so 
    that you can trivially combine this and take advantage of other tools.  
    ----------------------------------------------------------------------------

    For example, imagine we have the following topics:
    -  /inside/room0/temperature
    -  /inside/room1/temperature
    -  /inside/is_locked
    -  /outside/humidity
    -  /outside/temperature
    -  /outside/air_quality
    
    These topics will create the following structure in the file system:
    
    ./inside/
        ./room0/temp
        ./room1/temp
        ./is_locked
    ./outside
        ./humidity
        ./temperature
        ./air_quality

    Important Note:
    ----------------------------------------------------------------------------
    Technically you may interact with it in any way you can interact with a file. 
    The value of the file will be updated upon the callback from the mqtt subscription, 
    and the value will be published when the value of the value is changed.  
    The format of the file should be JSON.       
    
    A basic use case is as follows:
    ----------------------------------------------------------------------------
    echo <json contents> > topic_file       --> to publish the topic
    cat topic_file                          --> to view file contents
     
**/


var fse = require("fs-extra");
var path = require("path");
var mqtt = require("mqtt");



// Initializes the mqtt topics which creates files representing 
// topics that we care about.  This will start subscriptions for 
// the topics and when the file is changed we publish the contents
// of that file as the value to the mqtt topic.
function initialize_mqtt_topics (folder_root,topics){
    if (folder_root === undefined){
        throw (new Error("folder root is not defined in initialize_mqtt_topics"));
    }
    if (topics === undefined){
        throw (new Error("topics is not defined in initialize_mqtt_topics"));
    }
    
    var client = mqtt.connect("mqtt://localhost");
    for (var i = 0 ; i < topics.length ; i++){
        var the_topic =  topics[i];
                
        // this initially creates the file.  The original value is undefined since no info on the topic exists.
        set_topic(folder_root, the_topic, JSON.stringify({topic: the_topic, value: null})); 
         
        //When the value is modified we publish the new value
        create_file_watch(folder_root, the_topic, function(value){
            //publish_mqtt_topic(topic, value);
            //debug_publish_mqtt_topic(the_topic,value);
            publish_mqtt_topic(client,value.topic,value.content);
            //console.log('file changed' ,value);
        });
    }
    
    client.on("connect",function(){
        subscribe_to_mqtt_topics(client,topics, function(topic, value){
            //console.log("received topic ",topic);
            set_topic(folder_root,topic, value);
        });
    });
}

function ensure_all_topic_unique(topics){
    console.log("Warning ensure all topics unique not yet implemented");
}

// Debug subscribe to topic 
function debug_subscribe_to_mqtt_topic (topic,callback){
    console.log("Debug temporary method needs to be replaced by non-mock version");
    setInterval(function(){
        var value = Math.floor(Math.random()*30);
        //console.log("Debug:  Received subscription ",topic, "with value ", value);
        callback({
            topic: topic,
            value: value
        })
    },Math.floor(Math.random()*20*1000));
}

// Initializes the logic to subscribe to an individual mqtt topic
function subscribe_to_mqtt_topics (client,topics,callback){
    for (var i = 0 ; i < topics.length ; i++){
        client.subscribe(topics[i]);
        console.log('subscribed to ',topics[i]);
    }
    client.on("message",function(topic, message){
     //   console.log("received ",topic);
        callback(topic, message);
    });
}

// Debug publish topic
function debug_publish_mqtt_topic(topic,value){
    console.log("Debug:  Published ",topic, "with value ", value);
}

// Publishes an mqtt topic outbound
function publish_mqtt_topic(client, topic,value){
    client.publish(topic,JSON.stringify(value));
}

// Creates a file watch on a file folder_root/full_topic_name
// When the file is modified the contents of the file will be passed
// into the callback.  The contents of the file should be JSON format.
function create_file_watch(folder_root, full_topic_name, callback){
    if (folder_root === undefined){
        throw (new Error("folder root in undeined in create file watch"));
    }
    
    if (full_topic_name === undefined){
        throw (new Error("full_topic_name must be defined in create file watch"));
    }
    
    if (callback === undefined){
        throw (new Error("callback must be defined in create file watch"));
    }
    
    var filepath = path.join(path.resolve(folder_root),full_topic_name)

    fse.watch(filepath, function(){
        fse.readFile(filepath, 'utf-8', function(err,content){
        
            callback({
                filepath: filepath,
                topic: full_topic_name,
                dir: folder_root,
                content: JSON.parse(content)
            });
            if (err != undefined){
                console.log("warning error in file read");
            }   
        });
    });
}

// Returns a promise that resolves if the topic exists, or rejects if it does not
function get_topic_exists_promise(folder_root, full_topic_name){
    
    if (folder_root === undefined){
        throw (new Error("folder root in undeined in create file watch"));
    }
    
    if (full_topic_name === undefined){
        throw (new Error("full_topic_name must be defined in create file watch"));
    }
    
    var topic_exists_promise = new Promise(function(resolve,reject){
        var file_path = path.join(path.resolve(folder_root),topic_name)
        fs.stat(file_path, function(err){
            var file_exists = err == null;
            if (file_exists){
                resolve(file_exists);
            }else{
                reject(file_exists);
            }
        });
    });
    return topic_exists_promise;
}

// Sets the contents of the file equal to value in folder_root/full_topic_name
// The topic name is formatting as  x/y/z and sub-folders will be created if they 
// do not exist while writing the file value if they do not already exit
function set_topic ( folder_root, full_topic_name, value ){
    if (folder_root === undefined){
        throw (new Error("folder root in undeined in create file watch"));
    }
    
    if (full_topic_name === undefined){
        throw (new Error("full_topic_name must be defined in create file watch"));
    }
    if (value === undefined){
        throw (new Error("value must be defined in create file watch"));
    }   
   
    console.log("writing <f: ",folder_root,"/",full_topic_name," with value ", value);
    console.log("");
    
    fse.outputFile(path.join(folder_root,full_topic_name),value);    
}



module.exports = { 
    topic_exists: get_topic_exists_promise,
    set_topic: set_topic,
    initialize_mqtt_topics: initialize_mqtt_topics,
    create_file_watch: create_file_watch
}
