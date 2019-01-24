import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Home from './Home';
import Game from './Game';

const styles = theme => ({
    App: {
        height: '100%',
    },
});

class App extends Component {
    render() {
        const {classes} = this.props;
        return (
            <div className={classes.App}>
                <Game/>
            </div>
        );
    }
}


App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);