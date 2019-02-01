const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

const RachServer = require("./modules/RachServer/RachServer");
const uuid_v1 = require("uuid/v1");

let lobby = {};
const services = {
    "/version":
        function (rach, on_err, on_result) {
            on_result("0.0 dev");
        },
    "/lobby.create":
        function (lobby, rach, on_err, on_result, lobby_name) {
            try {
                if (String(lobby_name).length === 0)
                    on_err("invalid lobby name");
            } catch (e) {
                on_err(e.message || "invalid lobby name");
            }
            let id = uuid_v1();
            let lob = {
                core: {
                    id: id,
                    name: lobby_name,
                },
                players: {},
                game: {
                    started: false,
                    hand: {},
                    deck: null,
                    turn_order: null,
                    move: null,
                },
            };
            lobby[id] = lob;
            on_result(lob.core);
        }.bind(null, lobby),
    "/lobby.join":
        function (lobby, rach, on_err, on_result, lobby_id, user) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message || "invalid lobby id");
            }
            lobby[lobby_id].players[user.name] = user;
            rach.pub(`/lobby/${lobby_id}/player_event`, {event: "joined", user: user});
            on_result(lobby[lobby_id].core);
        }.bind(null, lobby),
    "/lobby.leave":
        function (lobby, rach, on_err, on_result, lobby_id, user) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message || "invalid lobby id");
            }
            delete lobby[lobby_id].players[user.name];
            rach.pub(`/lobby/${lobby_id}/player_event`, {event: "left", user: user});
            on_result("done");
        }.bind(null, lobby),
    "/lobby.players":
        function (lobby, rach, on_err, on_result, lobby_id) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message || "invalid lobby id");
            }
            on_result(lobby[lobby_id].players);
        }.bind(null, lobby),
    "/game.start":
        function (lobby, rach, on_err, on_result, lobby_id) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message || "invalid lobby id");
            }
            if (lobby[lobby_id].game.started)
                return on_err("game in progress");
            let players = Object.keys(lobby[lobby_id].players), hand = {};
            if (players.length < 2) {
                return on_err("not enough players");
            }
            let cards = get_all_cards();
            shuffle(cards);
            for (let player of players)
                hand[player] = cards.splice(0, 7);
            lobby[lobby_id].game.move = {card: cards[0]};
            cards.splice(0, 1);
            lobby[lobby_id].game.deck = cards;
            lobby[lobby_id].game.hand = hand;
            let turn_order = Object.keys(lobby[lobby_id].players);
            shuffle(turn_order);
            lobby[lobby_id].game.turn_order = turn_order;
            for (let player of players)
                rach.pub(`/game/${lobby_id}/private/${player}`,
                    {
                        event: "initHand",
                        hand: hand[player]
                    });
            rach.pub(`/game/${lobby_id}/broadcast`, {event: "turn", player: turn_order[0]});
            rach.pub(`/game/${lobby_id}/broadcast`, {event: "move", move: lobby[lobby_id].game.move});
            lobby[lobby_id].game.started = true;
            on_result("done");
        }.bind(null, lobby),
    "/game.move":
        function (lobby, rach, on_err, on_result, lobby_id, user, move) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message || "invalid lobby id");
            }
            let game = lobby[lobby_id].game;
            if (game.started !== true)
                return on_err("game not started yet");
            if (game.turn_order[0] !== user.name)
                return on_err("not your turn yet");
            if (!game.hand[user.name].includes(move.card))
                return on_err("invalid move");
            remove(game.hand[user.name], move.card);
            lobby[lobby_id].game.move = move;
            rach.pub(`/game/${lobby_id}/broadcast`, {event: "move", move: move});
        }.bind(null, lobby),
};
const actions = {
    authTest: function () {
        return true;
    },
};

function get_all_cards() {
    let all_card = [];
    for (let i = 0; i <= 0; ++i) {
        all_card = all_card.concat([`b${i}`, `g${i}`, `r${i}`, `y${i}`]);
    }
    for (let i = 1; i <= 9; ++i) {
        all_card = all_card.concat([`b${i}`, `g${i}`, `r${i}`, `y${i}`]);
        all_card = all_card.concat([`b${i}`, `g${i}`, `r${i}`, `y${i}`]);
    }
    for (let i of ["p", "r", "s"]) {
        all_card = all_card.concat([`b${i}`, `g${i}`, `r${i}`, `y${i}`]);
        all_card = all_card.concat([`b${i}`, `g${i}`, `r${i}`, `y${i}`]);
    }
    for (let i = 0; i < 4; ++i) {
        all_card = all_card.concat([`wc`, "wf"]);
    }
    return all_card;
}

function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = 0; i < arr.length; ++i) {
        let tmp = arr[i], j = randInt(0, arr.length - 1);
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

function rotate(arr, n) {
    n = n % arr.length;
    while (n-- > 0)
        arr.push(arr.shift());
}

function remove(arr, x) {
    let i = arr.indexOf(x);
    if (i >= 0)
        arr.splice(i, 1);
}

const rachServer = new RachServer(actions, services, console);
rachServer.start();

module.exports = app;
