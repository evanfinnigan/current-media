
var content = [];
var userData = {services:[]};

var loadData = function() {
    var userDataStr = window.localStorage.getItem('current-media-data');
    if (userDataStr != null) {
        userData = JSON.parse(userDataStr);
    } else {
        console.log("No local data yet.");
    }
};

var saveData = function() {
    var userDataStr = JSON.stringify(userData);
    window.localStorage.setItem('current-media-data', userDataStr);
};

var loadContent = function() {
    $.getJSON("./build-form.JSON", function(data) {
        content = data;
        // $.each(data, function(key, val) {
        //     console.log(key + ": " + val);
        //     content.push({key:value});
        // })
    }).done(function() {
        setupPage();
    });
};

var setupPage = function() {

    if (userData.services.length == 0) {
        $('#your-team-badge').hide();
    } else {

        $('#your-team-badge').html(userData.services.length);
        $('#your-team-badge').show();
    }

    setIconColors();

    var selectedService = window.sessionStorage.getItem('selectedService');
    if (selectedService != null) {
        $('.square-card-service-sm').each(function() {
            if ($(this).attr("data-service-type") == selectedService) {
                $(this).css("filter", "none");
            } else {
                $(this).css("filter", "blur(1px) opacity(0.5)");
            }
        });

        console.log("Content length: " + content.length);
        $.each(content, function(key, val) {
            if (val.name == selectedService) {
                $('#service-name').html(val.name);

                $('#tier1-btn').css('border', 'none');
                $('#tier2-btn').css('border', 'none');
                $('#tier3-btn').css('border', 'none');

                $('#tier1-btn').css('filter', 'none');
                $('#tier2-btn').css('filter', 'none');
                $('#tier3-btn').css('filter', 'none');

                if (isSelected(val.name, 1)) {
                    $('#tier1-btn').css('border', '2px solid black');
                    $('#tier2-btn').css('filter', 'opacity(0.5) saturate(0.5)');
                    $('#tier3-btn').css('filter', 'opacity(0.5) saturate(0.5)');
                } 

                if (isSelected(val.name, 2)) {
                    $('#tier1-btn').css('filter', 'opacity(0.5) saturate(0.5)');
                    $('#tier2-btn').css('border', '2px solid black');
                    $('#tier3-btn').css('filter', 'opacity(0.5) saturate(0.5)');
                } 

                if (isSelected(val.name, 3)) {
                    $('#tier1-btn').css('filter', 'opacity(0.5) saturate(0.5)');
                    $('#tier2-btn').css('filter', 'opacity(0.5) saturate(0.5)');
                    $('#tier3-btn').css('border', '2px solid black');
                } 

                $('#tier1-btn').attr('data-service-name', val.name);
                $('#tier1-name').html(val.tier1.name);
                $('#tier1-desc').html(val.tier1.description);
                
                $('#tier2-btn').attr('data-service-name', val.name);
                $('#tier2-name').html(val.tier2.name);
                $('#tier2-desc').html(val.tier2.description);

                $('#tier3-btn').attr('data-service-name', val.name);
                $('#tier3-name').html(val.tier3.name);
                $('#tier3-desc').html(val.tier3.description);
            }
        });
    } else {
        console.log("SessionStorage not working?");
    }

    if ($('#service-list')) {
        populateServicesList();
    }

    if ($('service-reciept')) {
        populateServiceEstimate();
    }
};

var setIconColors = function() {
    $('button.square-card-service, button.square-card-service-sm').each(function() {
        var el = $(this);
        console.log(el);
        for (var i = 0; i < userData.services.length; i++) {
            console.log(userData.services[i].service);
            console.log(userData.services[i].service + ", " + el.attr('data-service-type'));
            if (userData.services[i].service == el.attr('data-service-type')) {
                switch (userData.services[i].tier) {
                    case 1:
                        el.css('background-color', 'cyan');
                        break;
                    case 2:
                        el.css('background-color', 'gold');
                        break;
                    case 3:
                        el.css('background-color', 'silver');
                        break;
                    default:
                        break;
                }
            } 
        }
    });
};

$(document).ready(function() {
    loadData();
    loadContent();
    setIconColors();
});


function selectService(name, href) {
    window.sessionStorage.setItem('selectedService', name);
    //hack to get around local paths (../blahblah)
    if (href.length <= 5 || !window.location.href.endsWith(href.substring(5))) {
        window.location.href = href;
    } else {
        setupPage();
    }
}

