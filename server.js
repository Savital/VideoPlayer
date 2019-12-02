// demo web video player project server

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();


video_path = process.argv[2];
if (video_path == undefined)
{
    video_path = 'test.mp4';
}
app.use('/static', express.static(__dirname + '/styles'));
app.use('/static', express.static(__dirname + '/scripts'));
app.use('/static', express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/view/index.html'))
});

app.get('/cold', function(req, res) {
    res.sendFile(path.join(__dirname + '/view/cold.html'))

});

app.get('/stream', function(req, res) {
    res.sendFile(path.join(__dirname + '/view/stream.html'))

});

app.get('/video', function(req, res) {
    const path = video_path
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1

        if(start >= fileSize) {
            res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
            return
        }

        const chunksize = (end-start)+1
        const file = fs.createReadStream(path, {start, end})
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }

        res.writeHead(206, head)
        file.pipe(res)
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
});

app.listen(3000, function () {
    console.log('Listening on port 3000!')
});


