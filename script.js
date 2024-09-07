let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    // Convert the input to an integer in case it's not
    const totalSeconds = parseInt(seconds, 10);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Format minutes and seconds to be two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}

// // Example usage
// console.log(formatTime(12));  // Output: "00:12"
// console.log(formatTime(75));  // Output: "01:15"
// console.log(formatTime(3600));  // Output: "60:00"



async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }

    //show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
                <li>
                                    <img class="invert" src="img/music.svg" alt="">
                                    <div class="info">
                                        <div>${song.replaceAll("%20", " ")}</div>
                                        
                                    </div>
                                    <div class="playnow">
                                        <span>Play Now</span>
                                        <img class="invert" src="img/play.svg" alt="">
                                    </div>
                                
                
                
                
                </li>`;

    }

   
    //Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector('.info').firstElementChild.innerHTML)
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());

        })
    });
    return songs;


}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    // let audio=new Audio("/songs/" + track)
    if (!pause) {

        currentSong.play();
        play.src = "img/pause.svg";
    }
    else{
        play.src="img/play.svg";
    }



    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array=Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
    
    
        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0];
            //get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML+`
                    <div data-folder="${folder}" class="card ">
                        <div  class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                height="50px" width="50px" version="1.1" id="Capa_1" viewBox="0 0 60 60"
                                xml:space="preserve">
                                <circle cx="30" cy="30" r="30" fill="#1fdf64" />
                                <path fill="#000000"
                                    d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30 c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15 C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z" />
                            </svg>
                        </div>

                        <img src="/songs/${folder}/cover.jpg" alt="sorry">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])

        })
    });
    
}

async function main() {

    //Get the list of songs
    await getsongs("songs/oldSongs");
    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums()


    // Attach an even listener to play, next and previous
    play.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play();
            
            play.src = "img/pause.svg";
            

        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
            
            

        }
    })


    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
       console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}:${formatTime(currentSong.duration)}`;

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })


    //add an event listner to seekbar
    document.querySelector('.seekbar').addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })


    //add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".close > img").style.display = "block";
    })

    //add an event listner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".close > img").style.display = "none";
    })

    //Add an event listner to previous and next
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
            play.src = "img/pause.svg";
        }
        else {
            playMusic(songs[songs.length - 1])
            play.src = "img/pause.svg";
        }
    })
    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
            play.src = "img/pause.svg";
        }
        else {
            playMusic(songs[0]);
            play.src = "img/pause.svg";
        }
    })

    //add an event listner for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        currentSong.volume = parseInt(e.target.value) / 100;

        if (currentSong.volume == 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg";
        }
        else {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg";
        }
    })

    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);

        })
    });

}

main();