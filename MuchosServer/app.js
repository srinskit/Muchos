const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const RachServer = require('./modules/RachServer/RachServer');
const uuid_v1 = require('uuid/v1');

let lobby = {};
const services = {
    '/version':
        function (rach, on_err, on_result) {
            on_result('0.0 dev');
        },
    '/lobby.create':
        function (lobby, rach, on_err, on_result, lobby_name) {
            try {
                if (String(lobby_name).length === 0)
                    on_err('invalid lobby name');
            } catch (e) {
                on_err(e.message || 'invalid lobby name');
            }
            let id = uuid_v1();
            let lob = {
                core: {
                    id: id,
                    name: lobby_name,
                },
                players: {},
            };
            lobby[id] = lob;
            on_result(lob);
        }.bind(null, lobby),
    '/lobby.join':
        function (lobby, rach, on_err, on_result, lobby_id, user) {
            try {
                if (String(lobby_id).length === 0)
                    on_err('invalid lobby id');
            } catch (e) {
                on_err(e.message || 'invalid lobby name');
            }
            lobby[lobby_id].players[user.name] = user;
            // rach.pub(`/${lobby_id}/player_join`, user);
            on_result(lobby[lobby_id]);
        }.bind(null, lobby),
};
const actions = {
    authTest: function () {
        return true;
    },
};

const rachServer = new RachServer(actions, services, console);
rachServer.start();

module.exports = app;
