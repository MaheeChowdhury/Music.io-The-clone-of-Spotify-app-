console.log('Lets write javascript');
let currentSong = new Audio();//This is a Global variable
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if(isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    // Instead of parsing a Live Server directory listing (which doesn't exist on Vercel),
    // fetch the songs.json manifest that lives inside this album folder.
    let a = await fetch(`/${folder}/songs.json`)
    songs = await a.json();

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Micheal</div>
                            </div>
                            <div class="playnow">
                                <img class="invert" src="play.svg" alt="">
                                <span>Play Now!</span>
                            </div> </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playMusic = (track, pause=false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if(!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

//display att the albums on the page
async function displayAlbums() {
    // Instead of parsing a Live Server directory listing, fetch the albums.json manifest
    let a = await fetch(`/songs/albums.json`)
    let albums = await a.json();
    let cardContainer = document.querySelector(".cardContainer")
    cardContainer.innerHTML = ""

    for (const folder of albums) {
        //Get the metadata of the folder
        let a = await fetch(`/songs/${folder}/info.json`)
        let response = await a.json();
        console.log(response)
        cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round">
<path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"></path>
</svg>
</div>
                   <img src="/songs/${folder}/cover.jpg" alt="">
                   <h2>${response.title}</h2>
                          <p>${response.Description}</p>
                </div>`
    }

       //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{ // REMEMBER : not .card it's card
        console.log(e)
        e.addEventListener("click", async item=>{
            console.log("Fetching Songs");
            console.log(item.target, item.currentTarget.dataset);
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {

    //Get the list of all the songs
    await getSongs("songs/ncs") //ncs - no copyright songs
    playMusic(songs[0], true)

    if (songs.length === 0) {
        throw new Error("No songs found in the songs folder.");
    }

    //Attach an eventlistener to play, next and previous song
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "pause.svg"
        } else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //Here the displayAlbums function gets called
    displayAlbums()

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"; //for the circle moving along with the song
    })

    //Add an eventlistner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100 //dividing by 100 because we need the exact seconds
    })

    //Add an eventlistener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0" 
    })

    //Add an eventlistener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%" 
    })
    
    //Add an eventlistener to previous
    previous.addEventListener("click", ()=>{
        console.log("Previous clicked!");
        console.log(currentSong);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]) //finding the index of the current song
        // currentSong.src.split("/").slice(-1) [0] //this splits the current song src and gets the last .mp3 file 
        console.log(songs, index); //this shows all the songs present in the songs folder after clicking the next button
        if((index - 1) >= 0) {
            playMusic(songs[index - 1]) //if the length is 3 (1 2 3) and the index is 2 (0 1 2) then it will play the next song which is index + 1 = 3 but since the length is 3 it will not play the next song because there is no song at index 3. So we need to check if the index + 1 is less than the length of the songs array. If it is then we can play the next song otherwise we can play the first song again.
        }
    })

    //Add an eventlistener to next
    next.addEventListener("click", ()=>{
        currentSong.pause() //pause the current song before playing the next song
        console.log("Next clicked!");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]) //finding the index of the current song
        // currentSong.src.split("/").slice(-1) [0] //this splits the current song src and gets the last .mp3 file 
        console.log(songs, index); //this shows all the songs present in the songs folder after clicking the next button
        if((index + 1) < songs.length) {
            playMusic(songs[index + 1]) //if the length is 3 (1 2 3) and the index is 2 (0 1 2) then it will play the next song which is index + 1 = 3 but since the length is 3 it will not play the next song because there is no song at index 3. So we need to check if the index + 1 is less than the length of the songs array. If it is then we can play the next song otherwise we can play the first song again.
        } 
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log(e, e.target, e.target.value);
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100 //volume is between 0 and 1 so we need to divide by 100
    })

    //add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value= 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value= 10;
        }
    })
}

main()