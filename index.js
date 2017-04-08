
const syncMqttToFileSystem = require('./syncMqttToFileSystem.js');
const watchFileSystemForChanges = require('./watchFileSystemForChanges');

const fs_mount_mqtt = {
  syncMqttToFileSystem,
  watchFileSystemForChanges,
};

module.exports = fs_mount_mqtt;