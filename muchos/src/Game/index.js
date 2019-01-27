import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Console from './Console';
import Controls from './Controls';
import MyHand from './MyHand';
import AvatarMaker from "./AvatarMaker";

const styles = theme => ({
    Game: {
        height: '100%',
    },
    consoleWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '25%',
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
            myHandOpen: false,
            myHand: all_card,
            topCard: null,
            user: null,
            lobbyCore: {}
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
        if (command[0] !== '!') {
            this.props.rach.pub(`/${this.state.lobbyCore.id}/chat`, {
                user: this.state.user,
                chat: command,
            });
        } else {
            command = command.substr(2);
            switch (command) {
                case 'clear':
                    this.setState({commandLog: []});
                    break;
                default:
                    this.consoleLog(command);
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
            default:
                break;
        }
    }

    onCardSelection(cardCode) {
        this.setState({myHandOpen: false});
    }

    onPlayerJoin(data) {
        this.consoleLog(`__${data.data.name}__ joined lobby`);
    }

    onChat(data) {
        let user = data.data.user;
        let chat = data.data.chat;
        this.consoleLog(`__${user.name}__: ${chat}`);
    }

    avatarLoader(user) {
        let rach = this.props.rach;
        this.consoleLog(`CORE.ID ${this.props.lobbyID}`);
        rach.service_call('/lobby.join', [this.props.lobbyID, user],
            (result) => {
                let lobby = result.result;
                this.consoleLog(`Joined lobby ${lobby.core.name}`);
                rach.add_sub(`/${lobby.core.id}/player_join`, this.onPlayerJoin.bind(this), []);
                rach.add_sub(`/${lobby.core.id}/chat`, this.onChat.bind(this), []);
                rach.add_pub(`/${lobby.core.id}/chat`);
                this.setState({user: user, lobbyCore: lobby.core});
            }, [],
            (err) => {
                this.consoleLog(err);
            }, [],
        );
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
}


Game.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Game);