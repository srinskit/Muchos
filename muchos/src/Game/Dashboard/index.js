import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import StartGameIcon from '@material-ui/icons/Gamepad';
import LeaveLobbyIcon from '@material-ui/icons/ExitToApp';
import ReportBugIcon from '@material-ui/icons/BugReport';
import ToggleThemeIcon from '@material-ui/icons/InvertColors';
import InviteIcon from "@material-ui/icons/Share";
import HelpIcon from "@material-ui/icons/Help";

const styles = theme => ({
    buttonContent: {
        flexDirection: "column",
    },
    gridContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
});


class Dashboard extends Component {
    render() {
        const {classes} = this.props;
        return (
            <Dialog
                onClose={this.props.onClose.bind(this)}
                open={true}
            >
                <DialogContent>
                    <Grid container spacing={16}>
                        <Grid item xs={4} className={classes.gridContent}>
                            <Button onClick={this.props.onCommand.bind(this, "! start")}>
                                <div className={classes.buttonContent}>
                                    <StartGameIcon fontSize={"large"}/>
                                    <div>Start Game</div>
                                </div>
                            </Button>
                        </Grid>
                        <Grid item xs={4} className={classes.gridContent}>
                            <Button onClick={this.props.onControl.bind(this, "invite")}>
                                <div className={classes.buttonContent}>
                                    <InviteIcon fontSize={"large"}/>
                                    <div>Invite Friends</div>
                                </div>
                            </Button>
                        </Grid>
                        <Grid item xs={4} className={classes.gridContent}>
                            <Button onClick={this.props.onCommand.bind(this, "! theme_toggle")}>
                                <div className={classes.buttonContent}>
                                    <ToggleThemeIcon fontSize={"large"}/>
                                    <div>Toggle Theme</div>
                                </div>
                            </Button>
                        </Grid>
                        <Grid item xs={4} className={classes.gridContent}>
                            <Button onClick={this.props.onCommand.bind(this, "! leave")}>
                                <div className={classes.buttonContent}>
                                    <LeaveLobbyIcon fontSize={"large"}/>
                                    <div>Leave Lobby</div>
                                </div>
                            </Button>
                        </Grid>
                        <Grid item xs={4} className={classes.gridContent}>
                            <Button onClick={this.props.onControl.bind(this, "openHelp")}>
                                <div className={classes.buttonContent}>
                                    <HelpIcon fontSize={"large"}/>
                                    <div>Help & Rules</div>
                                </div>
                            </Button>
                        </Grid>
                        <Grid item xs={4} className={classes.gridContent}>
                            <Button onClick={this.props.onControl.bind(this, "! reportBug")}>
                                <div className={classes.buttonContent}>
                                    <ReportBugIcon fontSize={"large"}/>
                                    <div>Report Bug</div>
                                </div>
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}


Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(Dashboard);