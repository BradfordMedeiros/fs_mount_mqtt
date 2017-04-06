const fse = require('fs-extra');

const saveMqttTopicToFs = () =>{
  if (fileExists(mqtt_topic_folder)) {
    console.log(0);
    console.log(mqtt_topic_folder , 'exists');
    fse.remove(mqtt_topic_folder, () => {
      fse.outputFile(mqtt_topic_fs_path, mqtt_message);
    });
  }
  else {
    if (directoryExists(mqtt_topic_fs_path)){
      console.log(1);
      console.log('removing ', mqtt_topic_fs_path);
      fse.remove(mqtt_topic_fs_path, () => {
        fse.outputFile(mqtt_topic_fs_path, mqtt_message, ()  => { })
      });
    }else{
      fse.outputFile(mqtt_topic_fs_path, mqtt_message, ()  => { })
    }
    console.log(2);
  }

}