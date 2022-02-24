var fs = require("fs");
var archiver = require("archiver");
var path = require("path");
var StreamZip = require("node-stream-zip");
const Archiver = require("./archiver");

async function zip(action) {
    const pathToArchive = action.params.ARCHIVEPATH;
    const pathToTargets = action.params.TARGETS;
    
    let destpath = false;
    if (action.params.DESTPATH) {
        destpath += action.params.DESTPATH;
    }

    const archiver = new Archiver(pathToArchive);

    let targetsArray = pathToTargets.split(" ");
    for (i = 0; i < targetsArray.length; i++) {
        archiver.add(targetsArray[i]);
    }

    return archiver.finalize();
}

async function zipDir(action) {
    const pathToArchive = action.params.zipPath;
    const pathToDir = action.params.dirPath;
    const ignore = (action.params.ignore || '').split('\n');

    const archiver = new Archiver(pathToArchive);
    archiver.addGlob("**/*",{cwd: pathToDir, ignore })
    return archiver.finalize();
}

function unzip(action) {
    return new Promise((resolve, reject) => {
        let pathToArchive = action.params.ARCHIVE;
        let pathToUnZip = action.params.DESTPATH;
        let zip = new StreamZip({
            file: pathToArchive,
            storeEntries: true,
        });
        zip.on("ready", () => {
            fs.mkdirSync(pathToUnZip);
            zip.extract(null, pathToUnZip, (err, count) => {
                if (err) return reject(err);
                zip.close();
                resolve(count + " files restored");
            });
        });
    });
}

module.exports = {
    zip: zip,
    zipDir,
    unzip: unzip,
};

const p = "/Users/matankadosh/Desktop/repos/kaholo-plugins/kaholo-plugin-amazon-ec2";

zipDir({params:{
    zipPath:"/Users/matankadosh/Desktop/repos/kaholo-plugins/kaholo-plugin-zip/test.zip",
    dirPath: p
}}).then(res=>{
    console.log(res);
}).catch(err=>{
    console.log(err);
})