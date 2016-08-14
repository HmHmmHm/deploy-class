let deployClass = require("./../../deploy-class.js");
deployClass.automatic('hmhmmhm.vmachine');
//In user case, You can simply write it.
//require('deploy-class').automatic();

/* global hmhmmhm */

let Storage = hmhmmhm.vmachine.storage.Storage;
let Cola = hmhmmhm.vmachine.item.Cola;
let Soda = hmhmmhm.vmachine.item.Soda;

let colaBox = new Cola();
colaBox.setPrice(5).setCount(20);
let sodaBox = new Soda();
sodaBox.setPrice(3).setCount(20);

Storage.storeItem(colaBox);
Storage.storeItem(sodaBox);

Storage.getItem('cola', 2, '$5');
