/* global hmhmmhm */
let Item = require("./../../../../").require('hmhmmhm.vmachine.item.Item');

class Soda extends Item {
    constructor() {
        super('soda');
    }
}

hmhmmhm.vmachine.item.Soda = Soda;
