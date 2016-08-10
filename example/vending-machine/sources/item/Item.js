class Item {
    constructor(name, price, count) {
        this._name = (name != null) ? name : null;
        this._price = (price != null) ? price : 0;
        this._count = (count != null) ? count : 0;
    }
    getName() {
        return this._name;
    }
    getPrice() {
        return this._price;
    }
    getCount() {
        return this._count;
    }
    setName(name) {
        this._name = name;
        return this;
    }
    setPrice(price) {
        this._price = price;
        return this;
    }
    setCount(count) {
        this._count = count;
        return this;
    }
}

hmhmmhm.vmachine.item.Item = Item;
