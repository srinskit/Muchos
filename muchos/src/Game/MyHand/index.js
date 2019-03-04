import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/es/Button/Button";
import ColorSelector from "./ColorSelector";

const styles = theme => ({});

class MyHand extends Component {
    constructor(props) {
        super(props);
        this.state = {
            colorSelector: false,
            cardCode: null,
        };
    }

    onCardSelection(cardCode) {
        if (cardCode[0] === "w")
            this.setState({cardCode: cardCode, colorSelector: true});
        else
            this.props.onCardSelection(cardCode);
    }

    onColorSelection(color) {
        this.props.onCardSelection(this.state.cardCode, color);
    }

    onCloseColorSelector() {
        this.setState({colorSelector: false});
    }

    render() {
        if (!this.state.colorSelector)
            return (
                <Dialog onClose={this.props.onClose.bind(this)} open={true}
                        maxWidth={"md"}
                        fullWidth={true}
                >
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
        else
            return (
                <ColorSelector
                    onClose={this.onCloseColorSelector.bind(this)}
                    callback={this.onColorSelection.bind(this)}
                />
            );
    }
}


MyHand.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(MyHand);