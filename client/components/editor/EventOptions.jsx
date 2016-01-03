EventOptions = React.createClass({
    propTypes: {
        // Whether or not an event is being created currently
        creating: React.PropTypes.bool.isRequired,

        // Whether the event is currently being edited or not
        editing: React.PropTypes.bool.isRequired,

        // The function to call when the Save/Edit button is clicked on
        saveOrEditFunc: React.PropTypes.func.isRequired,

        // The function to call when the delete button is clicked on
        deleteFunc: React.PropTypes.func.isRequired
    },

    renderEventOptionEdit() {
        const saveOrEdit = (this.props.creating) ? "Create" : (
            (this.props.editing) ? "Save" : "Edit");
        return <div className="event-option-edit"
                    onClick={this.props.saveOrEditFunc}>{saveOrEdit}</div>
    },

    renderEventOptionDelete() {
        // There's nothing to delete if we're creating still
        if (this.props.creating) return;
        return <div className="event-option-delete"
                    onClick={this.props.deleteFunc}>Delete</div>
    },

    render() {
        return (
            <div className="event-options">
                {this.renderEventOptionEdit()}
                {this.renderEventOptionDelete()}
            </div>
        );
    }
});