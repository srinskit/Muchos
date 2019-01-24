import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/es/Button/Button";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const styles = theme => ({
    myHand: {
        width: '50vw',
    },
    title: {
        display: 'flex',
        justifyContent: 'space-between',
    }
});

class MyHand extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show_all: false,
        };
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.checked});
    };

    render() {
        const {classes} = this.props;
        return (
            <Dialog onClose={this.props.onClose.bind(this)} open={true}
                    maxWidth={'md'}
                    fullWidth={true}
            >
                <DialogTitle>
                    <div className={classes.title}>
                        <div>Your cards</div>
                        <div>
                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.state.show_all}
                                            onChange={this.handleChange('show_all')}
                                        />
                                    }
                                    labelPlacement="start"
                                    label="Show All"
                                />
                            </FormGroup>
                        </div>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={0}>
                        {
                            this.props.hand.map((cardCode, i) => {
                                return (
                                    <Grid key={`mh${i}`} item xs={3}>
                                        <Button onClick={this.props.onCardSelection.bind(this, cardCode)}>
                                            <img src={this.props.assetGetter(cardCode)} alt={cardCode}/>
                                        </Button>
                                    </Grid>
                                )
                            })
                        }
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}


MyHand.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyHand);