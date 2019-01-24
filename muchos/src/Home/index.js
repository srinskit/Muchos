import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import PlayIcon from '@material-ui/icons/VideogameAsset';
import Tooltip from "@material-ui/core/Tooltip";

const styles = theme => ({
    home: {
        height: '100%',
    },
    lobbyNameWrapper: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
    },
    lobbyNamePaper: {
        marginLeft: '10px',
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
    },
    lobbyNameInput: {
        marginLeft: 8,
        flex: 1,
    },
    createLobbyButton: {
        padding: 10,
    },
    divider: {
        width: 1,
        height: 28,
        margin: 4,
    },
});

class Home extends Component {
    render() {
        const {classes} = this.props;
        return (
            <div className={classes.home}>
                <div>MuchoS</div>
                <div className={classes.lobbyNameWrapper}>
                    <Paper className={classes.lobbyNamePaper} elevation={1}>
                        <InputBase className={classes.lobbyNameInput} placeholder="Lobby name"/>
                        <Divider className={classes.divider}/>
                        <Tooltip title="Create lobby">
                            <IconButton className={classes.createLobbyButton}>
                                <PlayIcon/>
                            </IconButton>
                        </Tooltip>
                    </Paper>
                </div>
            </div>
        );
    }
}


Home.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);