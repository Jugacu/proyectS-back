import socketio from 'socket.io'
import connectSocket from 'spotify-connect-ws'

const express = require('express');
const request = require('request');
const cors = require('cors');
const bodyParser = require("body-parser");


const client_id = "YOUR CLIENT ID GOES HERE";
const client_secret = "YOUR CLIENT SECRET GOES HERE";

const app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(bodyParser.urlencoded({extended: true}))
    .use(bodyParser.json());

app.post('/token', (req, res) => {

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: req.body.code,
            redirect_uri: req.body.redirect_uri,
            grant_type: req.body.grant_type
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token,
                refresh_token = body.refresh_token;

            // we can also pass the token to the browser to make requests from there
            res.json({
                access_token: access_token,
                refresh_token: refresh_token
            });
        } else {
            res.json({
                error: 'Invalid token.',
                body: body,
            });
        }
    });
});

app.post('/refresh_token', (req, res) => {

    // requesting access token from refresh token
    const refresh_token = req.body.refresh_token;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))},
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            res.json({
                'access_token': access_token
            });
        }
    });
});

const port = process.env.PORT || 3000;

console.log('Listening  ' + port);
const server = app.listen(port);

const io = socketio(server);
io.of('connect').on('connection', connectSocket);