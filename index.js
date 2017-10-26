const md5file = require('md5-file');
const $ = require("jquery");
const path = require("path");
const {dialog} = require('electron').remote;
const READ_BUFFER = 2048;
let file;


$("button#sendBtn").click(send);
$("button#browseBtn").click(openFile);


document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault();
}

document.body.ondrop = (ev) => {
    draggedFile = ev.dataTransfer.files[0].path;
    console.log(draggedFile);
    if (fs.lstatSync(draggedFile).isFile()) {
        file = draggedFile;
        updateFilename(file);
    } else {
        showErrorDialog("Not a file", "Please drag and drop a file to continue!");
    }
    ev.preventDefault();
}


function show() {
    $("div#progressbar").show();
}

function hide() {
    $("div#progressbar").hide();
}


function updateProgress(val) {
    $("div#progressbar > div").width(val + "%");
}

function openFile() {
    dialog.showOpenDialog({properties: ['openFile']}, function(files) {
        if(files === undefined) {
            console.log("No files selected!");
            file = '';
        } else {
            file = files[0];
        }
        
        updateFilename(file);
    });

}

function send() {
    if (file !== undefined && file !== '' && file !== null) {
        var client = new net.Socket();
        let targetHost = getTargetHost();
        let size;
        if (targetHost == null) {
            showErrorDialog("No target device selected", 
                "Make sure you have selected a target device for your file and try sending again!");
        } else {
            client.connect(4000, targetHost);
        }
    
        client.on('error', function(error) {
            console.log(error);
            console.log("Error in connection");
        });
        
        client.on('connect', function() {
            console.log("Client connected to the server");
            size = fs.statSync(file)["size"];
            var fileStream = fs.createReadStream(file);
            var serializedMeta = JSON.stringify({
                filename: path.basename(file), 
                size:size,
                checksum: md5file.sync(file)
            });
            client.write("<HITCHMETA>" + serializedMeta +"</HITCHMETA>");
            let sent = 0;
            show();
            fileStream.on('readable', function() {
                while((chunk=fileStream.read(READ_BUFFER)) != null) {
                    console.log("sending data to" + targetHost);
                    //console.log(chunk);
                    client.write(chunk);
                    sent += chunk.length;
                    console.log((sent / size) * 100);
                    updateProgress((sent / size) * 100);
                }
            });


            fileStream.on('end', function() {
                //hide();
                client.end();
            });
        }); 
    } else {
        showErrorDialog("No file selected", "Select a file to be sent first, and then try again");
    }
}

function updateFilename(file) {
    var fname = document.getElementById("filename");
    fname.innerHTML = file;
}


function getTargetHost() {
    let target = $("input[name=targetDevice]:checked").val();
    console.log("selected device: " + target);
    console.log(services[target]);
    if (services[target] !== undefined) {
        return services[target].host;
    }
    return null;
}

function showErrorDialog(title, content) {
    dialog.showErrorBox(title, content);
}
