const mqtt = require('mqtt');
const fse = require('fs-extra');
const path = require('path');
const util = require('./util');

const syncMqttToFileSystem = ({ MQTT_URL, SYNC_FOLDER_PATH })=> {
  if (typeof(MQTT_URL) !== typeof('')) {
    throw (new Error('MQTT URL not of type string'));
  }

  if (typeof(SYNC_FOLDER_PATH) !== typeof('')) {
    throw (new Error('SYNC_FOLDER_PATH not of type string'));
  }

  const client = mqtt.connect(MQTT_URL);
  client.subscribe('#');
  client.on('message', (mqtt_topic, message) => {
    saveMqttTopicToFileSystem(path.resolve(SYNC_FOLDER_PATH), mqtt_topic, message.toString());
  });
};

const convert_mqtt_topic_to_relative_path = mqtt_topic => './'.concat(mqtt_topic.split('/').filter(x => x.length !== 0).join('/'));

const saveMqttTopicToFileSystem = (SYNC_FOLDER_PATH, mqtt_topic, mqtt_message ) => {
  if (typeof(SYNC_FOLDER_PATH) !== typeof('')) {
    throw (new Error('SYNC_FOLDER_PATH not of type string'));
  }

  if (typeof(mqtt_topic) !== typeof('')) {
    throw (new Error('mqtt topic not of type string'));
  }

  if (typeof(mqtt_message) !== typeof('')) {
    throw (new Error('mqtt message not of type string'));
  }

  const mqtt_topic_fs_path = path.resolve(path.join(SYNC_FOLDER_PATH, convert_mqtt_topic_to_relative_path(mqtt_topic)));
  const mqtt_topic_folder = path.resolve(mqtt_topic_fs_path, '..');

  if (util.fileExists(mqtt_topic_folder)) {
    console.log(0);
    console.log(mqtt_topic_folder , 'exists');
    fse.remove(mqtt_topic_folder, () => {
      fse.outputFile(mqtt_topic_fs_path, mqtt_message);
    });
  }
  else {
    if (util.directoryExists(mqtt_topic_fs_path)){
      fse.remove(mqtt_topic_fs_path, () => {
        fse.outputFile(mqtt_topic_fs_path, mqtt_message, ()  => { })
      });
    }else{
      fse.outputFile(mqtt_topic_fs_path, mqtt_message, ()  => { })
    }
  }
};

module.exports = syncMqttToFileSystem;
