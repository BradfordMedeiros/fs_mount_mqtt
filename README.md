# fs_mount_mqtt
Library to mount contents of subscribed mqtt topics to the filesystem.  Will display the last updated value.


Subscribed topics:
/indoor/room1/temperature
/indoor/room2/temperature
/outdoor/temperature
/status

$: fs_mount init <parameters>
runs a daemon to monitor mqtt topics and creates this on the file system:

./indoor/
    ./room1/temperature
    ./room2/temperature
./outdoor/
    ./temperature
./status

you can:
$: cat /path/to/topic
- outputs last value of the topic

or 
$: echo value > /path/to/topic/

which will then publish the value of that subscription
if the subscription does not exist but you wish to publish you may do:

$: fs_mount create /path/to/topic/
and then you will be able to interact with the topic as above