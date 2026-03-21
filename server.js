const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Bellekte tutulan anlık radar verisi
let currentRadarData = {
    mapName: "de_dust2",
    players: []
};

// Hileden gelen veriyi (C++ POST isteği) alıp Web arayüzüne (Socket.IO) gönder
app.post('/update', (req, res) => {
    if (req.body && req.body.mapName) {
        currentRadarData.mapName = req.body.mapName;
        currentRadarData.players = req.body.players || [];
        
        // Bağlı tüm tarayıcılara yeni veriyi 0 gecikme ile ilet
        io.emit('radarUpdate', currentRadarData);
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

// Tarayıcı ile ilk bağlantı
io.on('connection', (socket) => {
    console.log('Yeni istemci bağlandı');
    socket.emit('radarUpdate', currentRadarData);
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`WebRadar onrender sunucusu ${PORT} portunda çalışıyor...`);
});
