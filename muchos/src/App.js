import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import {MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import Home from "./Home";
import Game from "./Game";
import Rach from "rachjs";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import LinearProgress from "@material-ui/core/LinearProgress";
import DialogActions from "@material-ui/core/DialogActions";
import CssBaseline from "@material-ui/core/CssBaseline";

const theme = {
    "dark": createMuiTheme({
        palette: {
            type: "dark",
        },
    }),
    "light": createMuiTheme({
        palette: {
            type: "light",
        },
    })
};

const styles = theme => ({
    App: {},
});

class App extends Component {
    constructor(props) {
        super(props);
        let savedTheme = localStorage.getItem("theme");
        if (theme[savedTheme] == null)
            savedTheme = "dark";
        this.state = {
            theme: savedTheme,
            connectedToRach: false,
            createdLobby: null,
            joiningLobby: null,
            state: "home",
        };
        this.rach = new Rach("ws://localhost:8080", {username: "test", password: "pass", type: "1"});
        // this.rach.enable_debug();
    }

    componentDidMount() {
        this.rach.start(() => {
            this.setState({connectedToRach: true});
        });
    }

    componentWillUnmount() {
        this.rach.stop();
    }

    themeChanger(name) {
        if (name == null)
            name = localStorage.getItem("theme") === "dark" ? "light" : "dark";
        this.setState(prevState => ({theme: theme[name] != null ? name : prevState.theme}));
        if (theme[name] != null)
            localStorage.setItem("theme", name);
    }

    render() {
        const {classes} = this.props;
        return (
            <MuiThemeProvider theme={theme[this.state.theme]}>
                <React.Fragment>
                    <CssBaseline/>
                    <div className={classes.App}>
                        {!this.state.connectedToRach ? this.getRachStatusDialog("Connecting to server...") : null}
                        {this.state.connectedToRach ? this.getConnectedView() : null}
                    </div>
                </React.Fragment>
            </MuiThemeProvider>
        );
    }

    createLobby(lobbyName, cb) {
        if (lobbyName.length === 0) return;
        this.rach.service_call("/lobby.create", [lobbyName],
            (result) => {
                this.setState({createdLobby: result.result});
                cb(result.result);
            }, [],
            (err) => {
                console.error(err);
            }, [],
        );
    }

    joinLobby(lobbyID) {
        if (lobbyID.length === 0) return;
        this.setState({joiningLobbyID: lobbyID, state: "inGame"});
    }

    onLobbyLeave() {
        this.setState({createdLobby: null, joiningLobbyID: null, state: "home"});
    }

    getConnectedView() {
        switch (this.state.state) {
            case "inGame":
                return (
                    <Game
                        rach={this.rach}
                        lobbyID={this.state.joiningLobbyID}
                        onClose={this.onLobbyLeave.bind(this)}
                        themeChanger={this.themeChanger.bind(this)}
                    />
                );
            default:
                return (
                    <Home
                        createLobby={this.createLobby.bind(this)}
                        joinLobby={this.joinLobby.bind(this)}
                        lobby={this.state.createdLobby}
                    />
                );
        }
    }

    getRachStatusDialog(msg) {
        return (
            <Dialog open={!this.state.connectedToRach}>
                <DialogTitle>{msg}</DialogTitle>
                <DialogContent>
                    <LinearProgress/>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        );
    }
}


App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(App);