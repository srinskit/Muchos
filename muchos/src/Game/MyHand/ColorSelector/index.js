import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/es/Button/Button";

const styles = theme => ({
    b: {
        backgroundColor: "blue",
        color: "black",
    },
    g: {
        backgroundColor: "green",
        color: "black",
    },
    r: {
        backgroundColor: "red",
        color: "black",
    },
    y: {
        backgroundColor: "yellow",
        color: "black",
    },
});

class ColorSelector extends Component {
    render() {
        const {classes} = this.props;
        return (
            <Dialog onClose={this.props.onClose.bind(this)} open={true}>
                <DialogTitle>
                    Set game color
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={16}>
                        <Grid item xs={6}>
                            <Button fullWidth className={classes.b} onClick={this.props.callback.bind(this, "b")}>
                                B
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth className={classes.g} onClick={this.props.callback.bind(this, "g")}>
                                G
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth className={classes.r} onClick={this.props.callback.bind(this, "r")}>
                                R
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth className={classes.y} onClick={this.props.callback.bind(this, "y")}>
                                Y
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}


ColorSelector.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(ColorSelector);