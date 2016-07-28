

mq = require('./fs_mount_mqtt.js');

root = path.resolve('./mock')


topics = ['/indoor/room0/temperature',
          
'/indoor/room1/temperature',
         
'/indoor/is_locked',
         
'/outdoor/temperature',
          
'/outdoor/humidity',
          
'is_active'];