var fs = require('fs');
var archiver = require('archiver');
var path = require("path");
var StreamZip = require('node-stream-zip');


function zip(action) {
    return new Promise((resolve, reject) => {
        let pathToArchive = action.params.ARCHIVEPATH;
        let pathToTargets = action.params.TARGETS;
        let pathToFiles = [];
        let pathToDirs = [];
        let destpath = '';
        if (action.params.DESTPATH) {
            destpath += action.params.DESTPATH
        } else {
            destpath = false
        }
        let targetsArray = pathToTargets.split(' ');
        for (i = 0; i < targetsArray.length; i++) {
            if (fs.lstatSync(targetsArray[i]).isFile()) {
                pathToFiles.push(targetsArray[i])
            } else {
                pathToDirs.push(targetsArray[i])
            }
        }
        let output = fs.createWriteStream(pathToArchive);
        let archive = archiver('zip', { zlib: { level: 9 }});

        archive.pipe(output);
        for (i = 0; i < pathToFiles.length; i++) {
            archive.append(fs.createReadStream(pathToFiles[i]), {name: path.basename(pathToFiles[i])});
        }

        for (i = 0; i < pathToDirs.length; i++) {
            archive.directory(pathToDirs[i], destpath);
            //'newdir' || false
        }
        archive.on('error', function (err) {
            return reject(err)
        });
        archive.on('close', () => resolve({success: true}));

        archive.finalize();

    })
}

function unzip(action) {
    return new Promise((resolve, reject) => {
        let pathToArchive = action.params.ARCHIVE;
        let pathToUnZip = action.params.DESTPATH;
        let zip = new StreamZip({
            file: pathToArchive,
            storeEntries: true
        });
        zip.on('ready', () => {
            fs.mkdirSync(pathToUnZip);
            zip.extract(null, pathToUnZip, (err, count) => {
                if (err)
                    return reject(err);
                zip.close();
                resolve(count + ' files restored')
            });
        });
    })
}

module.exports = {
    zip: zip,
    unzip: unzip
}