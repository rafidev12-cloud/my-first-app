// Status awal
let ffmpeg = null;
let isFFmpegLoaded = false;
let videoBlob = null;

// Elemen DOM
const textInput = document.getElementById('textInput');
const bgColor = document.getElementById('bgColor');
const durationSlider = document.getElementById('duration');
const durationValue = document.getElementById('durationValue');
const previewBtn = document.getElementById('previewBtn');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const previewText = document.getElementById('previewText');
const outputVideo = document.getElementById('outputVideo');
const videoStatus = document.getElementById('videoStatus');
const progressContainer = document.querySelector('.progress-container');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const statusEl = document.getElementById('status');

// Update durasi
durationSlider.addEventListener('input', function() {
    durationValue.textContent = `${this.value} detik`;
});

// Pratinjau frame tunggal
previewBtn.addEventListener('click', function() {
    renderFrame(0);
    previewText.textContent = "Pratinjau frame pertama (t=0).";
});

// Render frame ke canvas
function renderFrame(timePercent) {
    const ctx = previewCtx;
    const width = previewCanvas.width;
    const height = previewCanvas.height;

    // Clear dengan warna pilihan
    ctx.fillStyle = bgColor.value;
    ctx.fillRect(0, 0, width, height);

    // Teks
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = textInput.value || "Contoh Teks";
    ctx.fillText(text, width / 2, height / 2 - 30);

    // Animasi sederhana (lingkaran bergerak)
    ctx.fillStyle = `hsl(${timePercent * 360}, 100%, 60%)`;
    const x = width / 2 + Math.cos(timePercent * Math.PI * 2) * 200;
    const y = height / 2 + 50 + Math.sin(timePercent * Math.PI * 2) * 50;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Info waktu
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '24px Arial';
    ctx.fillText(`Waktu: ${(timePercent * parseFloat(durationSlider.value)).toFixed(1)}s`, width / 2, height - 40);
}

// Inisialisasi FFmpeg
async function loadFFmpeg() {
    statusEl.textContent = "Status: Memuat FFmpeg...";
    if (!ffmpeg) {
        const { createFFmpeg, fetchFile } = FFmpeg;
        ffmpeg = createFFmpeg({
            log: true,
            corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
        });
    }

    if (!isFFmpegLoaded) {
        await ffmpeg.load();
        isFFmpegLoaded = true;
        statusEl.textContent = "Status: FFmpeg siap.";
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Hasilkan Video';
    }
}

// Generate video
generateBtn.addEventListener('click', async function() {
    if (!isFFmpegLoaded) {
        alert("FFmpeg masih loading. Tunggu beberapa detik.");
        return;
    }

    // UI state
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    videoStatus.textContent = "Menyusun frame...";
    progressContainer.style.display = 'block';
    outputVideo.style.display = 'none';

    const duration = parseFloat(durationSlider.value);
    const fps = 30;
    const totalFrames = Math.floor(duration * fps);

    // 1. Render setiap frame ke canvas dan kumpulkan data URL
    let frameFiles = [];
    for (let i = 0; i < totalFrames; i++) {
        const percent = i / totalFrames;
        renderFrame(percent);
        const dataURL = previewCanvas.toDataURL('image/jpeg', 0.8);
        frameFiles.push(dataURL);

        // Update progress
        const progress = ((i + 1) / totalFrames) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Menyusun frame: ${Math.round(progress)}%`;
    }

    // 2. Konversi dataURL ke blob dan tulis ke memori FFmpeg
    progressText.textContent = "Mengkonversi frame...";
    for (let i = 0; i < frameFiles.length; i++) {
        const blob = await (await fetch(frameFiles[i])).blob();
        const uint8Array = new Uint8Array(await blob.arrayBuffer());
        ffmpeg.FS('writeFile', `frame${i.toString().padStart(4, '0')}.jpg`, uint8Array);
    }

    // 3. Buat file list untuk FFmpeg
    let listContent = '';
    for (let i = 0; i < frameFiles.length; i++) {
        listContent += `file 'frame${i.toString().padStart(4, '0')}.jpg'\n`;
        listContent += `duration ${1/fps}\n`;
    }
    ffmpeg.FS('writeFile', 'filelist.txt', listContent);

    // 4. Jalankan FFmpeg untuk encode video
    progressText.textContent = "Encoding video (mungkin 10-30 detik)...";
    await ffmpeg.run(
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', `${fps}`,
        '-y',
        'output.mp4'
    );

    // 5. Baca hasil dan buat video element
    const data = ffmpeg.FS('readFile', 'output.mp4');
    videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
    const videoURL = URL.createObjectURL(videoBlob);

    outputVideo.src = videoURL;
    outputVideo.style.display = 'block';
    videoStatus.textContent = "Video siap!";
    downloadBtn.disabled = false;

    // Reset UI
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Hasilkan Video';
    progressText.textContent = "Selesai!";
    statusEl.textContent = "Status: Video dihasilkan.";
});

// Download video
downloadBtn.addEventListener('click', function() {
    if (!videoBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(videoBlob);
    a.download = `video_generated_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Load FFmpeg saat start
loadFFmpeg().catch(err => {
    console.error("Gagal load FFmpeg:", err);
    statusEl.textContent = "Status: Gagal load FFmpeg.";
    statusEl.style.color = "#e74c3c";
});