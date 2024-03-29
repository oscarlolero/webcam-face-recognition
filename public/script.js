const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const displaySize = { width: video.width, height: video.height };
let trainImage, faceMatcher;

document.getElementById('train').addEventListener('click', async () => {
    trainImage = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions().withFaceDescriptor();
    faceMatcher = new faceapi.FaceMatcher(trainImage, 0.6);
    canvas.style.top = '20px';
    console.log('Entrenado');
    console.log(trainImage);
    console.log(faceMatcher);
});

const start = async () => {
    navigator.getUserMedia(
        {video: {}},
        stream => video.srcObject = stream,
        err => console.error(err)
    );
    setInterval(async () => {
        const result = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions().withFaceDescriptor();
        if (result && faceMatcher) {
            const bestMatch = faceMatcher.findBestMatch(result.descriptor);
            const resizedResult = faceapi.resizeResults(result, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedResult);
            faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
            document.getElementById('expressions').innerHTML = `Neutral: ${result.expressions.neutral.toFixed(2)}, Feliz: ${result.expressions.happy.toFixed(2)}, Sad: ${result.expressions.sad.toFixed(2)}, Enojado: ${result.expressions.angry.toFixed(2)}, Sorprendido: ${result.expressions.surprised.toFixed(2)}, Asustado: ${result.expressions.fearful.toFixed(2)}`;
            if (bestMatch.label === 'unknown') {
                document.getElementById('detected').innerHTML = `<p style="color: red">Rostro no autorizado.</p>`
            } else {
                document.getElementById('detected').innerHTML = `<p style="color: green">Rostro autorizado.</p> Margen error: ${Math.round(bestMatch.distance * 100)}%`
            }
            //console.log(bestMatch);
        } else {
            document.getElementById('detected').innerHTML = 'No se detecta ninguna cara.';
            document.getElementById('expressions').innerHTML = '';
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
    }, 300);
};

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    // faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
]).then(start);