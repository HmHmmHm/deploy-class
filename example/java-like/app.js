let deployClass = require("./../../");
deployClass.automatic();
//In user case, You can simply write it.
//require('deploy-class').automatic();

let comSample = new com.like.SampleClass();
let orgSample = new org.like.SampleClass();

comSample.hello();
orgSample.hello();
