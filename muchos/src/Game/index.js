import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Console from './Console';
import Controls from './Controls';
import MyHand from './MyHand';
import AvatarMaker from "./AvatarMaker";
import Snackbar from "@material-ui/core/Snackbar";

const styles = theme => ({
    Game: {
        height: '100%',
    },
    consoleWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '20%',
        height: '100%',
    },
    controlsWrapper: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 0,
        height: '100%',
    },
});

function copyToClipboard(text) {
    const dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

class Game extends Component {
    constructor(props) {
        super(props);
        let all_card = [];
        for (let i = 0; i <= 9; ++i)
            all_card = all_card.concat([`b${i}`, `g${i}`, `r${i}`, `y${i}`]);
        for (let i of ['p', 'r', 's'])
            all_card = all_card.concat([`b${i}`, `g${i}`, `r${i}`, `y${i}`]);
        all_card = all_card.concat([`wc`, 'wf', 'cb']);
        this.state = {
            commandLog: [],
            basicSnack: '',
            myHandOpen: false,
            myHand: all_card,
            topCard: null,
            user: null,
            lobbyCore: {},
        };
    }

    componentDidMount() {
        let rach = this.props.rach;

        rach.service_call('/version', [],
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
        if (command[0] !== '!' || command[1] !== ' ') {
            this.props.rach.pub(`/lobby/${this.state.lobbyCore.id}/chat`, {
                user: this.state.user,
                chat: command,
            });
        } else {
            command = command.substr(2);
            switch (command) {
                case 'help': {
                    let help = '';
                    for (let key in this.helpDef)
                        help += `_${key}_: ${this.helpDef[key]}\n\n`;
                    this.consoleLog(help);
                    break;
                }
                case 'leave':
                    this.leaveLobby();
                    break;
                case 'clear':
                    this.setState({commandLog: []});
                    break;
                case 'mates': {
                    this.getMates((mates) => {
                        let text = '';
                        for (let key in mates)
                            if (mates.hasOwnProperty(key))
                                text += mates[key].name + '\n\n';
                        this.consoleLog(text);
                    });
                    break;
                }
                case 'rm -rf /':
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
            case 'myHandOpen':
                this.setState({myHandOpen: true});
                break;
            case 'myHandClose':
                this.setState({myHandOpen: false});
                break;
            case 'invite':
                copyToClipboard(this.state.lobbyCore.id);
                this.setState({basicSnack: 'Lobby ID copied to clipboard'});
                break;
            default:
                break;
        }
    }

    onCardSelection(cardCode) {
        this.setState({myHandOpen: false});
    }

    onPlayerJoin(data) {
        let user = data.data.user, event = data.data.event;
        this.consoleLog(`__${user.name}__ ${event}.`);
    }

    onChat(data) {
        let user = data.data.user;
        let chat = data.data.chat;
        this.consoleLog(`__${user.name}__: ${chat}`);
    }

    avatarLoader(user) {
        let rach = this.props.rach;
        this.consoleLog(`${this.props.lobbyID}`);
        rach.service_call('/lobby.join', [this.props.lobbyID, user],
            (result) => {
                let lobby = result.result;
                this.consoleLog(`Joined lobby ${lobby.core.name}`);
                rach.add_sub(`/lobby/${lobby.core.id}/player_event`, this.onPlayerJoin.bind(this), []);
                rach.add_sub(`/lobby/${lobby.core.id}/chat`, this.onChat.bind(this), []);
                rach.add_pub(`/lobby/${lobby.core.id}/chat`);
                this.setState({user: user, lobbyCore: lobby.core});
            }, [],
            (err) => {
                this.consoleLog(err);
            }, [],
        );
    }

    leaveLobby() {
        let rach = this.props.rach, lobbyId = this.props.lobbyID, user = this.state.user;
        rach.service_call('/lobby.leave', [lobbyId, user],
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

    getMates(cb) {
        let rach = this.props.rach, lobbyId = this.props.lobbyID;
        rach.service_call('/lobby.get_mates', [lobbyId],
            (result) => {
                cb(result.result);
            }, [],
            (err) => {
                this.consoleLog(err);
                cb(null);
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
                    <Controls onControl={this.onControl.bind(this)}/>
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
                            onClose={this.onControl.bind(this, 'myHandClose')}
                        /> : null
                }
                <Snackbar
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    open={this.state.basicSnack.length !== 0}
                    onClose={this.handleCloseSnack.bind(this)}
                    message={<span>{this.state.basicSnack}</span>}
                />
            </div>
        );
    }

    static getAsset(cardCode) {
        let assetPath = 'uno_assets_2d/PNGs/small/';
        assetPath += {b: 'blue_', g: 'green_', r: 'red_', y: 'yellow_', w: 'wild_', c: 'card_'}[cardCode[0]];
        if (!isNaN(Number(cardCode[1])))
            assetPath += cardCode[1];
        else
            assetPath += {
                p: 'picker',
                r: 'reverse',
                s: 'skip',
                b: 'back_alt',
                c: 'color_changer',
                f: 'pick_four'
            }[cardCode[1]];
        return assetPath + '.png';
    }

    helpDef = {
        'help': 'this help',
        'clear': 'clear console log',
        'leave': 'clean lobby exit',
        'quit': 'clean game exit',
        'create <name>': 'create lobby',
        'join <id>': 'join lobby',
        'start': 'start game',
        'hand': 'show hand',
        'mates': 'list players',
    };
}


Game.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Game);