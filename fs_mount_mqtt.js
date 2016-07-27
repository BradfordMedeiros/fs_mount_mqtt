
var fse = require("fs-extra");
var path = require("path");

function subscribe_to_mqtt_topics ( ){

}

function create_file_watch(folder_root, full_topic_name, callback){
    
    var filepath = path.join(path.resolve(folder_root),full_topic_name)

    fse.watch(filepath, function(){
        fse.readFile(filepath, 'utf-8', function(err,content){
        
            callback({
                filepath: filepath,
                content: JSON.parse(content)
            });
            if (err != undefined){
                console.log("warning error in file read");
            }   
        });
    });
}

function get_topic_exists_promise(folder_root, full_topic_name){
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

function set_topic ( folder_root, full_topic_name, value ){
    
    fse.outputFile(path.join(folder_root,full_topic_name),JSON.stringify(value));

    /*
    // check if topic already exists
    // make topic if it exists
    // else write new value
    var topic_exists_promise = get_topic_exists_promise( folder_root, full_topic_name);
    
    // if file does not exist we modify it 
    topic_exists_promise.catch(function(val){
    });*/
    
}

module.exports = { 
    topic_exists: get_topic_exists_promise,
    set_topic: set_topic,
    subscribe_to_mqtt_topics: subscribe_to_mqtt_topics,
    create_file_watch: create_file_watch
}
