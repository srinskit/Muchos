import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import VideoGameIcon from "@material-ui/icons/VideogameAsset";
import InviteIcon from "@material-ui/icons/Share";
import LeaveLobbyIcon from "@material-ui/icons/ExitToApp";
import Tooltip from "@material-ui/core/es/Tooltip/Tooltip";
import classNames from "classnames";

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
        display: "flex",
        flexDirection: "column",
    },
    innerControls: {
        display: "flex",
        flexDirection: "column",
    },
    playerPaper: {
        margin: "10px",
        padding: "10px",
        display: "flex",
        justifyContent: "center",
    },
    greenBorder: {
        border: "solid 3px green",
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
                                    <Tooltip key={`ctrl_ply_${i}`} title={name} placement={"left"}>
                                        <Paper className={classNames({
                                            [classes.playerPaper]: true,
                                            [classes.greenBorder]: this.props.turn === user.name
                                        })}>
                                            {user.name[0].toUpperCase()}
                                        </Paper>
                                    </Tooltip>
                                );
                            return null;
                        })
                    }
                </div>
                <div className={classes.innerControls}>
                    <Tooltip title="Hand" placement={"left"}>
                        <IconButton className={classes.margin} onClick={() => this.props.onControl("myHandOpen")}>
                            <VideoGameIcon fontSize="large"/>
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

export default withStyles(styles)(Controls);