import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/es/Button/Button";

const styles = theme => ({});

class MyHand extends Component {
    onCardSelection(cardCode) {
        this.props.onCardSelection(cardCode);
    }

    render() {
        return (
            <Dialog onClose={this.props.onClose.bind(this)} open={true}
                    maxWidth={"md"}
                    fullWidth={true}
            >
                <DialogTitle>
                    Your cards
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={0}>
                        {
                            this.props.hand.map((cardCode, i) => {
                                return (
                                    <Grid key={`mh${i}`} item xs={3}>
                                        <Button onClick={this.onCardSelection.bind(this, cardCode)}>
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

export default withStyles(styles, {withTheme: true})(MyHand);