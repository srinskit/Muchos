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
        };
    }

    onCommand(command) {
        switch (command) {
            case 'clear':
                this.setState({commandLog: []});
                break;
            default:
                this.consoleLog(command);
                break;
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

    avatarLoader(user) {
        this.setState({user: user});
        this.consoleLog(`${user.name} connected`);
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