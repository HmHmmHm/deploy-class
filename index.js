'use strict';

let fs = require('fs');
let path = require('path');
let sources = {};
let modules = {};

module.exports = class DeployClass {
    /**
     * @description
     * Automatically load the package module.
     * @param {string} prefix
     * @param {string} sourceFolderName
     */
    static automatic(prefix, sourceFolderName){
        if(sourceFolderName == null) sourceFolderName = 'sources';
        
        let sourceFolderPath = '';
        let trace = require('stack-trace').parse(new Error());
        let pathSplit = trace[1].fileName.split(path.sep);

        if (trace[1].fileName[0] == '/') sourceFolderPath += '/';
        for (let i = 0; i < pathSplit.length - 1; i++) {
            sourceFolderPath = path.join(sourceFolderPath, pathSplit[i]);
            if (sourceFolderPath == 'C:.') sourceFolderPath = 'C:\\';
        }
        sourceFolderPath = path.join(sourceFolderPath, sourceFolderName);
        DeployClass.registerSourceFolder(prefix, sourceFolderPath);
        DeployClass.treeLoader(sourceFolderPath, sourceFolderPath, prefix);
        DeployClass.sourceLoader(sourceFolderPath, sourceFolderPath, prefix);
    }
    
    /**
     * @description
     * Load the global variable depending on the file hierarchy.
     * @param {string} sourceFolderPath
     * @param {string} originPath
     * @param {string} prefix
     */
    static treeLoader(sourceFolderPath, originPath, prefix) {
        fs.readdirSync(sourceFolderPath).forEach(function(file) {
            let filePath = path.join(sourceFolderPath, file);
            let stat = fs.statSync(filePath);
            try {
                let tree = sourceFolderPath.split(originPath)[1];
                tree = prefix + tree.replace(new RegExp("/", 'g'), '.');
                tree = tree.replace(/\\/g, '.');
                tree = tree.replace(/[&\/\\#,+()$~%;@$^!'":*?<>{}]/g, '');
                if (eval("!" + tree))
                    eval(tree + " = {};");
                if (stat.isDirectory())
                    DeployClass.treeLoader(filePath, originPath, prefix);
            }
            catch (e) {}
        });
    }

    /**
     * @description
     * Load the module in the string code.
     * @param {string} tree
     * @param {string} className
     * @param {string} code
     * @param {string} filePath
     * @return {class}
     */
    static requireFromString(tree, className, code, filePath) {
        try {
            if (modules[filePath] != null) return eval('(' + tree + ')');

            code = 'module.exports={load:()=>{' + code + ';' + tree + '=' + className + ';}}';
            let paths = module.constructor._nodeModulePaths(path.dirname(filePath));
            let moduleBuild = new module.constructor(filePath, module.parent);

            moduleBuild.filename = filePath;
            moduleBuild.paths = [].concat(['prepend']).concat(paths).concat(['append']);
            moduleBuild._compile(code, filePath);

            let moduleInstance = moduleBuild.exports;
            if (moduleInstance == null || typeof(moduleInstance.load) != 'function') return;

            moduleInstance.load();
            modules[filePath] = moduleInstance;
            return eval('(' + tree + ')');
        }
        catch (e) {
            console.log('\r\n' + filePath + '\r\n\t' + e);
            return null;
        }
    }

    /**
     * @description
     * Load all the source files in the specified folder.
     * @param {string} sourceFolderPath
     */
    static sourceLoader(sourceFolderPath, originPath, prefix) {
        fs.readdirSync(sourceFolderPath).forEach(function(file) {
            let filePath = path.join(sourceFolderPath, file);
            let stat = fs.statSync(filePath);
            try {
                if (stat.isFile()) {
                    let tree = prefix + filePath.split(originPath)[1];
                    tree = tree.replace(/\.js/gi, '');
                    tree = tree.replace(new RegExp("/", 'g'), '.');
                    tree = tree.replace(/\\/g, '.');

                    let extensionCheck = file.split('.');
                    if (extensionCheck.length < 2) return;
                    if (extensionCheck[1].toLowerCase() != 'js') return;

                    let targetClassName = file.replace(/\.js/gi, '');
                    DeployClass.requireFromString(tree, targetClassName,
                        fs.readFileSync(filePath, 'utf8'), filePath);
                }
                else {
                    DeployClass.sourceLoader(filePath, originPath, prefix);
                }
            }
            catch (e) {}
        });
    }

    /**
     * @description
     * This function is load the required source.
     * Use when there are dependencies with sources.
     * @param {string} requireSourcePath
     */
    static require(requireSourcePath) {
        let splitPath = requireSourcePath.split(".");
        let prefix = null;
        let prefixCount = 0;

        for (let checkCount = 0; checkCount < splitPath.length; checkCount++) {
            let checkPrefix = "";
            for (let i = 0; i <= checkCount; i++) {
                if (i != 0) checkPrefix += ".";
                checkPrefix += splitPath[i];
            }
            if (sources[checkPrefix] != null) {
                prefix = checkPrefix;
                prefixCount = checkCount;
                break;
            }
        }

        if (!prefix) return null;

        let requireAbsolutePath = "";
        for (let key in splitPath)
            if (key > prefixCount) requireAbsolutePath += ("/" + splitPath[key]);
        let path = sources[prefix] + requireAbsolutePath + '.js';

        /**
         * @description
         * If the source is already loaded, not loaded.
         */
        if (modules[path] != null) return eval('(' + requireSourcePath + ')');

        return DeployClass.requireFromString(requireSourcePath, splitPath[splitPath.length - 1],
            fs.readFileSync(path, 'utf8'), path);
    }

    /**
     * @description
     * Register the source folder with the desired namespace.
     * You can only sentence like minejs, develper_name.plugin_name
     * like also possible to attach the name of the plugin developers behind the name.
     * Must register the namespace with the source folder, you can use the function dependencies.
     *
     * @param {string} prefix
     * @param {string} directory
     */
    static registerSourceFolder(prefix, directory) {
        let splitPrefix = prefix.split('.');
        if (splitPrefix[1] == null) {
            eval(`global.${prefix} = {}`);
        }
        else {
            let prefixBuild = 'global';
            for (let key in splitPrefix) {
                prefixBuild += `.${splitPrefix[key]}`;
                eval(`${prefixBuild} = {}`);
            }
        }
        sources[prefix] = directory;
    }
};