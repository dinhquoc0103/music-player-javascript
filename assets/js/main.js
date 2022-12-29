 
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const cd = $(".player .cd");
const heading = $("header h2");
const cdThumb = $(".cd .cd-thumb");
const audio = $("#audio");
const togglePlayBtn = $(".control .btn-toggle-play"); 
const nextSongBtn = $(".control .btn-next");
const prevSongBtn = $(".control .btn-prev");
const repeatSongBtn = $(".control .btn-repeat");
const randomSongBtn = $(".control .btn-random");
const volumeIcon = $(".volume-on-off");
const volumeUpBtn = $(".volume-on-off .btn-volume-up");
const volumeMuteBtn = $(".volume-on-off .btn-volume-mute");
const player = $(".player"); 
const progress = $("#progress");
const playlist = $(".playlist");
const volume = $(".volume-progress #volume");
const currentTime = $(".song-time .current-time");
const durationTime = $(".song-time .duration-time");
console.log(volume);

// Songs data
const songs = [
    {
        name: "Angels Speak",
        singer: "Justin Bieber feat Poo Bear",
        path: "./assets/music/angels speak ft Poo Bear - Justin Bieber.mp3",
        image: "./assets/img/angels speak ft Poo Bear - Justin Bieber.webp"
    },
    {
        name: "Anyone",
        singer: "Justin Bieber",
        path: "./assets/music/anyone - Justin Bieber.mp3",
        image: "./assets/img/anyone - Justin Bieber.png"
    },
    {
        name: "Favorite Human",
        singer: "Poo Bear",
        path: "./assets/music/favorite human - Poo Bear.mp3",
        image: "./assets/img/favorite human - Poo Bear.jpg"
    },
    {
        name: "Forever",
        singer: "Justin Bieber",
        path: "./assets/music/forever ft Post Malone - Justin Bieber.mp3",
        image: "./assets/img/forever - Justin Biber.jpg"
    },
    {
        name: "Nothing Is Lost (You Give Me Strengh)",
        singer: "The Weeknd",
        path: "./assets/music/nothing is lost (you give me strength) - The Weeknd.mp3",
        image: "./assets/img/nothing is lost (you give me strengh) - The Weeknd.jpg"
    },
    {
        name: "Overtime",
        singer: "Chris Brown",
        path: "./assets/music/overtime - Chris Brown.mp3",
        image: "./assets/img/overtime - Chris Brown.jpg"
    },
    {
        name: "Star Walkin",
        singer: "Lil Nas X",
        path: "./assets/music/star walkin - Lil Nas X.mp3",
        image: "./assets/img/star walkin - Lil Nas X.jpg"
    },
    {
        name: "Wish You Would",
        singer: "Justin Bieber",
        path: "./assets/music/wish you would - Justin Bieber.mp3",
        image: "./assets/img/wish you would - Justin Bieber.webp"
    }
];

