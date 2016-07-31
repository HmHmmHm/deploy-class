'use strict';

let fs = require('fs');
let path = require('path');
let sources, modules = {};

module.exports = class DeployClass {
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
                    this.treeLoader(filePath, originPath, prefix);
            }
            catch (e) {}
        });
    } 

    static requireFromString(tree, className, code, filePath) {
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
    }

    /**
     * @description
     * Load all the source files in the specified folder.
     * 지정된 폴더 안에 있는 모든 소스파일들을 로드해옵니다.
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
                    this.requireFromString(tree, targetClassName,
                        fs.readFileSync(filePath, 'utf8'), filePath);
                }
                else {
                    this.sourceLoader(filePath, originPath, prefix);
                }
            }
            catch (e) {}
        });
    }

    /**
     * @description
     * This function is load the required source.
     * Use when there are dependencies with sources.
     * 종속성이 있는 소스가 있을때 필요한 소스를 바로 로드합니다.
     * @param {string} requireSourcePath
     */
    static requireLoader(requireSourcePath) {
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

        if (!prefix) return false;

        let requireAbsolutePath = "";
        for (let key in splitPath)
            if (key > prefixCount) requireAbsolutePath += ("/" + splitPath[key]);
        let path = sources[prefix] + requireAbsolutePath;

        /**
         * @description
         * If the source is already loaded, not loaded.
         * 이미 로드된 소스일 경우 로드하지 않습니다.
         */
        if (modules[path] != null) return;

        this.requireFromString(requireSourcePath, splitPath[splitPath.length - 1],
            fs.readFileSync(path + '.js', 'utf8'), path + '.js');
        return true;
    }

    /**
     * @description
     * Register the source folder with the desired namespace.
     * You can only sentence like minejs, develper_name.plugin_name
     * like also possible to attach the name of the plugin developers behind the name.
     * Must register the namespace with the source folder, you can use the function dependencies.
     *
     * 소스폴더를 원하는 네임스페이스와 함께 등록합니다.
     * minejs 와 같이 단문장도 되고, develper_name.plugin_name
     * 같이 개발자명 뒤에 플러그인이름을 붙이는 것도 가능합니다.
     * 네임스페이스와 소스폴더를 등록해야만 종속성 함수를 사용할 수 있습니다.
     *
     * @param {string} prefix
     * @param {string} directory
     */
    static registerSourceFolder(prefix, directory) {
        sources[prefix] = directory;
    }
}