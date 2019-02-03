import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/es/Button/Button";

const styles = theme => ({
    b: {
        backgroundColor: "blue",
    },
    g: {
        backgroundColor: "green",
    },
    r: {
        backgroundColor: "red",
    },
    y: {
        backgroundColor: "yellow",
    },
});

class ColorSelector extends Component {
    render() {
        const {classes} = this.props;
        return (
            <Dialog onClose={this.props.onClose.bind(this)} open={true}>
                <DialogTitle>
                    Set card color
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={0}>
                        <Grid item xs={6}>
                            <Button fullWidth className={classes.b} onClick={this.props.callback.bind(this, "b")}>
                                Blue
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth className={classes.g} onClick={this.props.callback.bind(this, "g")}>
                                Green
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={0}>
                        <Grid item xs={6}>
                            <Button fullWidth className={classes.r} onClick={this.props.callback.bind(this, "r")}>
                                Red
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth className={classes.y} onClick={this.props.callback.bind(this, "y")}>
                                Yellow
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

export default withStyles(styles)(ColorSelector);