const musicPlayerApp = {
    songs,
    currentIndex: 0,
    currentVolume: 0.2,
    isPlayed: false,
    isRepeat: false,
    isRandom: false,
    isMuted: false,
    arrIndexAppeared: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {
		isRepeat: false,
		isRandom: false,
        isMuted: false,
		currentIndex: 0,
		// currentTime: 0,
        currentVolume: 0.2,
	},

    // Start music player app
    startApp: function () {

        this.loadConfig();

        this.defineProperties();

        this.renderSongs();

        this.loadCurrentSong();

        this.handleEvents();

    },

    // Render html songs
    renderSongs: function() {
        let htmls = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? "active" : ''}" data-index=${index}>
                        <div class="thumb" style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`;
        });
        $(".player .playlist").innerHTML = htmls.join('');
    },

    setConfig: function(key, value){
        this.config[key] = value;
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    loadConfig: function(){
        this.isRepeat = this.config.isRepeat;
        this.isRandom = this.config.isRandom;
        this.isMuted = this.config.isMuted;
        this.currentVolume = this.config.currentVolume;
		this.currentIndex = this.config.currentIndex;

        repeatSongBtn.classList.toggle("active", this.isRepeat);
        randomSongBtn.classList.toggle("active", this.isRandom);
        volumeIcon.classList.toggle("active", this.config.isMuted);
        volume.value = this.isMuted === true ? 0 : this.currentVolume * 100;
        audio.volume = this.currentVolume;
        
    },
    
    // Handle app events
    handleEvents: function () {
        const _this = this;

        // Handle playlist scroll event 
        const cdWidth = cd.offsetWidth;
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = (newCdWidth > 0) ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Handle song play event
        togglePlayBtn.onclick = function() {
            if(!_this.isPlayed){
                audio.play();   
            }
            else{
                audio.pause();    
            }
        }

        // Handle rotate CD
        const cdThumbAnimation = this.rotateCD();
        cdThumbAnimation.pause();

        // Handle when play
        audio.onplay = function() {
            _this.isPlayed = true;  
            player.classList.add("playing");
            cdThumbAnimation.play();
            _this.setConfig("currentIndex", _this.currentIndex);   
        }

        // Handle when pause
        audio.onpause = function() {
            _this.isPlayed = false;
            player.classList.remove("playing");
            cdThumbAnimation.pause();
        }

        // Handle when running song
        audio.ontimeupdate = function() {
            if(audio.duration){
                const progressPercent = (this.currentTime / this.duration) * 100;
                progress.value = progressPercent;
                currentTime.innerText = _this.timeFormat(this.currentTime);
                durationTime.innerText = _this.timeFormat(this.duration);
            }
        }

        // Handle when seek 
        progress.oninput = function(event) {
            const progressPercent = event.target.value;
            if(audio.duration) {
                const seekTime = (progressPercent * audio.duration) / 100;
                audio.currentTime = seekTime;
                audio.play();
            }
        }

        // Handle next song 
        nextSongBtn.onclick = function () {   
            if(_this.isRandom){
                _this.randomSong();
            }
            else{
                _this.nextSong();
            }
            audio.play();
            _this.scrollToActiveSong();
        }

        // Handle prev song
        prevSongBtn.onclick = function () {
            if(_this.isRandom){
                _this.randomSong();
            }
            else{
                _this.prevSong();
            }
            audio.play(); 
            _this.scrollToActiveSong();   
        }

        // Handle active random song button
        randomSongBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            this.classList.toggle("active", _this.isRandom); 
            _this.setConfig("isRandom", _this.isRandom);        

        };

        // Handle active repeat song button 
        repeatSongBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            this.classList.toggle("active", _this.isRepeat);  
            _this.setConfig("isRepeat", _this.isRepeat);        
        };

        // Handle repeat/next song at the end of the song
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play();
            }
            else{
                nextSongBtn.click();    
            }
        };

        // Play song when click
        playlist.onclick = function(e) {
            // Handle nodes after render
            const songNode = e.target.closest(".song:not(.active)");
      
            if (songNode || e.target.closest(".option")) {
              // Handle when clicking on the song
              if (songNode) {
                let songNodeList = playlist.querySelectorAll(".song");
                songNodeList[_this.currentIndex].classList.remove("active");
                _this.currentIndex = Number(songNode.dataset.index);
                songNodeList[_this.currentIndex].classList.add("active");
                _this.loadCurrentSong();
                audio.play();
              }
      
              // Handle when clicking on the song option
              if (e.target.closest(".option")) {

              }
            }
        };

        // Handle volume change
        volume.oninput = function(event) {
            _this.currentVolume = event.target.value / 100;
            _this.isMuted = _this.currentVolume === 0 ? true : false;

            audio.volume =  _this.currentVolume;
            volumeIcon.classList.toggle("active", _this.isMuted);

            _this.setConfig("isMuted", _this.isMuted);
            _this.setConfig("currentVolume", _this.currentVolume);
        }

        // Handle click mute/on volume
        volumeIcon.onclick = function() {
            _this.isMuted = !_this.isMuted;

            if(_this.isMuted){
                audio.volume = 0;
                volume.value = 0;
            }
            else{
                _this.currentVolume = _this.currentVolume === 0 ? 0.5 : _this.currentVolume;
                audio.volume = _this.currentVolume;
                volume.value = _this.currentVolume * 100;
            }

            volumeIcon.classList.toggle("active", _this.isMuted);
            _this.setConfig("isMuted", _this.isMuted);
        }
    },

    // Define properties for app
    defineProperties: function() {
        // Define currentSong property. Get current song
        Object.defineProperty(this, "currentSong", {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });

    },

    // Load current song
    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;;
        var path = './assets/music/anyone - Justin Bieber.mp3';
        // Update encoded src because song name has space. Audio Object do not understand.
        audio.src = encodeURIComponent(this.currentSong.path);
        audio.onloadedmetadata = function() {
            durationTime.innerText = musicPlayerApp.timeFormat(audio.duration);
        };
    },

    // Rotate CD
    rotateCD: function() {
        cdSpinning = [
            { transform: 'rotate(360deg)'},
        ];
        cdTiming = {
            duration: 10000,
            iterations: Infinity
        }

        return cdThumb.animate(
            cdSpinning,
            cdTiming
        );
    },

    // Next song
    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex > this.songs.length - 1){
            this.currentIndex = 0;
        }

        let prevIndex = this.currentIndex != 0 ? this.currentIndex - 1 : this.songs.length - 1;
        let songNodeList = $$(".playlist .song");
        songNodeList[prevIndex].classList.remove("active");
        songNodeList[this.currentIndex].classList.add("active");

        this.loadCurrentSong();
    },

    // Prev song
    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }

        let nextIndex = this.currentIndex != this.songs.length - 1 ? this.currentIndex + 1 : 0;
        let songNodeList = $$(".playlist .song");
        songNodeList[nextIndex].classList.remove("active");
        songNodeList[this.currentIndex].classList.add("active");

        this.loadCurrentSong();
    },

    // Random song
    randomSong: function () {  
        let songNodeList = $$(".playlist .song"); 
        songNodeList[this.currentIndex].classList.remove("active"); 

        if(this.arrIndexAppeared.length === this.songs.length){
            this.arrIndexAppeared = [];
        }

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex || this.arrIndexAppeared.includes(newIndex));

        songNodeList[newIndex].classList.add("active");

        this.arrIndexAppeared.push(newIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    //  Scroll active song into view
    scrollToActiveSong: function() {
        // Drag the block to the end position
        setTimeout(() => {
          $(".song.active").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        }, 300);
    },

    // Format time with timestamp input
    timeFormat: function (timestamp, options = 'default') {
        let result;
        timestamp = Math.floor(timestamp);
        if(options === 'default'){
            let minutes = Math.floor(timestamp / 60);
            let seconds = timestamp - (minutes * 60);
            seconds = seconds < 10 ? `0${seconds}` : seconds;
            result = `${minutes}:${seconds}`;
        }
        return result;
    },

}


musicPlayerApp.startApp();


