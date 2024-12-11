document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "http://informatica.iesalbarregas.com:7008/songs/";
  const cardsContainer = document.getElementById("cardsContainer");
  const localStorageKey = "favoritos";
  const botonFavoritos = document.getElementById("cancionesFavoritas");
  const inicio = document.getElementById("inicio");

  let currentSongIndex = 0;
  let audio = new Audio(); 
  let isPlaying = false;
  let progressBar = document.getElementById("seek_slider");
  let volumeSlider = document.getElementById("volume_slider");
  let playPauseBtn = document.getElementById("playpause-track");
  let prevBtn = document.getElementById("prev-track");
  let nextBtn = document.getElementById("next-track");
  let trackArt = document.getElementById("track-art-footer");
  let trackName = document.getElementById("track-name-footer");
  let trackArtist = document.getElementById("track-artist-footer");
  let currentTimeDisplay = document.getElementById("current-time");
  let totalDurationDisplay = document.getElementById("total-duration");

  const addSongModal = document.getElementById("addSongModal");
  const closeModal = document.getElementById("closeModal");
  const botonAñadir = document.getElementById("botonAñadir");
  const songForm = document.getElementById("song-form");

  botonAñadir.addEventListener("click", function () {
    addSongModal.style.display = "block"; 
  });

  closeModal.addEventListener("click", function () {
    closeModalFunc();
  });

  window.addEventListener("click", function (event) {
    if (event.target === addSongModal) {
      closeModalFunc();
    }
  });

  function closeModalFunc() {
    addSongModal.style.display = "none";
    songForm.reset(); 
  }

  /*
  songForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;

    if (isValid) {
      const form = document.getElementById("song-form");
      const formData = new FormData(form); 
      uploadSong(formData);
    }
  });

  async function uploadSong(formData) {
    try {
      const url = "http://informatica.iesalbarregas.com:7008/upload/";
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Subida exitosa:", data);
        alert("Canción añadida correctamente.");
        fetchSongs();
        closeModalFunc();
      } else {
        const errorText = await response.text();
        throw new Error(
          `Error en la subida: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error al subir la canción:", error);
      alert("Hubo un error al subir la canción. Inténtalo de nuevo.");
    }
  }
*/
  // Fetch y mostrar canciones
  async function fetchSongs() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const songs = await response.json();
      displaySongs(songs);
    } catch (error) {
      console.error("Error al obtener las canciones:", error);
      cardsContainer.innerHTML = "<p>Error al cargar las canciones.</p>";
    }
  }

  // Mostrar canciones en las tarjetas
  function displaySongs(songs) {
    const favoritos = getFavorites();
    cardsContainer.innerHTML = "";

    songs.forEach((song, index) => {
      const card = document.createElement("div");
      card.className = "cards";

      const isFavorite = favoritos.some((fav) => fav.id === song.id);

      card.innerHTML = `
            <div class="card_imagen">
                <img src="${song.cover}" alt="Imagen Artista">
            </div>
            <div class="card_text">
                <div class="card_titulo">
                    <h4>${song.title}</h4>
                    <h4>-</h4>
                    <h4>${song.artist}</h4>
                </div>
                <div>
                    <img class="noMeGusta ${
                      isFavorite ? "hidden" : ""
                    }" src="img/noMeGusta.png" alt="No Me Gusta" style="margin-left: 10px;">
                    <img class="meGusta ${
                      isFavorite ? "" : "hidden"
                    }" src="img/meGusta.png" alt="Me Gusta" style="margin-left: 10px;">
                    <img src="img/play.svg" alt="Reproducir" class="play-btn" data-index="${index}" style="margin-left: 10px;">
                </div>
            </div>
        `;

      const noMeGusta = card.querySelector(".noMeGusta");
      const meGusta = card.querySelector(".meGusta");

      noMeGusta.addEventListener("click", () => {
        noMeGusta.classList.add("hidden");
        meGusta.classList.remove("hidden");
        addToFavorites(song);
      });

      meGusta.addEventListener("click", () => {
        meGusta.classList.add("hidden");
        noMeGusta.classList.remove("hidden");
        removeFromFavorites(song.id);
      });

      const playButton = card.querySelector(".play-btn");
      playButton.addEventListener("click", () => {
        playSong(song, index);
      });

      cardsContainer.appendChild(card);
    });
  }

  // Obtener favoritos del localStorage
  function getFavorites() {
    const favoritos = localStorage.getItem(localStorageKey);
    return favoritos ? JSON.parse(favoritos) : [];
  }

  // Añadir una canción a favoritos
  function addToFavorites(song) {
    const favoritos = getFavorites();
    if (!favoritos.some((fav) => fav.id === song.id)) {
      favoritos.push(song);
      localStorage.setItem(localStorageKey, JSON.stringify(favoritos));
      console.log(`Añadido a favoritos: ${song.title}`);
    }
  }

  // Eliminar una canción de favoritos
  function removeFromFavorites(songId) {
    let favoritos = getFavorites();
    favoritos = favoritos.filter((fav) => fav.id !== songId);
    localStorage.setItem(localStorageKey, JSON.stringify(favoritos));
    console.log(`Eliminado de favoritos: ${songId}`);
  }

  function playSong(song, index) {
    console.log(song);
    if (isPlaying && currentSongIndex === index) {
      audio.pause();
      isPlaying = false;
      playPauseBtn.src = "img/play_footer.svg";
    } else {
      if (!isPlaying || currentSongIndex !== index) {
        if (song.filepath) {
          audio.src = song.filepath;
        } else {
          console.error("La canción no tiene URL de audio");
          return;
        }

        audio.onerror = function () {
          console.error("Error al cargar la canción: ", song.filepath);
          alert("No se pudo cargar la canción.");
          return;
        };

        audio.play().catch((error) => {
          console.error("Error al intentar reproducir la canción: ", error);
          alert("No se pudo reproducir la canción.");
        });

        isPlaying = true;
        currentSongIndex = index;
        playPauseBtn.src = "img/pause.png";
        playPauseBtn.style.width = "40px";

        trackName.textContent = song.title;
        trackArtist.textContent = song.artist;
        trackArt.src = song.cover;

        audio.addEventListener("ended", () => {
          nextSong();
        });
      }
    }
  }

  // Mostrar favoritos
  function mostrarFavoritos() {
    const favoritos = getFavorites();
    displaySongs(favoritos);
  }

  botonFavoritos.addEventListener("click", function () {
    mostrarFavoritos();
    inicio.classList.remove("active");
    botonFavoritos.classList.add("active");
  });

  // Configuración del progreso y volumen
  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
    totalDurationDisplay.textContent = formatTime(audio.duration);
  });

  progressBar.addEventListener("input", () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value / 100;
  });

  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      playPauseBtn.src = "img/play_footer.svg";
    } else {
      audio.play();
      isPlaying = true;
      playPauseBtn.src = "img/pause.png";
    }
  });

  // Función para formatear el tiempo de la cancion
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = Math.floor(seconds % 60);
    return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  }

  fetchSongs();
});
