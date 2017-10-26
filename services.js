const bonjour = require("bonjour")();
const os = require('os');
const hostname = os.hostname();

zeroconfBrowser = bonjour.find({type: 'discovery'});
zeroconfBrowser.start();


let services = {}; // Holds the discovery services discovered nearby
//services['dummy macbook'] = {};
zeroconfBrowser.on('up', function(service) {
    console.log("New service added");
    console.log(service.host +" "+ hostname);
    if (service.host !== hostname) 
        services[service.name] = service;
    updateNearbyDevices();
});


zeroconfBrowser.on('down', function(service) {
    console.log("A service deleted" + service);
    delete services[service.name]
    updateNearbyDevices();
});

function updateNearbyDevices() {
    startLoading();
    var ul = document.getElementById('devices');
    ul.innerHTML = '';
    $("div#noDevicesError").empty();
    if(Object.keys(services).length == 0) {
        $("div#noDevicesError").append($("<label>").text("Looks like there are no hitch-enabled devices in your network."));
    } else {
        for(let key in services) {
            createListItem(key);
        }
    }
    stopLoading();
}


function createListItem(key) {
    list_item = $('<li>').attr('class', 'mdl-list__item');
    primary_span = '<span class="mdl-list__item-primary-content"><i class="material-icons mdl-list__item-icon">computer</i>'+key+'</span>';
    list_item.append(primary_span);
    list_item.append(
        $('<span>').attr('class', 'mdl-list__item-secondary-content').append(
            $('<label>').attr('class', 'mdl-radio mdl-js-radio mdl-js-ripple-effect')
                        .attr('for', key)
                        .append($('<input>')
                            .attr('type', 'radio')
                            .attr('value', key)
                            .attr('id', key)
                            .attr('name', 'targetDevice')
                            .attr('class', 'mdl-radio__input'))));
    $('ul#devices').append(list_item);
}


function startLoading() {
    $('div#devicesLoading').addClass('is-active');
}

function stopLoading() {
    $('div#devicesLoading').removeClass('is-active');
}
