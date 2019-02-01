import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Console from "./Console";
import Controls from "./Controls";
import MyHand from "./MyHand";
import AvatarMaker from "./AvatarMaker";
import Snackbar from "@material-ui/core/Snackbar";

const styles = theme => ({
    Game: {
        height: "100%",
    },
    consoleWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "20%",
        height: "100%",
    },
    gameWrapper: {
        marginLeft: "20%",
        padding: "50px",
    },
    controlsWrapper: {
        position: "absolute",
        top: 0,
        right: 0,
        padding: 0,
        height: "100%",
    },
});

function copyToClipboard(text) {
    const dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute("value", text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            commandLog: [],
            basicSnack: '',
            myHandOpen: false,
            myHand: [],
            topCard: null,
            user: null,
            lobbyCore: {},
            lobbyPlayers: {},
            turn: null,
        };
    }

    componentDidMount() {
        let rach = this.props.rach;

        rach.service_call("/version", [],
            (result) => {
                this.consoleLog(`Server version ${result.result}`);
            }, [],
            (err) => {
                this.consoleLog(err);
            }, [],
        );
    }

    componentWillUnmount() {
    }

    onCommand(command) {
        if (command[0] !== "!" || command[1] !== " ") {
            this.props.rach.pub(`/lobby/${this.state.lobbyCore.id}/chat`, {
                user: this.state.user,
                chat: command,
            });
        } else {
            command = command.substr(2);
            switch (command) {
                case "help": {
                    let help = '';
                    for (let key in this.helpDef)
                        help += `_${key}_: ${this.helpDef[key]}\n\n`;
                    this.consoleLog(help);
                    break;
                }
                case "leave":
                    this.leaveLobby();
                    break;
                case "clear":
                    this.setState({commandLog: []});
                    break;
                case "players": {
                    this.getPlayers((players) => {
                        let text = '';
                        for (let key in players)
                            if (players.hasOwnProperty(key))
                                text += players[key].name + "\n\n";
                        this.consoleLog(text);
                    });
                    break;
                }
                case "start": {
                    this.ask_to_start();
                    break;
                }
                case "rm -rf /":
                    this.consoleLog(`Ya'll need Jeysus`);
                    break;
                default:
                    this.consoleLog(`Invalid command: _${command}_`);
                    break;
            }
        }
    }

    consoleLog(msg) {
        this.setState(prevState => ({
            commandLog: [...prevState.commandLog, msg],
        }));
    }

    onControl(control) {
        switch (control) {
            case "myHandOpen":
                this.setState({myHandOpen: true});
                break;
            case "myHandClose":
                this.setState({myHandOpen: false});
                break;
            case "invite":
                copyToClipboard(this.state.lobbyCore.id);
                this.setState({basicSnack: "Lobby ID copied to clipboard"});
                break;
            case "leaveLobby":
                this.leaveLobby();
                break;
            default:
                break;
        }
    }

    onCardSelection(cardCode) {
        let rach = this.props.rach, user = this.state.user;
        let move = {card: cardCode,};
        rach.service_call("/game.move", [this.props.lobbyID, user, move],
            (result) => {
                this.setState({myHandOpen: false});
                this.setState(prevState => {
                    let myHand = prevState.myHand;
                    Game.arrRemove(myHand, cardCode);
                    return {myHand: myHand};
                });
            }, [],
            (err) => {
                this.consoleLog(err);
            }, [],
        );
    }

    onPlayerJoin(data) {
        let user = data.data.user, event = data.data.event;
        this.updatePlayer(user, event);
        this.consoleLog(`__${user.name}__ ${event}.`);
    }

    onChat(data) {
        let user = data.data.user;
        let chat = data.data.chat;
        this.consoleLog(`__${user.name}__: ${chat}`);
    }

    onPrivate(data) {
        let mData = data.data;
        switch (mData.event) {
            case "initHand":
                this.setState({myHand: mData.hand});
                break;
            default:
        }
    }

    onBroadcast(data) {
        let mData = data.data;
        switch (mData.event) {
            case "turn":
                this.consoleLog(`${mData["player"]}'s turn.`);
                this.setState({turn: mData["player"]});
                break;
            case "move":
                this.setState({topCard: mData["move"].card});
                break;
            default:
        }
    }

    updatePlayerList(players) {
        this.setState({lobbyPlayers: players});
    }

    updatePlayer(player, event) {
        this.setState(prevState => ({
            lobbyPlayers: {
                ...prevState.lobbyPlayers,
                [player.name]: event === "joined" ? player : undefined,
            }
        }));
    }

    avatarLoader(user) {
        let rach = this.props.rach;
        rach.service_call("/lobby.join", [this.props.lobbyID, user],
            (result) => {
                let lobby_core = result.result;
                this.consoleLog(`Joined lobby ${lobby_core.name}`);
                rach.add_sub(`/lobby/${lobby_core.id}/player_event`, this.onPlayerJoin.bind(this), []);
                rach.add_sub(`/lobby/${lobby_core.id}/chat`, this.onChat.bind(this), []);
                rach.add_sub(`/game/${lobby_core.id}/private/${user.name}`, this.onPrivate.bind(this), []);
                rach.add_sub(`/game/${lobby_core.id}/broadcast`, this.onBroadcast.bind(this), []);
                rach.add_pub(`/lobby/${lobby_core.id}/chat`);
                this.setState({user: user, lobbyCore: lobby_core});
                this.getPlayers((players) => {
                    if (players)
                        this.updatePlayerList(players);
                });
            }, [],
            (err) => {
                this.consoleLog(err);
            }, [],
        );
    }

    leaveLobby() {
        let rach = this.props.rach, lobbyId = this.props.lobbyID, user = this.state.user;
        rach.service_call("/lobby.leave", [lobbyId, user],
            (result) => {
                rach.rm_all_sub();
                rach.rm_all_pub();
                this.setState({user: null, lobbyCore: {}});
                this.props.onClose();
            }, [],
            (err) => {
                this.consoleLog(err);
            }, [],
        );
    }

    getPlayers(cb) {
        let rach = this.props.rach, lobbyId = this.props.lobbyID;
        rach.service_call("/lobby.players", [lobbyId],
            (result) => {
                cb(result.result);
            }, [],
            (err) => {
                this.consoleLog(err);
                cb(null);
            }, [],
        );
    }

    ask_to_start() {
        let rach = this.props.rach, lobbyId = this.props.lobbyID;
        rach.service_call("/game.start", [lobbyId],
            (result) => {
            }, [],
            (err) => {
                this.consoleLog(err);
            }, [],
        );
    }

    handleCloseSnack() {
        this.setState({basicSnack: ''});
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.Game}>
                <div className={classes.consoleWrapper}>
                    <Console commandLog={this.state.commandLog} onCommand={this.onCommand.bind(this)}/>
                </div>
                <div className={classes.controlsWrapper}>
                    <Controls
                        onControl={this.onControl.bind(this)}
                        players={this.state.lobbyPlayers}
                        turn={this.state.turn}
                    />
                </div>
                {
                    this.state.user == null ?
                        <AvatarMaker avatarLoader={this.avatarLoader.bind(this)}
                        /> : null
                }
                {
                    this.state.myHandOpen ?
                        <MyHand
                            assetGetter={Game.getAsset}
                            topCard={this.state.topCard}
                            hand={this.state.myHand}
                            onCardSelection={this.onCardSelection.bind(this)}
                            onClose={this.onControl.bind(this, "myHandClose")}
                        /> : null
                }
                <div className={classes.gameWrapper}>
                    {
                        this.state.topCard !== null ?
                            <div>
                                <img src={Game.getAsset(this.state.topCard)} alt={this.state.topCard}/>
                            </div> : null
                    }
                </div>
                <Snackbar
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                    open={this.state.basicSnack.length !== 0}
                    onClose={this.handleCloseSnack.bind(this)}
                    message={<span>{this.state.basicSnack}</span>}
                />
            </div>
        );
    }

    static getAsset(cardCode) {
        let assetPath = "uno_assets_2d/PNGs/small/";
        assetPath += {b: "blue_", g: "green_", r: "red_", y: "yellow_", w: "wild_", c: "card_"}[cardCode[0]];
        if (!isNaN(Number(cardCode[1])))
            assetPath += cardCode[1];
        else
            assetPath += {
                p: "picker",
                r: "reverse",
                s: "skip",
                b: "back_alt",
                c: "color_changer",
                f: "pick_four"
            }[cardCode[1]];
        return assetPath + ".png";
    }

    static arrRemove(arr, x) {
        let i = arr.indexOf(x);
        if (i >= 0)
            arr.splice(i, 1);
    }

    helpDef = {
        "help": "this help",
        "clear": "clear console log",
        "leave": "clean lobby exit",
        "quit": "clean game exit",
        "create <name>": "create lobby",
        "join <id>": "join lobby",
        "start": "start game",
        "hand": "show hand",
        "players": "list players",
    };
}


Game.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Game);