/* global hmhmmhm */
let storage = {};

let Item = hmhmmhm.vmachine.item.Item;
class Storage{
    static storeItem(item){
        if(!(item instanceof Item)) return;
        if(!storage[item.getName()]) storage[item.getName()] = {
            price: 0,
            count: 0
        };
        storage[item.getName()].price += item.getPrice();
        storage[item.getName()].count += item.getCount();
        console.log(`[Store] stored ${item.getName()} [count:${storage[item.getName()].price}]`);
    }

    static getItem(itemName, count, price){
        price = price.replace('$', '');
        if(!storage[itemName]){
            console.log(`[Store] ${itemName} is not stored!`);
            return;
        }
        if(storage[itemName].count < count){
            console.log(`[Store] ${itemName} is not enough!, It only have ${storage[itemName].count}!`);
            return;
        }
        if((storage[itemName].price * count) < price){
            console.log(`[Store] Not enough coin!, you paid ${price}, need ${(storage[itemName].price * count)} coin!`);
            return;
        }
        if((storage[itemName].price * count) > price)
            console.log(`[Store] ${itemName} Remain ${(storage[itemName].price * count) - price} coin returned.`);
        storage[itemName].count -= count;
        console.log(`[Store] Ejected ${count}-${itemName}, now have ${storage[itemName].count}-${itemName}.`);
    }
}

hmhmmhm.vmachine.storage.Storage = Storage;
