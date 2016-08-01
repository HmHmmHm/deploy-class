# deploy-class
File hierarchy based global package module system in node.js

### Introducion
    deploy-class is helps to use the Object-Oriented structure in node js.
    supported structure is based package system like a Java.
    Also, without using the import or export and module.exports.
    Simply helps implement a modular structure based on the class.

### How to use deploy-class?
- Create node project using `npm init`.
- `npm install deploy-class`
- Create sources folder in project folder using `mkdir sources` command.
- Go to your js file, and type `require('deploy-class').automatic(`package root name`);`
- Create js file which you want to use in sources folder.
- Just define the class using file name. It will be saved global variable structure.

### Example
https://github.com/HmHmmHm/deploy-class/blob/master/example/vending-machine/app.js
