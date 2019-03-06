import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import CreateIcon from "@material-ui/icons/FiberNew";
import CopyIcon from "@material-ui/icons/FileCopy";
import PlayIcon from "@material-ui/icons/VideogameAsset";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/es/Typography/Typography";
const styles = theme => ({
    home: {},
    centeredDiv: {
        display: "flex",
        width: "100%",
        justifyContent: "center",
        padding: "20px 0",
    },
    paperWrap: {
        marginLeft: "10px",
        padding: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: 400,
    },
    inputWrap: {
        marginLeft: 8,
        flex: 1,
    },
    button: {
        padding: 10,
    },
    divider: {
        width: 1,
        height: 28,
        margin: 4,
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

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lobbyName: '',
            lobbyID: '',
        };
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    createLobby(lobbyName) {
        this.props.createLobby(lobbyName, (lobby) => {
            this.setState({lobbyID: lobby.id});
        });
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.home}>
                <div className={classes.centeredDiv}>
                    <Typography variant="h2">
                        MuchoS
                    </Typography>
                </div>
                <div className={classes.centeredDiv}>
                    <Typography variant="h6">
                        Create a lobby
                    </Typography>
                </div>
                <div className={classes.centeredDiv}>
                    <Paper className={classes.paperWrap} elevation={1}>
                        <InputBase
                            className={classes.inputWrap}
                            placeholder="Lobby name"
                            value={this.state.lobbyName}
                            onChange={this.handleChange("lobbyName")}
                        />
                        <Divider className={classes.divider}/>
                        <Tooltip title="Create lobby">
                            <IconButton
                                className={classes.button}
                                onClick={this.createLobby.bind(this, this.state.lobbyName)}
                            >
                                <CreateIcon/>
                            </IconButton>
                        </Tooltip>
                    </Paper>
                </div>
                {
                    this.props.lobby ?
                        <div className={classes.centeredDiv}>
                            <Paper className={classes.paperWrap} elevation={1}>
                                <div className={classes.inputWrap}>
                                    {this.props.lobby.id}
                                </div>
                                <Divider className={classes.divider}/>
                                <Tooltip title="Copy ID">
                                    <IconButton
                                        className={classes.button}
                                        onClick={copyToClipboard.bind(null, this.props.lobby.id)}
                                    >
                                        <CopyIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Paper>
                        </div>
                        : null
                }
                <div className={classes.centeredDiv}>
                    <Typography variant="h6">
                        Join a lobby
                    </Typography>
                </div>
                <div className={classes.centeredDiv}>
                    <Paper className={classes.paperWrap} elevation={1}>
                        <InputBase
                            className={classes.inputWrap}
                            placeholder="Lobby ID"
                            value={this.state.lobbyID}
                            onChange={this.handleChange("lobbyID")}
                        />
                        <Divider className={classes.divider}/>
                        <Tooltip title="Join lobby">
                            <IconButton
                                className={classes.button}
                                onClick={this.props.joinLobby.bind(this, this.state.lobbyID)}
                            >
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

export default withStyles(styles, {withTheme: true})(Home);