
const chokidar = require('chokidar');
const path = require('path');
const fse = require('fs-extra');
const mqtt = require('mqtt');
const { isValueOld } = require('./sharedBuffer');


const watchFileSystemForChanges = ({ MQTT_URL, SYNC_FOLDER_PATH }) => {
  if (typeof(SYNC_FOLDER_PATH ) !== typeof('')) {
    throw (new Error('fs_mount_mqtt: folder not defined proeprly'));
  }
  if (typeof(MQTT_URL) !== typeof('')){
    throw (new Error('fs_mount_mqtt: MQTT_URL to not defined properly'));
  }
  const client = mqtt.connect(MQTT_URL);

  chokidar.watch(path.resolve(SYNC_FOLDER_PATH ), {ignored: /(^|[\/\\])\../}).on('all', (event, filePath) => {
    registerFileChange(client, SYNC_FOLDER_PATH , filePath);
  });

  return ({
    stop: () => client.end()
  })
};

const registerFileChange = (client, folder, filepath) => {
  const topicName = getTopicFromPath(folder, filepath);
  getTopicData(filepath).then(topicData => {
    console.log('publishing: topic: ', topicName,'  data: ', topicData);
    console.log('topic is temp ', topicName === 'temperature');

    if (!isValueOld(topicName, topicData)){
      console.log('publishing')
      client.publish(topicName, topicData);
    }

  }).catch(err => { console.error(err) });
};

const getTopicFromPath = (folder, filepath) => {
  return path.relative(folder, filepath);
};

const getTopicData = filepath => {
  return new Promise((resolve, reject) => {
    fse.readFile(filepath, (err, data) => {
      if (err){
        reject();
      }else{
        resolve(data.toString());
      }
    });
  });
};

module.exports = watchFileSystemForChanges;