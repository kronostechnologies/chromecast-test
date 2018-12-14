var iframe = null;
var iframeDiv = document.getElementById('iframediv');
var playlist = new Array();
var currentPage = 0;

function parseQuery() {
    usp = new URLSearchParams(window.location.search);

    return usp.get('payload');
};

function setActiveFrame(idx) {
  for (var playlistIdx in playlist) {
    var playlistIframe = playlist[playlistIdx].iframeInstance;

    playlistIframe.classList.add('inactive');
    playlistIframe.classList.remove('active');

    if (idx == playlistIdx) {
      playlistIframe.classList.remove('inactive');
      playlistIframe.classList.add('active');

      iframe = playlistIframe;
    }
  }
}

function goToNextPage() {
    currentPage++;
    if (currentPage >= playlist.length) {
        currentPage = 0;
    }

    setActiveFrame(currentPage);

    if (playlist[currentPage].duration) {
        setTimeout(goToNextPage, playlist[currentPage].duration);
    }
}

function startPlaylist() {
    goToNextPage();
}

window.onload = function() {
    onLoad();
}

function onLoad() {
    var params = parseQuery();

    if (params) {
        var payload = JSON.parse(atob(params));

        if (payload.height) {
          iframeDiv.style.height = payload.height;
        } else {
          iframeDiv.style.height = '1080px';
        }

        if (payload.width) {
          iframeDiv.style.width = payload.width;
        } else {
          iframeDiv.style.width = '1920px';
        }

        if (Array.isArray(payload.playlist)) {
            payload.playlist.forEach(function(page) {
                if (page.url) {
                    page.iframeInstance = document.createElement('iframe');
                    page.iframeInstance.style.display = 'none';

                    setTimeout(function () {
                      page.iframeInstance.style.display = 'block';
                      page.iframeInstance.onload = null;
                      page.iframeInstance.src = page.url;
                    }, 5000);

                    if (payload.bootstrapUrl) {
                      page.iframeInstance.src = payload.bootstrapUrl;
                    } else {
                      page.iframeInstance.src = "about:blank";
                    }

                    iframeDiv.appendChild(page.iframeInstance);
                    playlist.push(page);
                }
            });

            iframe = playlist[0].iframeInstance;
        }

        startPlaylist();
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

function decodePayload(payload) {
    if (!payload) {
        payload = parseQuery();
    }
    return JSON.parse(atob(payload));
}
