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
    
    WARNING:  Note that this method can and will redrop results.  It should not be used if you care about not losing data
    Since we watch for a file to change, if the 
     
**/


var fse = require("fs-extra");
var path = require("path");
var mqtt = require("mqtt");

// chokidar used for file change monitoring.  fs module file monitoring is unstable, so we use
// this instead.  when fs monitoring becomes stable can get rid of this dependency in 
// favor of that.
var chokidar = require("chokidar");


// In memory representation of topic the topic_values
var topic_values = {
    // fields dynamically populated into map
};

// example extension field
//var the_extensions = {
//    "/actions/": ".action.json",
//    "/states/":  ".state.json"
//}


/*
    ./mock
        ./temp
        ./indoor
            ./fire
            ./water
        ./outdoor
            ./air_quality
            ./time
    
    the usage options:  
                - c : specifies the config file of topics to use
                - p : specifies the path of the root folder to put topics
                - f : if a file exists we overwrite that (if a file exists with this name otherwise we error)
  
    @todo:
    1. need to verify all topics are unique
    2. need to make sure you cannot break out of the root folder (so ./x is max topic level)
    3. need to verify no file exists which we are going to use
*/

function verify_all_topics_unique(topics){
    throw (new Error("not implemented error"));
}

function verify_all_topics_above_root_level(topics){
    throw (new Error("not implemented error"));
}

function verify_all_files_have_no_conflicts(topics){
    throw (new Error("not implemented error"));
}

// Initializes the mqtt topics which creates files representing 
// topics that we care about.  This will start subscriptions for 
// the topics and when the file is changed we publish the contents
// of that file as the value to the mqtt topic.
function initialize_mqtt_topics (folder_root,topics,extensions){
    
    if (folder_root === undefined){
        throw (new Error("folder root is not defined in initialize_mqtt_topics"));
    }
    if (topics === undefined){
        throw (new Error("topics is not defined in initialize_mqtt_topics"));
    }
    
    var client = mqtt.connect("mqtt://localhost");
    
    subscribe_to_mqtt_topics(client,topics, function(topic,message){
    
        // This check is important.
        // It is done so we don't rewrite the file if the value of the file has not changed
        // If we did, we could get caught in infinite loop/
        // We can do this since we watch for file changes, which should make this accurates
        if (message !== topic_values[topic]){
            set_topic(folder_root,topic, message,extensions);
            topic_values[topic] = message;
        }
    });
    
    for (var i = 0 ; i < topics.length ; i++){
        var the_topic =  topics[i];
                
        // this initially creates the file.  The original value is undefined since no info on the topic exists.
        set_topic(folder_root, the_topic, JSON.stringify({topic: the_topic, value: null}),extensions); 
        topic_values[the_topic] = null;
        
        //When the value is modified we publish the new value
        create_file_watch(folder_root, the_topic, extensions,function(value){
            console.log("topic:  ",value," modified");
            publish_mqtt_topic(client,value.topic,value.content);
        });
    }
}

// Initializes the logic to subscribe to an individual mqtt topic
function subscribe_to_mqtt_topics (client,topics,callback){
    
    for (var i = 0 ; i < topics.length ; i++){
        client.subscribe(topics[i]);
    }
    client.on("message",function(topic, message){
        callback(topic, message);
    });
}

// Publishes an mqtt topic to mqtt broker
function publish_mqtt_topic(client, topic,value){
    client.publish(topic,JSON.stringify(value));
}

// Creates a file watch on a file folder_root/full_topic_name
// When the file is modified the contents of the file will be passed
// into the callback.  The contents of the file should be JSON format.
function create_file_watch(folder_root, full_topic_name, extensions, callback){
    
    if (folder_root === undefined){
        throw (new Error("folder root in undeined in create file watch"));
    }
    
    if (full_topic_name === undefined){
        throw (new Error("full_topic_name must be defined in create file watch"));
    }
    
    if (callback === undefined){
        throw (new Error("callback must be defined in create file watch"));
    }
    
    var filepath = path.join(path.resolve(folder_root),get_file_name(full_topic_name,extensions));
    var watcher = chokidar.watch(filepath);
    var process_watch = function(){
    
        fse.readFile(filepath, "utf-8", function(err,content){   

            var is_json_content = true;
            var parsed_content = undefined;
            try{
                parsed_content = JSON.parse(content);
            }catch(e){
                is_json_content = false;
            }
            
            if (err != undefined){
                console.log("warning error in file read ",filepath, " error: ",err);
            }else if (!is_json_content){
                console.log("warning content is not json in ", filepath, "content", content);
            }else{ // no errors and is json so we can safely call the callback
                callback({
                    filepath: filepath,
                    topic: full_topic_name,
                    dir: folder_root,
                    content: parsed_content
                });
            }       
        }); 
    };    
    watcher.on("change", process_watch);
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
        var file_path = path.join(path.resolve(folder_root), full_topic_name);
        fse.stat(file_path, function(err){
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

function get_file_name(full_topic_name, extensions){
    var the_extensions = extensions !== undefined ? extensions:  {};
    var keys = Object.keys(the_extensions);
    
    var suffixes = keys.filter((key)=> full_topic_name.indexOf(key) == 0);
    var suffix = suffixes.length > 0 ? the_extensions[suffixes[0]] : "";
    return full_topic_name+suffix;
}

// Sets the contents of the file equal to value in folder_root/full_topic_name
// The topic name is formatting as  x/y/z and sub-folders will be created if they 
// do not exist while writing the file value if they do not already exit
function set_topic ( folder_root, full_topic_name, value, extensions){
    
    if (folder_root === undefined){
        throw (new Error("folder root in undeined in create file watch"));
    }   
    if (full_topic_name === undefined){
        throw (new Error("full_topic_name must be defined in create file watch"));
    }
    if (value === undefined){
        throw (new Error("value must be defined in create file watch"));
    }    
    fse.outputFile(path.join(folder_root,get_file_name(full_topic_name,extensions)),value);    
}


module.exports = { 
    topic_exists: get_topic_exists_promise,
    set_topic: set_topic,
    initialize_mqtt_topics: initialize_mqtt_topics,
    create_file_watch: create_file_watch
};
