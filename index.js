// inisialisasi express app
var app = require('express')();

// inisialisasi express server
var http = require('http').createServer(app);

// inisialisasi socket io yang listening ke server instance
var io = require('socket.io')(http);
var CryptoJS = require('crypto-js');

// inisialisasi crypto js SHA256
const SHA256 = require('crypto-js/sha256');
var express = require('express');

// ketika ada yang masuk maka akan di bawa ke menu.html
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.json({"tes" : "tes"})
    //res.sendFile(__dirname + '/menu.html');
});

function generateSalt(index) {
    // bikin sebuah pola
    //var pattern = Math.pow((index * (2 * index)), 3);
    var pattern = Math.pow(( 1/2 * index* (2 * 5/6 * index)), 8) ;

    // ubah pattern menjadi string
    var pattern_string = pattern.toString();

    // hash string_pattern
    var hash_pattern = SHA256(pattern_string).toString();

    return hash_pattern;
};
var index = 0;
var previous_hash = 'Genesis Hash';
// setiap ada client connect maka akan dikirim kesini
io.on('connection', function (socket) {
    console.log('Ada yang join');
    // chat message = grup dan nama nya bebas
    socket.on('chat message', function (data) {
        
        // increment index
        index = index + 1;

        // inisialisasi timestamp
        var date = new Date();
        var timestamp = date.toUTCString();

        // inisialisasi timestamp
        var salt = generateSalt(index);

        // inisialisasi nonce
        var nonce = SHA256(data + salt).toString();

        var hash = SHA256(index.toString() + data + timestamp + nonce + previous_hash).toString();

        var block = {
            'index': index,
            'data': data,
            'timestamp': timestamp,
            'nonce': nonce,
            'hash': hash,
            'previous_hash': previous_hash
        };
        
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(block), 'kunci rahasia').toString();

        console.log('data input: ', ciphertext);
        io.emit('clientevent', ciphertext); // ngasi block ke client kita atau mengirim block ke client || emit adalah mengirim , ke 'clientevent' dan mengirim object block
        previous_hash = hash;
    });
});

http.listen(3000, function () {
    console.log('listening on port 3000');
});