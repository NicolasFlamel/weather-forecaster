
function buildUrl(lat, lon) {
    var key = '15dca0d0b372553e6b4758c35f61904a';
    var url = `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`;
    
    console.log(url)
    getApi(url);
}

function getApi(url) {
    fetch(url)
    .then(function (response) {
        if(response.ok){
            return response.json();
        }else{
            alert('failed');
        }
    })
    .then(function (data) {
        //do stuff with data
        console.log(data);
    });
}

buildUrl(44.34, 10.99)