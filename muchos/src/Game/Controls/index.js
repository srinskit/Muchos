import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import VideoGameIcon from '@material-ui/icons/VideogameAsset';
import CardIcon from '@material-ui/icons/FileCopy';


const styles = theme => ({
    controls: {
        height: '100%',
    },
    margin: {
        margin: theme.spacing.unit,
    },
    innerControls: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
    },
});

class Controls extends Component {
    render() {
        const {classes} = this.props;
        return (
            <Paper className={classes.controls} elevation={1}>
                <div className={classes.innerControls}>
                    <IconButton className={classes.margin}>
                        <VideoGameIcon fontSize="large"/>
                    </IconButton>
                    <IconButton className={classes.margin} onClick={() => this.props.onControl('myHandOpen')}>
                        <CardIcon fontSize="large"/>
                    </IconButton>
                    <IconButton className={classes.margin}>
                        <VideoGameIcon fontSize="large"/>
                    </IconButton>
                </div>
            </Paper>
        );
    }
}


Controls.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Controls);