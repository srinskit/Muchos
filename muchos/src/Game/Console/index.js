import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import ReactMarkdown from "react-markdown";
import ScrollableFeed from "react-scrollable-feed"
import Paper from "@material-ui/core/Paper";


const styles = theme => ({
    Console: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    textField_FullWidth: {
        margin: theme.spacing.unit,
        width: `calc( 100% - 2*${theme.spacing.unit}px )`,
    },
    log: {
        margin: theme.spacing.unit,
        wordWrap: "break-word",
    },
    paperWrap: {
        padding: "2px 10px",
    },
});

class Console extends Component {
    constructor(props) {
        super(props);
        this.state = {
            commandText: '',
        };
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    handleCommandSubmit = (event) => {
        event.preventDefault();
        let command = this.state.commandText;
        this.setState({commandText: ''});
        this.props.onCommand(command);
    };

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.Console}>
                <ScrollableFeed className={classes.display}>
                    {
                        this.props.consoleLog.map((log, i) => {
                            return (
                                <div key={`log${i}`} className={classes.log}>
                                    <Paper className={classes.paperWrap}><ReactMarkdown source={log}/></Paper>
                                </div>
                            );
                        })
                    }
                </ScrollableFeed>
                <div>
                    <form onSubmit={this.handleCommandSubmit}>
                        <TextField
                            className={classes.textField_FullWidth}
                            placeholder="Console"
                            margin="normal"
                            value={this.state.commandText}
                            onChange={this.handleChange("commandText")}
                        />
                    </form>
                </div>
            </div>
        );
    }
}


Console.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(Console);