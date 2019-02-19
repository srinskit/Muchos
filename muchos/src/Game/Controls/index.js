import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import VideoGameIcon from "@material-ui/icons/VideogameAsset";
import DrawCardIcon from "@material-ui/icons/NoteAdd";
import PassTurnIcon from "@material-ui/icons/SkipNext";
import ColorSelectorIcon from "@material-ui/icons/ColorLens";
import ChatIcon from "@material-ui/icons/Chat";
import InviteIcon from "@material-ui/icons/Share";
import LeaveLobbyIcon from "@material-ui/icons/ExitToApp";
import Tooltip from "@material-ui/core/es/Tooltip/Tooltip";
import classNames from "classnames";
import Badge from "@material-ui/core/Badge";
import Avatar from "@material-ui/core/Avatar";

const styles = theme => ({
    controls: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    margin: {
        margin: theme.spacing.unit,
    },
    playerDisplay: {
        margin: theme.spacing.unit,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    innerControls: {
        display: "flex",
        flexDirection: "column",
    },
    avatar: {
        margin: theme.spacing.unit,
    },
    myTurn: {
        backgroundColor: "#4caf50",
    },
    b: {
        color: "#2196f3",
    },
    g: {
        color: "#4caf50",
    },
    r: {
        color: "#f44336",
    },
    y: {
        color: "#ffeb3b",
    },
});

class Controls extends Component {
    render() {
        const {classes} = this.props;
        return (
            <Paper className={classes.controls} elevation={1}>
                <div className={classes.playerDisplay}>
                    {
                        Object.keys(this.props.players).map((name, i) => {
                            let user = this.props.players[name];
                            if (user)
                                return (
                                    <Tooltip className={classes.avatar}
                                             key={`ctrl_ply_${i}`}
                                             title={name}
                                             placement={"left"}>
                                        <Badge badgeContent={this.props.cardCount[user.name] || 0}
                                               color="secondary">
                                            <Avatar className={classNames({
                                                [classes.myTurn]: this.props.turn === user.name
                                            })}>
                                                {user.name[0].toUpperCase()}
                                            </Avatar>
                                        </Badge>
                                    </Tooltip>
                                );
                            return null;
                        })
                    }
                </div>
                <div className={classes.innerControls}>
                    <Tooltip title="Hand" placement={"left"}>
                        <IconButton
                            className={classNames({
                                [classes[this.props.color || "b"]]: this.props.color != null,
                                [classes.margin]: true
                            })}
                            onClick={() => this.props.onControl("myHandOpen")}>
                            <VideoGameIcon fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Set color" placement={"left"}>
                        <IconButton
                            className={classNames({
                                [classes[this.props.myColor || "b"]]: this.props.myColor != null,
                                [classes.margin]: true
                            })}
                            onClick={() => this.props.onControl("colorSelectorOpen")}
                        >
                            <ColorSelectorIcon fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Draw card" placement={"left"}>
                        <IconButton className={classes.margin} onClick={() => this.props.onControl("drawCard")}>
                            <Badge badgeContent={this.props.balance} color="secondary">
                                <DrawCardIcon fontSize="large"/>
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Pass turn" placement={"left"}>
                        <IconButton className={classes.margin} onClick={() => this.props.onControl("passTurn")}>
                            <PassTurnIcon fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chat" placement={"left"} onClick={() => this.props.onControl("toggleChat")}>
                        <IconButton className={classes.margin}>
                            <Badge badgeContent={this.props.consoleBacklog} color="secondary">
                                <ChatIcon fontSize="large"/>
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Invite" placement={"left"} onClick={() => this.props.onControl("invite")}>
                        <IconButton className={classes.margin}>
                            <InviteIcon fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Leave lobby" placement={"left"} onClick={() => this.props.onControl("leaveLobby")}>
                        <IconButton className={classes.margin}>
                            <LeaveLobbyIcon fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                </div>
            </Paper>
        );
    }
}


Controls.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(Controls);