function addService(element, tier) {
    addServiceHelper(element.getAttribute('data-service-name'), tier);
}

function addServiceHelper(name, tier) {
    var hasService = false;
    for(var i = 0; i < userData.services.length; i++) {
        if (userData.services[i].service == name) {
            if (userData.services[i].tier == tier) {
                userData.services.splice(i, 1);
            } else {
                userData.services[i].tier = tier;
            }
            hasService = true;
            break;
        }
    }

    if (!hasService) {
        var data = {
            service: name,
            tier: tier
        };
        userData.services.push(data);
    }

    saveData();
    setupPage();

    // Debug: 
    // for (var i = 0; i < userData.services.length; i++) {
    //     if (userData.services[i].service == name) {
    //         console.log("selected " + userData.services[i].service + " level " + userData.services[i].tier);
    //         break;
    //     }
    // }
}

function isSelected(name, tier) {
    for (var i = 0; i < userData.services.length; i++) {
        if (userData.services[i].service == name) {
            return (userData.services[i].tier == tier);
        }
    }
    return false;
}

function populateServicesList() {
    var htmlContent = '';
    for (var i = 0; i < userData.services.length; i++) {
        var data = getContent(userData.services[i].service, userData.services[i].tier);
        htmlContent += `<div class="card-body" style="background-color: ${data.color}">`;
        htmlContent += `<h2>${userData.services[i].service} - ${data.title}</h2>`;
        htmlContent += `<p>${data.desc}</p>`;
        htmlContent += '</div>';
    }
    htmlContent += '<div><button class="card-footer" onclick="selectService(\'\',\'../\')"><h2>Add Another Service</h2></button></div>';
    $('#service-list').html(htmlContent);
}

function populateServiceEstimate() {
    var htmlContent = '';
    var estimate = 0;
    for (var i = 0; i < userData.services.length; i++) {
        var data = getContent(userData.services[i].service, userData.services[i].tier);
        estimate += data.cost;
        htmlContent += `<div class="card-body" style="background-color: ${data.color}">`;
        htmlContent += `<h2>${userData.services[i].service} - ${data.title}</h2>`;
        htmlContent += `<p>${data.desc}</p>`;
        htmlContent += '</div>';
    }
    // calculate estimate for selected services
    htmlContent += `<div><p>Service Estimate: $${estimate}</p></div>`;
    $('#service-reciept').html(htmlContent);
}

function getContent(name, tier) {
    console.log('get content: ' + name + ', ' + tier)
    var retData = {
        title: '',
        desc: '',
        cost: 0,
        color: 'white'
    };
    for (var i = 0; i < content.length; i++) {
        if (content[i].name == name) {
            switch(tier) {
                case 1:
                    retData.title = content[i].tier1.name;
                    retData.desc = content[i].tier1.description;
                    retData.cost = content[i].tier1.cost;
                    retData.color = 'cyan';
                    console.log(retData);
                    return retData;
                case 2:
                    retData.title = content[i].tier2.name;
                    retData.desc = content[i].tier2.description;
                    retData.cost = content[i].tier2.cost;
                    retData.color = 'gold';
                    console.log(retData);
                    return retData;
                case 3:
                    retData.title = content[i].tier3.name;
                    retData.desc = content[i].tier3.description;
                    retData.cost = content[i].tier3.cost;
                    retData.color = 'silver';
                    console.log(retData);
                    return retData;
                default:
                    break;
            }
        }
    }
    console.log(retData);
    return retData;
}

function submit() {
    var name = $('input#nameInput').val();
    var email = $('input#emailPhoneInput').val();

    isNull = false;

    if (name == null) {
        $('input#nameInput').css('background-color', 'yellow');
        isNull = true;
    }

    if (email == null) {
        $('input#emailPhoneInput').css('background-color', 'yellow');
        isNull = true;
    }

    if (!isNull) {
        
        window.location.href="../service-estimate/";

        // Need a server url to recieve the data
        // var data = {
        //     name: name,
        //     email: email,
        //     userData: userData
        // };
        // $.ajax({
        //     type: "POST",
        //     url: "url",
        //     data: data,
        //     success: function() {
        //         window.location.href="/build-team/service-estimate/";
        //     }
        // });

    } else {
        alert('Please fill in the required fields.');
    }
}

