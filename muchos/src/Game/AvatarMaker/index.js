import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: `calc(100% - ${2 * theme.spacing.unit}px)`,
    },
    button: {
        margin: theme.spacing.unit,
        width: `calc(100% - ${2 * theme.spacing.unit}px)`,
    },
});

class AvatarMaker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
        }
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    handleClick() {
        this.props.avatarLoader({name: this.state.name});
    }

    render() {
        const {classes} = this.props;
        return (
            <Dialog open={true}
            >
                <DialogTitle>
                    Create an avatar
                </DialogTitle>
                <DialogContent>
                    <Grid container>
                        <Grid item xs={12}>
                            <TextField
                                placeholder="Name"
                                margin="normal"
                                className={classes.textField}
                                value={this.state.name}
                                onChange={this.handleChange('name')}
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button onClick={this.handleClick.bind(this)}
                                    variant="contained" color="primary" className={classes.button} fullWidth>
                                Play
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}


AvatarMaker.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AvatarMaker);