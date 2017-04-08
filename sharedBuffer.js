
/* @at todo need to check if it was published within 1 second - flush values pushes over a second ago too*/
let lastWrittenValues = { };

const isValueOld = (topic, message) => {
  if (topic === undefined || message === undefined){
    throw (new Error("shared buffer set value parameters not defined correctly in isValueOld"));
  }

  return false;
};

const setValue =  (topic, message) => {

};

module.exports = {
  isValueOld,
  setValue,
};

