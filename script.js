jQuery(function ($) {
    'use strict';

    var supportsAudio = !!document.createElement('audio').canPlayType;
    if (supportsAudio) {
        // Initialize plyr
        var player = new Plyr('#audio1', {
            controls: [
                'restart',
                'play',
                'progress',
                'current-time',
                'duration',
                'mute',
                'volume',
                'download'
            ]
        });

        // Initialize playlist and controls
        var index = 0,
            playing = false,
            tracks = [],
            trackCount = 0;

        // Fetch the tracks from music.json
        $.getJSON('music.json', function(data) {
            tracks = data;
            trackCount = tracks.length;

            // Sort tracks alphabetically by name
            tracks.sort(function(a, b) {
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            });

            // Empty the playlist before adding sorted tracks
            $('#plList').empty();

            // For each track, load its duration dynamically
            $.each(tracks, function(key, value) {
                var trackName = value.name,
                    artistName = value.artist,
                    trackDisplayName = trackName + ' - ' + artistName; // Format song name with artist

                // Create a temporary Audio object to fetch the duration
                var audioElement = new Audio(value.file);
                audioElement.onloadedmetadata = function() {
                    // Once the audio metadata is loaded, set the duration
                    var trackDuration = formatTime(audioElement.duration); // Format the duration
                    value.duration = trackDuration; // Set the duration in the track object
                    
                    // Add to the playlist after duration is retrieved
                    $('#plList').append('<li> \
                        <div class="plItem"> \
                            <span class="plTitle">' + trackDisplayName + '</span> \
                            <span class="plLength">' + trackDuration + '</span> \
                        </div> \
                    </li>');
                };
            });

            // Load the first track
            loadTrack(index);
        });

        // Action when track is playing, paused, or ended
        var npAction = $('#npAction'),
            npTitle = $('#npTitle'),
            audio = $('#audio1').on('play', function () {
                playing = true;
                npAction.text('Now Playing...');
            }).on('pause', function () {
                playing = false;
                npAction.text('Paused...');
            }).on('ended', function () {
                npAction.text('Paused...');
                if ((index + 1) < trackCount) {
                    index++;
                    loadTrack(index);
                    audio.play();
                } else {
                    audio.pause();
                    index = 0;
                    loadTrack(index);
                }
            }).get(0);

        // Control buttons
        var btnPrev = $('#btnPrev').on('click', function () {
            if ((index - 1) > -1) {
                index--;
                loadTrack(index);
                if (playing) {
                    audio.play();
                }
            } else {
                audio.pause();
                index = 0;
                loadTrack(index);
            }
        });

        var btnNext = $('#btnNext').on('click', function () {
            if ((index + 1) < trackCount) {
                index++;
                loadTrack(index);
                if (playing) {
                    audio.play();
                }
            } else {
                audio.pause();
                index = 0;
                loadTrack(index);
            }
        });

        // When a playlist item is clicked
        $('#plList').on('click', 'li', function () {
            var id = $(this).index(); // Get the index of the clicked list item
            if (id !== index) {
                playTrack(id);
            }
        });

        // Format the duration from seconds to MM:SS format
        function formatTime(seconds) {
            var minutes = Math.floor(seconds / 60);
            var secondsLeft = Math.floor(seconds % 60);
            return minutes + ':' + (secondsLeft < 10 ? '0' : '') + secondsLeft;
        }

        var loadTrack = function (id) {
            $('.plSel').removeClass('plSel');
            $('#plList li:eq(' + id + ')').addClass('plSel');
            var trackName = tracks[id].name,
                artistName = tracks[id].artist,
                trackDisplayName = trackName + ' - ' + artistName; // Format the name with artist
            npTitle.text(trackDisplayName);
            index = id;
            audio.src = tracks[id].file;  // Use the URL from the JSON
            updateDownload(id, audio.src);
        };

        var updateDownload = function (id, source) {
            player.on('loadedmetadata', function () {
                $('a[data-plyr="download"]').attr('href', source);
            });
        };

        var playTrack = function (id) {
            loadTrack(id);
            audio.play();
        };

        // Fallback for unsupported audio
    } else {
        $('.column').addClass('hidden');
        var noSupport = $('#audio1').text();
        $('.container').append('<p class="no-support">' + noSupport + '</p>');
    }

    // Filter tracks based on search input
    $('#searchInput').on('input', function () {
        var query = $(this).val().toLowerCase();
        $('#plList li').each(function() {
            var songTitle = $(this).find('.plTitle').text().toLowerCase();
            if (songTitle.indexOf(query) !== -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

});
