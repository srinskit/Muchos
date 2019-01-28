import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import VideoGameIcon from '@material-ui/icons/VideogameAsset';
import InviteIcon from '@material-ui/icons/Share';
import Tooltip from "@material-ui/core/es/Tooltip/Tooltip";


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
                    <Tooltip title='Hand' placement={'left'}>
                        <IconButton className={classes.margin} onClick={() => this.props.onControl('myHandOpen')}>
                            <VideoGameIcon fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Invite' placement={'left'} onClick={() => this.props.onControl('invite')}>
                        <IconButton className={classes.margin}>
                            <InviteIcon fontSize="large"/>
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