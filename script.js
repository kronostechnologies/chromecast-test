Raven.config('https://9e33988e67424256bc0814c994c72306@sentry.io/1228849').install();

var iframe = document.getElementById('iframe');
var playlist = new Array();
var currentPage = 0;

function parseQuery() {
    var str = window.location.search;
    var params = {};

    str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) {
            params[$1] = $3;
        }
    );
    return params;
};

function goToNextPage() {
    currentPage++;
    if (currentPage >= playlist.length) {
        currentPage = 0;
    }


    iframe.src = playlist[currentPage].url;

    if (playlist[currentPage].duration) {
        setTimeout(goToNextPage, playlist[currentPage].duration);
    }
}

function startPlaylist() {
    currentPage = playlist.length;
    iframe.onload = function() {
        iframe.style.display = 'block';
    };
    goToNextPage();
}

window.onload = function() {
    var div = document.getElementById('iframediv');
    var params = parseQuery();

    if (params.payload) {
        var payload = JSON.parse(atob(params.payload));

        if (payload.height) {
            div.style.height = payload.height;
        } else {
            div.style.height = '1080px';
        }

        if (payload.width) {
            div.style.width = payload.width;
        } else {
            div.style.width = '1920px';
        }

        if (Array.isArray(payload.playlist)) {
            payload.playlist.forEach(function(page) {
                if (page.url) {
                    playlist.push(page);
                }
            });
        }

        if (payload.bootstrapUrl) {
            iframe.onload = function() {
                if (payload.bootstrapDuration) {
                    setTimeout(startPlaylist, payload.bootstrapDuration);
                } else {
                    startPlaylist();
                }
            }
            iframe.src = payload.bootstrapUrl;
        } else {
            startPlaylist();
        }
    }
}

function encodePayload(payload) {
    if (payload) {
        var encodedPayload = btoa(JSON.stringify(payload));
        console.log('Go to : ' + location.origin + location.pathname + '?payload=' + encodedPayload);

        var input = document.createElement('input');
        input.style.display = 'none';
        input.value = location.origin + location.pathname + '?payload=' + encodedPayload;
        input = document.getElementById('body').appendChild(input);

        input.style.display = 'block';
        input.select();
        document.execCommand('Copy');
        console.log('Url copied to clipboard');
        input.parentElement.removeChild(input);
    } else {
        console.log('Please give the payload to encode, see exemple below :');
        var testPayload = {
            height: '1080px',
            width: '1920px',
            bootstrapUrl: 'asdf.com',
            playlist: [{
                    url: 'exemple.com/will/stay/here/for/5minutes',
                    duration: 300000
                },
                {
                    url: 'github.com/then/will/stay/here/forever'
                }
            ]
        };
        console.log(testPayload);
        var encodedTest = btoa(JSON.stringify(testPayload));
        console.log('Will become : ' + encodedTest);
        console.log('Payload will be automatically copied to the clipboard, then go to ' + location.origin + location.pathname + '?payload=' + encodedTest);

    }
}