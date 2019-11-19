const video = document.getElementById('video');
let trainImage, faceMatcher;

document.getElementById('train').addEventListener('click', async () => {
    trainImage = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceExpressions().withFaceDescriptor();
    faceMatcher = new faceapi.FaceMatcher(trainImage);
    console.log('Entrenado');
});

const start = async () => {
    startVideo();
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.append(container);
    setInterval(async () => {
        const result = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceExpressions().withFaceDescriptor();

        if (result) {
            const bestMatch = faceMatcher.findBestMatch(result.descriptor);
            if (bestMatch.label === 'unknown') {
                document.getElementById('detected').innerHTML = `Rostro no autorizado. Margen error: ${Math.round(bestMatch.distance * 100)}%`
            } else {
                document.getElementById('detected').innerHTML = `Rostro autorizado. Margen error: ${Math.round(bestMatch.distance * 100)}%`
            }
            console.log(bestMatch);
        } else {
            document.getElementById('detected').innerHTML = 'No se detecta ninguna cara.'
        }
    }, 1000);
};

const startVideo = () => {
    navigator.getUserMedia(
        {video: {}},
        stream => video.srcObject = stream,
        err => console.error(err)
    )
};

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
]).then(start);

