import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Console from "./Console";
import Controls from "./Controls";
import MyHand from "./MyHand";
import ColorSelector from "./ColorSelector";
import AvatarMaker from "./AvatarMaker";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import InfoSnackIcon from '@material-ui/icons/Info';
import SuccessSnackIcon from '@material-ui/icons/CheckCircle';
import WarningSnackIcon from '@material-ui/icons/Warning';
import ErrorSnackIcon from '@material-ui/icons/Error';
import green from "@material-ui/core/es/colors/green";
import amber from "@material-ui/core/es/colors/amber";
import red from "@material-ui/core/es/colors/red";

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
    snackMessage: {
        display: 'flex',
        alignItems: 'center',
    },
    snackIcon: {
        fontSize: 20,
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    infoSnack: {
        backgroundColor: theme.palette.primary.dark,
    },
    successSnack: {
        backgroundColor: green[600],
    },
    warnSnack: {
        backgroundColor: amber[700],
    },
    errorSnack: {
        backgroundColor: red[700],
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
            consoleVisible: false,
            consoleLog: [],
            consoleBacklog: 0,
            infoSnack: "", successSnack: "", warnSnack: "", errorSnack: "",
            myHandOpen: false,
            myHand: [],
            topCard: null,
            user: null,
            lobbyCore: {},
            lobbyPlayers: {},
            myColor: "b",
            turn: null, balance: 0, color: null, cardCount: {},
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
            // Todo: Make chat a service call for security with current Rach
            this.props.rach.pub(`/lobby/${this.state.lobbyCore.id}/chat/${this.state.user.name}`, command);
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
                    this.setState({consoleLog: [], consoleBacklog: 0});
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
                case "lights_on":
                    this.props.themeChanger("light");
                    break;
                case "lights_off":
                    this.props.themeChanger("dark");
                    break;
                default:
                    this.consoleLog(`Invalid command: _${command}_`);
                    break;
            }
        }
    }

    consoleLog(msg) {
        this.setState(prevState => ({
            consoleLog: [...prevState.consoleLog, msg],
            consoleBacklog: prevState.consoleVisible ? 0 : prevState.consoleBacklog + 1,
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
            case "colorSelectorOpen":
                this.setState({myColor: null});
                break;
            case "colorSelectorClose":
                this.setState({myColor: "b"});
                break;
            case "invite":
                copyToClipboard(this.state.lobbyCore.id);
                this.setState({infoSnack: "Lobby ID copied to clipboard"});
                break;
            case "leaveLobby":
                this.leaveLobby();
                break;
            case "passTurn":
                this.onCardSelection("pass");
                break;
            case "drawCard":
                this.onCardSelection("draw");
                break;
            case "toggleChat":
                this.setState(prevState => ({
                    consoleVisible: !prevState.consoleVisible,
                    consoleBacklog: 0,
                }));
                break;
            default:
                break;
        }
    }

    onCardSelection(cardCode) {
        let rach = this.props.rach;
        let move = {};
        if (cardCode === "draw") {
            move.type = cardCode;
        } else if (cardCode === "pass") {
            move.type = cardCode;
        } else {
            move.type = "card";
            move.card = cardCode;
            if (cardCode[0] === "w")
                move.color = this.state.myColor;
        }
        rach.service_call("/game.move", [this.props.lobbyID, move],
            (result) => {
                let res = result.result;
                if (res.length === 0) {
                    this.setState({myHandOpen: false});
                    this.setState(prevState => {
                        let myHand = prevState.myHand;
                        Game.arrRemove(myHand, cardCode);
                        return {myHand: myHand};
                    });
                } else {
                    this.setState(prevState => {
                        return {
                            myHand: prevState.myHand.concat(res),
                            balance: 0,
                        };
                    });
                }
            }, [],
            (err) => {
                this.setState({warnSnack: err.substr(15)});
            }, [],
        );
    }

    onPlayerJoin(data) {
        let user = data.data.user, event = data.data.event;
        this.updatePlayer(user, event);
        this.consoleLog(`__${user.name}__ ${event}.`);
    }

    onChat(data) {
        let username = data["source_topic"].substr(`/lobby/${this.state.lobbyCore.id}/chat/`.length);
        let chat = data.data;
        this.consoleLog(`__${username}__: ${chat}`);
    }

    onPrivate(data) {
        let mData = data.data;
        switch (mData.event) {
            case "initHand": {
                this.setState(prevState => {
                    let cardCount = {};
                    for (let player in prevState.lobbyPlayers)
                        if (prevState.lobbyPlayers.hasOwnProperty(player))
                            cardCount[player] = 7;
                    return {
                        ...prevState,
                        myHand: mData.hand,
                        cardCount: cardCount,
                    }
                });
                break;
            }
            default:
        }
    }

    onBroadcast(data) {
        let mData = data.data;
        switch (mData.event) {
            case "move":
                this.setState(prevState => ({
                    topCard: mData["move"].card,
                    turn: mData["next_turn"],
                    balance: mData["next_turn"] === prevState.user.name ? (mData["move"].balance === 0 ? 1 : mData["move"].balance) : 0,
                    color: mData["next_turn"] === prevState.user.name ? mData["move"].color : null,
                    successSnack: mData["next_turn"] === prevState.user.name ? "Your turn" : "",
                    cardCount: {...prevState.cardCount, [mData["turn"]]: mData["cardCount"]},
                }));
                break;
            case "win":
                this.consoleLog(`${mData["player"]} won place ${mData["place"]}`);
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
                console.log(lobby_core, user);
                this.consoleLog(`Joined lobby ${lobby_core.name}`);
                rach.add_sub(`/lobby/${lobby_core.id}/player_event`, this.onPlayerJoin.bind(this), []);
                rach.add_sub(`/lobby/${lobby_core.id}/chat`, this.onChat.bind(this), []);
                rach.add_sub(`/game/${lobby_core.id}/private/${user.name}`, this.onPrivate.bind(this), []);
                rach.add_sub(`/game/${lobby_core.id}/broadcast`, this.onBroadcast.bind(this), []);
                rach.add_pub(`/lobby/${lobby_core.id}/chat/${user.name}`);
                this.setState({user: user, lobbyCore: lobby_core});
                this.getPlayers((players) => {
                    if (players)
                        this.updatePlayerList(players);
                });
            }, [],
            (err) => {
                this.setState({errorSnack: err.substr(15)});
            }, [],
        );
    }

    leaveLobby() {
        let rach = this.props.rach, lobbyId = this.props.lobbyID;
        rach.service_call("/lobby.leave", [lobbyId],
            () => {
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
                this.setState({errorSnack: err.substr(15)});
            }, [],
        );
    }

    handleCloseSnack() {
        this.setState({infoSnack: "", successSnack: "", warnSnack: "", errorSnack: "",});
    }

    onColorSelection(color) {
        this.setState({myColor: color});
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.Game}>
                {
                    this.state.consoleVisible ?
                        <div className={classes.consoleWrapper}>
                            <Console
                                consoleLog={this.state.consoleLog}
                                onCommand={this.onCommand.bind(this)}
                            />
                        </div> : null
                }
                <div className={classes.controlsWrapper}>
                    <Controls
                        consoleBacklog={this.state.consoleBacklog}
                        onControl={this.onControl.bind(this)}
                        players={this.state.lobbyPlayers}
                        turn={this.state.turn}
                        myColor={this.state.myColor}
                        color={this.state.color}
                        balance={this.state.balance}
                        cardCount={this.state.cardCount}
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
                {
                    this.state.myColor == null ?
                        <ColorSelector
                            callback={this.onColorSelection.bind(this)}
                            onClose={this.onControl.bind(this, "colorSelectorClose")}
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
                    anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                    open={this.state.infoSnack.length !== 0}
                    autoHideDuration={2000}
                    onClose={this.handleCloseSnack.bind(this)}
                >
                    <SnackbarContent
                        className={classes.infoSnack}
                        message={
                            <span className={classes.snackMessage}>
                            <InfoSnackIcon className={classes.snackIcon}/>{this.state.infoSnack}
                        </span>
                        }
                    />
                </Snackbar>
                <Snackbar
                    anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                    open={this.state.successSnack.length !== 0}
                    onClose={this.handleCloseSnack.bind(this)}
                >
                    <SnackbarContent
                        className={classes.successSnack}
                        message={
                            <span className={classes.snackMessage}>
                            <SuccessSnackIcon className={classes.snackIcon}/>{this.state.successSnack}
                        </span>
                        }
                    />
                </Snackbar>
                <Snackbar
                    anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                    open={this.state.warnSnack.length !== 0}
                    onClose={this.handleCloseSnack.bind(this)}>
                    <SnackbarContent
                        className={classes.warnSnack}
                        message={
                            <span className={classes.snackMessage}>
                            <WarningSnackIcon className={classes.snackIcon}/>{this.state.warnSnack}
                        </span>
                        }
                    />
                </Snackbar>
                <Snackbar
                    anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                    open={this.state.errorSnack.length !== 0}
                    onClose={this.handleCloseSnack.bind(this)}
                >
                    <SnackbarContent
                        className={classes.errorSnack}
                        message={
                            <span className={classes.snackMessage}>
                            <ErrorSnackIcon className={classes.snackIcon}/>{this.state.errorSnack}
                        </span>
                        }
                    />
                </Snackbar>
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
                d: "back",
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

export default withStyles(styles, {withTheme: true})(Game);