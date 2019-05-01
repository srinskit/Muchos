const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const https = require('https');

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
app.post("/dfWebHook", function (req, res) {
    if (req.body.queryResult.intent.name === process.env.DIALOG_FLOW_INTENT_NAME) {
        console.log(req.body.queryResult.parameters.color[0]);
    } else {
        res.json({fulfillmentText: req.body.queryResult.fulfillmentText});
    }
});

// error handler
app.use(function (req, res) {
    res.status(404);
    res.end();
});

const dialogFlow = require('dialogflow');
const fs = require("fs");
const dfConfig = {
    credentials: JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
};
const sessionClient = new dialogFlow.SessionsClient(dfConfig);

function dfQuery(username, query, callback) {
    const sessionPath = sessionClient.sessionPath(dfConfig.credentials["project_id"], username);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: "en",
            },
        },
    };
    sessionClient.detectIntent(request).then(responses => {
        callback(responses[0].queryResult.fulfillmentText);
    });
}

const RachServer = require("./modules/RachServer/RachServer");
const uuid_v1 = require("uuid/v1");

let lobby = {};
const services = {
    "/version":
        function (rach, client, on_err, on_result) {
            on_result("0.0");
        },
    "/lobby.create":
        function (lobby, rach, client, on_err, on_result, lobby_name) {
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
                users: {},
                players: {},
                game: {
                    started: false,
                },
            };
            lobby[id] = lob;
            on_result(lob.core);
        }.bind(null, lobby),
    "/lobby.join":
        function (lobby, rach, client, on_err, on_result, lobby_id, user) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message || "invalid lobby id");
            }
            user.name = user.name.trim();
            if (lobby[lobby_id].players[user.name] != null)
                return on_err("username taken");
            lobby[lobby_id].users[client.public_id] = user;
            lobby[lobby_id].players[user.name] = user;
            rach.pub(`/lobby/${lobby_id}/player_event`, {event: "joined", user: user});
            on_result(lobby[lobby_id].core);
        }.bind(null, lobby),
    "/lobby.leave":
        function (lobby, rach, client, on_err, on_result, lobby_id) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message);
            }
            let user = lobby[lobby_id].users[client.public_id];
            if (user == null)
                return on_err("not in this lobby");
            delete lobby[lobby_id].players[user.name];
            rach.pub(`/lobby/${lobby_id}/player_event`, {event: "left", user: user});
            on_result("done");
        }.bind(null, lobby),
    "/lobby.players":
        function (lobby, rach, client, on_err, on_result, lobby_id) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message || "invalid lobby id");
            }
            let user = lobby[lobby_id].users[client.public_id];
            if (user == null)
                return on_err("not in this lobby");
            on_result(lobby[lobby_id].players);
        }.bind(null, lobby),
    "/game.start":
        function (lobby, rach, client, on_err, on_result, lobby_id) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message || "invalid lobby id");
            }
            let user = lobby[lobby_id].users[client.public_id];
            if (user == null)
                return on_err("not in this lobby");
            let game = lobby[lobby_id].game;
            if (game.started)
                return on_err("game in progress");
            let players = Object.keys(lobby[lobby_id].players), hand = {};
            if (players.length < 2) {
                return on_err("not enough players");
            }
            if (players.length > 5) {
                return on_err("too many players");
            }
            let cards = get_all_cards();
            shuffle(cards);
            for (let player of players)
                hand[player] = cards.splice(0, 7);
            let i;
            for (i = 0; i < cards.length; ++i)
                if (isNumber(cards[i][1]))
                    break;
            if (i === cards.length)
                return on_err("golden rain. try again.");
            game.move = {
                type: "card",
                card: cards[i],
                color: cards[i][0],
                balance: 0,
            };
            cards.splice(i, 1);
            game.deck = cards;
            game.hand = hand;
            game.discard = [];
            game.win_count = 0;
            let turn_order = Object.keys(lobby[lobby_id].players);
            shuffle(turn_order);
            game.turn_order = turn_order;
            for (let player of players)
                rach.pub(`/game/${lobby_id}/private/${player}`,
                    {
                        event: "initHand",
                        hand: hand[player]
                    });
            rach.pub(`/game/${lobby_id}/broadcast`, {
                event: "move",
                move: game.move,
                turn: null,
                next_turn: turn_order[0],
            });
            game.started = true;
            on_result("done");
        }.bind(null, lobby),
    "/game.move":
        function (lobby, rach, client, on_err, on_result, lobby_id, move) {
            try {
                if (String(lobby_id).length === 0 || lobby[lobby_id] == null)
                    return on_err("invalid lobby id");
            } catch (e) {
                return on_err(e.message);
            }
            let user = lobby[lobby_id].users[client.public_id];
            if (user == null)
                return on_err("not in this lobby");
            let game = lobby[lobby_id].game, ret = [];
            if (game.started !== true)
                return on_err("game not started");
            if (game.turn_order[0] !== user.name)
                return on_err("not your turn");
            // Game logic
            let type = move.type;
            if (move.type === "card") {
                if (!game.hand[user.name].includes(move.card))
                    return on_err("you do not have that card");
                if (["b", "g", "r", "y"].includes(game.move.card[0])) {
                    if (isNumber(game.move.card[1])) {
                        move.balance = 0;
                        if (game.move.card[0] === move.card[0]) {
                            move.color = move.card[0];
                            if (isNumber(move.card[1]))
                                rotate(game.turn_order, 1);
                            else if (move.card[1] === "s")
                                rotate(game.turn_order, 2);
                            else if (move.card[1] === "r")
                                reverse(game.turn_order);
                            else if (move.card[1] === "p") {
                                move.balance = 2;
                                rotate(game.turn_order, 1);
                            }
                        } else if (game.move.card[1] === move.card[1]) {
                            move.color = move.card[0];
                            rotate(game.turn_order, 1);
                        } else if (move.card === "wc") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            rotate(game.turn_order, 1);
                        } else if (move.card === "wf") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            move.balance = 4;
                            rotate(game.turn_order, 1);
                        } else
                            return on_err("invalid move");
                    } else if (game.move.card[1] === "s") {
                        move.balance = 0;
                        if (game.move.card[0] === move.card[0]) {
                            move.color = move.card[0];
                            if (isNumber(move.card[1]))
                                rotate(game.turn_order, 1);
                            else if (move.card[1] === "s")
                                rotate(game.turn_order, 2);
                            else if (move.card[1] === "r")
                                reverse(game.turn_order);
                            else if (move.card[1] === "p") {
                                move.balance = 2;
                                rotate(game.turn_order, 1);
                            }
                        } else if (move.card[1] === "s") {
                            move.color = move.card[0];
                            rotate(game.turn_order, 2);
                        } else if (move.card[0] === "wc") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            rotate(game.turn_order, 1);
                        } else if (move.card === "wf") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            move.balance = 4;
                            rotate(game.turn_order, 1);
                        } else
                            return on_err("invalid move");
                    } else if (game.move.card[1] === "r") {
                        move.balance = 0;
                        if (game.move.card[0] === move.card[0]) {
                            move.color = move.card[0];
                            if (isNumber(move.card[1]))
                                rotate(game.turn_order, 1);
                            else if (move.card[1] === "s")
                                rotate(game.turn_order, 2);
                            else if (move.card[1] === "r")
                                reverse(game.turn_order);
                            else if (move.card[1] === "p") {
                                move.balance = 2;
                                rotate(game.turn_order, 1);
                            }
                        } else if (move.card[1] === "r") {
                            move.color = move.card[0];
                            reverse(game.turn_order);
                        } else if (move.card[0] === "wc") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            rotate(game.turn_order, 1);
                        } else if (move.card === "wf") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            move.balance = 4;
                            rotate(game.turn_order, 1);
                        } else
                            return on_err("invalid move");
                    } else if (game.move.card[1] === "p") {
                        if (game.move.balance !== 0) {
                            if (move.card[1] === "p") {
                                move.color = move.card[0];
                                move.balance = game.move.balance + 2;
                                rotate(game.turn_order, 1);
                            } else
                                return on_err("invalid move");
                        } else {
                            if (move.card === "wc") {
                                if (!["b", "g", "r", "y"].includes(move.color))
                                    return on_err("which color should we switch to?");
                                rotate(game.turn_order, 1);
                            } else if (move.card === "wf") {
                                if (!["b", "g", "r", "y"].includes(move.color))
                                    return on_err("which color should we switch to?");
                                move.balance = 4;
                                rotate(game.turn_order, 1);
                            } else if (game.move.color === move.card[0]) {
                                move.color = move.card[0];
                                if (isNumber(move.card[1]))
                                    rotate(game.turn_order, 1);
                                else if (move.card[1] === "s")
                                    rotate(game.turn_order, 2);
                                else if (move.card[1] === "r")
                                    reverse(game.turn_order);
                                else if (move.card[1] === "p") {
                                    move.balance = 2;
                                    rotate(game.turn_order, 1);
                                }
                            } else
                                return on_err("invalid move");
                        }
                    }
                } else if (game.move.card === "wc") {
                    move.balance = 0;
                    if (move.card[0] === game.move.color) {
                        move.color = move.card[0];
                        if (isNumber(move.card[1]))
                            rotate(game.turn_order, 1);
                        else if (move.card[1] === "s")
                            rotate(game.turn_order, 2);
                        else if (move.card[1] === "r")
                            reverse(game.turn_order);
                        else if (move.card[1] === "p") {
                            move.balance = 2;
                            rotate(game.turn_order, 1);
                        }
                    } else if (move.card === "wc") {
                        if (!["b", "g", "r", "y"].includes(move.color))
                            return on_err("which color should we switch to?");
                        rotate(game.turn_order, 1);
                    } else if (move.card === "wf") {
                        if (!["b", "g", "r", "y"].includes(move.color))
                            return on_err("which color should we switch to?");
                        move.balance = 4;
                        rotate(game.turn_order, 1);
                    } else
                        return on_err("invalid move");
                } else if (game.move.card === "wf") {
                    move.balance = 0;
                    if (game.move.balance !== 0) {
                        if (move.card === "wf") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            move.balance = game.move.balance + 4;
                            rotate(game.turn_order, 1);
                        } else
                            return on_err("invalid move");
                    } else {
                        if (move.card === "wc") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            rotate(game.turn_order, 1);
                        } else if (move.card === "wf") {
                            if (!["b", "g", "r", "y"].includes(move.color))
                                return on_err("which color should we switch to?");
                            move.balance = 4;
                            rotate(game.turn_order, 1);
                        } else if (game.move.color === move.card[0]) {
                            move.color = move.card[0];
                            if (isNumber(move.card[1]))
                                rotate(game.turn_order, 1);
                            else if (move.card[1] === "s")
                                rotate(game.turn_order, 2);
                            else if (move.card[1] === "r")
                                reverse(game.turn_order);
                            else if (move.card[1] === "p") {
                                move.balance = 2;
                                rotate(game.turn_order, 1);
                            }
                        } else
                            return on_err("invalid move");
                    }
                }
                remove(game.hand[user.name], move.card);
            } else if (move.type === "draw") {
                if (game.move.type === "draw")
                    return on_err("can not draw again");
                let n = game.move.balance === 0 ? 1 : game.move.balance;
                if (game.deck.length < n) {
                    shuffle(game.discard);
                    game.deck = game.deck.concat(game.discard);
                }
                if (game.deck.length < n)
                    console.log("deck length low");
                move.balance = 0;
                move.color = game.move.color;
                move.card = game.move.card;
                ret = game.deck.splice(0, n);
                game.hand[user.name] = game.hand[user.name].concat(ret);
            } else if (move.type === "pass") {
                if (game.move.type !== "draw")
                    return on_err("can not pass");
                move.type = "card";
                move.balance = game.move.balance;
                move.card = game.move.card;
                move.color = game.move.color;
                rotate(game.turn_order, 1);
            } else
                return on_err("invalid card type");
            game.move = move;
            rach.pub(`/game/${lobby_id}/broadcast`, {
                event: "move",
                move: {...game.move, type: type},
                turn: user.name,
                cardCount: game.hand[user.name].length,
                next_turn: game.turn_order[0],
            });
            if (game.hand[user.name].length === 0) {
                game.win_count++;
                remove(game.turn_order, user.name);
                rach.pub(`/game/${lobby_id}/broadcast`, {
                    event: "win",
                    player: user.name,
                    place: game.win_count,
                });
                if (game.turn_order.length === 1) {
                    game.win_count++;
                    rach.pub(`/game/${lobby_id}/broadcast`, {
                        event: "win",
                        player: game.turn_order[0],
                        place: game.win_count,
                    });
                    remove(game.turn_order, game.turn_order[0]);
                    game.started = false;
                }
            }
            return on_result(ret);
        }.bind(null, lobby),
    "/bot.chat":
        function (lobby, rach, client, on_err, on_result, query) {
            dfQuery("test", query, (result) => {
                return on_result(result);
            });
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

function reverse(arr) {
    arr.reverse();
}

function remove(arr, x) {
    let i = arr.indexOf(x);
    if (i >= 0)
        arr.splice(i, 1);
}

function isNumber(x) {
    return !isNaN(Number(x));
}

const rachServer = new RachServer(actions, services, console);
rachServer.start();

module.exports = app;
