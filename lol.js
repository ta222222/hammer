// === ELEMENT REFERENCES ===
const video       = document.getElementById("webcam");
const ditheredImg = document.getElementById("dithered");
const fpsSpan     = document.getElementById("fps");
const resSpan     = document.getElementById("res");

// === OFFSCREEN CANVAS FOR PROCESSING ===
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// === STATE ===
let running = false;
let frameCount = 0;
let lastSecond = performance.now();

// === GET WEBCAM ===
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => alert("Could not access webcam: " + err));


// === MAIN PROCESSING LOOP ===
function renderLoop() {
    if (!running) return;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {

        // Resize if video changes resolution
        if (canvas.width !== video.videoWidth) {
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        // Mirror & draw frame to canvas
        ctx.save();
        ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Get pixel data for dithering
        let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Your dithering function from lol.js
        ditherImage(frame.data);   // Faster direct pixel manipulation

        // Put modified pixels back
        ctx.putImageData(frame, 0, 0);

        // Display on <img>
        ditheredImg.src = canvas.toDataURL("image/jpeg", 0.5);

        // FPS Tracking
        frameCount++;
        let now = performance.now();
        if (now - lastSecond >= 1000) {
            fpsSpan.textContent = frameCount;
            frameCount = 0;
            lastSecond = now;
        }

        // Resolution display
        resSpan.textContent = `${canvas.width} x ${canvas.height}`;
    }

    requestAnimationFrame(renderLoop);
}


// === START LOOP ONCE ===
video.addEventListener("play", () => {
    if (!running) {
        running = true;
        renderLoop();
    }
});
