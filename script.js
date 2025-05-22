document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const analyzeBtn = document.getElementById("analyzeBtn")
    const userInput = document.getElementById("userInput")
    const resultContainer = document.getElementById("resultContainer")
    const loadingIndicator = document.getElementById("loadingIndicator")
    const resultSection = document.getElementById("resultSection")
  
  
    // Audio elements for each sentiment
    let currentAudio = null
    let isMuted = false
  
    // Volume controls
    const volumeSlider = document.getElementById("volumeSlider")
    const volumeIcon = document.querySelector(".fa-volume-up")
  
    // Event listener for analyze button
    analyzeBtn.addEventListener("click", () => {
      const text = userInput.value.trim()
  
      if (text === "") {
        // Clear previous content and show the error message
        resultContainer.innerHTML = "<p style='color: white;'>Please enter some text to analyze.</p>";
        resultContainer.classList.remove("hidden"); 
        resultContainer.classList.add("show"); // Ensure it's visible
        resultSection.style.minHeight = "auto"; // Adjust height dynamically
        loadingIndicator.classList.add("hidden"); // Ensure loading doesn't show
        return;
      }
  
      // Show loading indicator
      resultContainer.classList.add("hidden")
      resultContainer.classList.remove("show")
      loadingIndicator.classList.remove("hidden")
      resultSection.style.minHeight = "300px"
  
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
  
      // Simulate processing delay for better UX
      setTimeout(() => {
        predictSentiment(text)
      }, 1500)
    })
  
    // Function to analyze sentiment
    function predictSentiment(text) {
      fetch("http://127.0.0.1:8991/predict", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ review: text }),
      })
        .then((response) => response.json())
        .then((data) => {
          const sentiment = data.sentiment
          displayResult(sentiment, text)
        })
        .catch((error) => {
          console.error("Error: ", error)
          displayError()
        })
    }
  
    // Function to display the sentiment result
    function displayResult(sentiment, text) {
      // Hide loading indicator
      loadingIndicator.classList.add("hidden")
      resultContainer.classList.remove("hidden")
  
      // Prepare data based on sentiment
      const sentimentClass = sentiment.toLowerCase()
      let sentimentColor = ""
      let albumImage = ""
      let audioFile = ""
  
      switch (sentimentClass) {
        case "positive":
          sentimentColor = "var(--positive-color)"
          albumImage = "happy.jpg" // Placeholder for happy music
          audioFile = "positive.mp3" // Audio file for positive sentiment
          message = "You should listen to some upbeat music!"
          break
        case "negative":
          sentimentColor = "var(--negative-color)"
          albumImage = "sad.jpg" // Placeholder for sad music
          audioFile = "negative.mp3" // Audio file for negative sentiment
          message = "Take some time to relax with some calming music."
          break
        default: // neutral
          sentimentColor = "var(--neutral-color)"
          albumImage = "chill.jpg" // Placeholder for neutral music
          audioFile = "neutral.mp3" // Audio file for neutral sentiment
          message = "Keep it chill with some ambient sounds."
      }
  
// Create equalizer bars with dynamic delays
let equalizerBars = "";
for (let i = 0; i < 21; i++) {
    equalizerBars += `<div class="equalizer-bar" style="--index: ${i + 1}; animation: none;"></div>`;
}

  
      // Create a Spotify-like album display for the result
      resultContainer.innerHTML = `
            <div class="sentiment-result ${sentimentClass}">
             <div class="label-above-album">Click the album below to play the song.</div>
                <div class="album-art" data-audio="${audioFile}">
                    <img src="${albumImage}" alt="${sentiment} Mood" onerror="this.src='/error.png?height=180&width=180'">
                    <div class="album-overlay">
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="sentiment-details">
                    <div class="equalizer">
                        ${equalizerBars}
                    </div>
                    <div class="sentiment-title" style="color: ${sentimentColor}"> ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment</div>
                    <div class="sentiment-text">"${text.length > 100 ? text.substring(0, 100) + "..." : text}"</div>
                    <div class="sentiment-stats">
                        <div class="stat-item">
                            <div class="stat-value">${text.split(" ").length}</div>
                            <div class="stat-label">Words</div>
                        </div>
                    </div>
                </div>
            </div>
        `
  
      // Add animation class after a small delay to trigger the animation
      setTimeout(() => {
        resultContainer.classList.add("show")
      }, 50)
  
      // Add event listener to the play button and album art
      const albumArt = resultContainer.querySelector(".album-art")
      const playButton = resultContainer.querySelector(".play-button")
  
      if (albumArt && playButton) {
        // Create audio element
        const audio = new Audio(audioFile)
  
        // Function to handle play/pause
        const togglePlay = () => {
          // Stop any currently playing audio
          if (currentAudio && currentAudio !== audio) {
            currentAudio.pause()
            currentAudio.currentTime = 0
  
            // Reset any other play buttons
            const allPlayButtons = document.querySelectorAll(".play-button")
            allPlayButtons.forEach((btn) => {
              if (btn !== playButton) {
                btn.innerHTML = '<i class="fas fa-play"></i>'
              }
            })
  
                  // Reset any other equalizer animations
            const allEqualizers = document.querySelectorAll(".equalizer-bar");
            allEqualizers.forEach((bar) => {
            bar.style.animation = "none";
            bar.style.animationDelay = "0s";  // Reset animation delay
                });
            }
  
          // Toggle play/pause for current audio
          if (audio.paused) {
            audio.play()
            playButton.innerHTML = '<i class="fas fa-pause"></i>'
            currentAudio = audio
  
             // Animate the equalizer bars with delay
        const equalizerBars = resultContainer.querySelectorAll(".equalizer-bar");
        equalizerBars.forEach((bar, index) => {
            bar.style.animation = "equalize 1s ease-in-out infinite";
            bar.style.animationDelay = `${index * 0.1}s`;  // Set delay for each bar
        });
  
            // Update the now playing bar
            const trackIcon = document.querySelector(".track-icon");
            const img = document.createElement("img");
            img.src = albumImage;
            img.alt = "Album Image";
            trackIcon.innerHTML = ""; // Clear the existing content (e.g., the music icon)
            trackIcon.appendChild(img);
            document.querySelector(".track-name").textContent =
              `${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Mood`
            document.querySelector(".track-artist").textContent = message
            document.querySelector(".progress-completed").style.width = "0%"
  
            // Animate the progress bar based on audio duration
            let progress = 0
            const duration = audio.duration || 30 // Default to 30 seconds if duration not available
            const updateInterval = 100 // Update every 100ms
            const progressStep = (updateInterval / (duration * 1000)) * 100
  
            const progressInterval = setInterval(() => {
              if (audio.paused) {
                clearInterval(progressInterval)
                return
              }
  
              progress += progressStep
              document.querySelector(".progress-completed").style.width = `${Math.min(progress, 100)}%`
  
              if (progress >= 100) {
                clearInterval(progressInterval)
                playButton.innerHTML = '<i class="fas fa-play"></i>'
              }
            }, updateInterval)
  
            // When audio ends
            audio.onended = () => {
              playButton.innerHTML = '<i class="fas fa-play"></i>'
              equalizerBars.forEach((bar) => {
                bar.style.animation = "none"
              })
              currentAudio = null
            }
          } else {
            audio.pause()
            audio.currentTime = 0
            playButton.innerHTML = '<i class="fas fa-play"></i>'
            currentAudio = null
  
            // Stop equalizer animation
            const equalizerBars = resultContainer.querySelectorAll(".equalizer-bar")
            equalizerBars.forEach((bar) => {
              bar.style.animation = "none"
            })
          }
        }
  
        // Add click event to both album art and play button
        albumArt.addEventListener("click", togglePlay)
        playButton.addEventListener("click", (e) => {
          e.stopPropagation() // Prevent triggering the album art click event
          togglePlay()
        })
      }
    }
  
    // Function to display error message
    function displayError() {
      loadingIndicator.classList.add("hidden")
      resultContainer.classList.remove("hidden")
  
      resultContainer.innerHTML = `
                <div class="sentiment-result error">
                    <div class="album-art">
                        <img src="error.png?height=180&width=180" alt="Error">
                        <div class="album-overlay">
                            <div class="play-button">
                                <i class="fas fa-exclamation-circle"></i>
                            </div>
                        </div>
                    </div>
                    <div class="sentiment-details">
                        <div class="sentiment-title" style="color: #E91429">Analysis Error</div>
                        <div class="sentiment-text">Something went wrong while analyzing your review. Please try again.</div>
                    </div>
                </div>
            `
  
      setTimeout(() => {
        resultContainer.classList.add("show")
      }, 50)
    }
  

