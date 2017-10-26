const net = require('net');
const fs = require('fs');
const {shell} = require('electron').remote;

let checksum;
let filename;
let server;
let size;
let written = 0;
let writeStream;


function dataHandler(data) {
    
    //console.log("Data incoming");
    //console.log(data.toString());
    if(data.toString().startsWith("<HITCHMETA>")) {
        data = data.toString();
        console.log(data);
        x = data.split("</HITCHMETA>");
        console.log("X " + x);
        meta_string = x[0].replace("<HITCHMETA>", "");
        meta = JSON.parse(meta_string);
        console.log(meta);
        filename = path.join(os.homedir(), meta['filename']);
        size = meta['size'];
        checksum = meta['checksum'];
        writeStream = fs.createWriteStream(filename);
        if (x[1] !== '') {
            writeStream.write(x[1]);
            written = x[1].length;
        } else {
            written = 0;
        }
    }
    else {
        show();
        if (writeStream == null) throw Error;
        writeStream.write(data);
        written += data.length;
    }
    console.log((written / size) * 100);
    updateProgress((written / size) * 100);
    
}


function startTcpServer() {
    console.log("Starting tcp server");
    server = net.createServer(function(socket){
        socket.on('connect', function() {
            console.log("connected!");
        });

        socket.on('data', dataHandler);

        socket.on('end', function() {
            if(md5file.sync(filename) !== checksum) {
                console.log("file corrupted");
                showErrorDialog("File Corrupted", "Looks like the file got corrupted in the way");
            } else {
                console.log("File transfer successful!");
                let transferSuccessNotification = new Notification("File transfer completed", {
                    body: "Received file " + filename
                });

                transferSuccessNotification.onclick = function() {
                   shell.showItemInFolder(filename); 
                };
            }
            console.log("Comm ended by client");
        });
    });

    server.on('listening', function() {
        console.log("TCP server now listening");
    });

    server.listen(4000, '');
    return server
}

startTcpServer();
