var fs = require('fs');
var archiver = require('archiver');
var path = require("path");


class Archiver{
    promise;
    
    constructor(pathToArchive){
        let output = fs.createWriteStream(pathToArchive);
        this.archiver = archiver('zip', { zlib: { level: 9 }});
        this.archiver.pipe(output);
        this.promise = new Promise((resolve,reject)=>{
            this.archiver.on('error',(err)=>{
                reject(err);
            })
            output.on('finish', () => 
                resolve({
                    filePath : pathToArchive,
                    fileSize: this.archiver.pointer()
                })
            );
        })
    }

    add(path, destPath = false){
        if (fs.lstatSync(path).isFile()) {
            this.addFile(path)
        } else {
            this.addDirectory(path, destPath)
        }
    }

    addFile(filePath){
        this.archiver = this.archiver.append(
            fs.createReadStream(filePath), {
                name: path.basename(filePath)
            }
        );
    }

    addDirectory(dirPath,destpath=false){
        this.archiver = this.archiver.directory(dirPath, destpath);
    }

    addGlob(pattern, {cwd, ignore = []}){
        this.archiver = this.archiver.glob(pattern, {
            cwd,
            ignore
        })
    }

    finalize(){
        this.archiver.finalize();
        return this.promise;
    }
}

module.exports = Archiver;