// Function to update the footer progress bar
function updateFooterProgressBar() {
    if (currentAudio) {
        const progressBar = document.querySelector(".progress-completed");
        const duration = currentAudio.duration;
        const currentTime = currentAudio.currentTime;

        // Calculate progress percentage
        const progressPercentage = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Only update the progress bar if audio is playing
        if (!currentAudio.paused) {
            requestAnimationFrame(updateFooterProgressBar);
        }
    }
}

// Play button functionality in the footer
const footerPlayButton = document.querySelector(".control-buttons .fa-play-circle");
footerPlayButton.addEventListener("click", () => {
    const audio = currentAudio;

    if (audio && audio.paused) {
        audio.play();
        footerPlayButton.classList.replace("fa-play-circle", "fa-pause-circle");

        // Reset the footer progress bar width to 0 before it starts
        document.querySelector(".progress-completed").style.width = "0%";

        // Start updating progress when audio starts
        updateFooterProgressBar();
    } else {
        audio.pause();
        footerPlayButton.classList.replace("fa-pause-circle", "fa-play-circle");
    }
});

 // Mute/Unmute functionality
 volumeIcon.addEventListener("click", () => {
    if (currentAudio) {
      isMuted = !isMuted
      currentAudio.muted = isMuted
      volumeIcon.classList.toggle("fa-volume-mute", isMuted)
      volumeIcon.classList.toggle("fa-volume-up", !isMuted)
    }
  })

// Volume slider functionality
volumeSlider.addEventListener("input", (event) => {
    if (currentAudio) {
      const volume = event.target.value / 100;
      currentAudio.volume = volume;
  
      // If the volume is at 0, mute the audio
      if (volume === 0) {
        currentAudio.muted = true;
        volumeIcon.classList.replace("fa-volume-up", "fa-volume-mute");
      } else {
        currentAudio.muted = false;
        volumeIcon.classList.replace("fa-volume-mute", "fa-volume-up");
      }
    }
  });
  


})
