EventOptions = React.createClass({
    propTypes: {
        // Whether or not an event is being created currently
        creating: React.PropTypes.bool.isRequired,

        // Whether the event is currently being edited or not
        editing: React.PropTypes.bool.isRequired,

        // Whether the user is looking at their own page or not
        isCurrentUser: React.PropTypes.bool.isRequired,

        // The function to call when the Save/Edit button is clicked on
        saveOrEditFunc: React.PropTypes.func.isRequired,

        // The function to call when the delete button is clicked on
        deleteFunc: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            expanded: false
        }
    },

    toggleExpand() {
        this.setState({expanded: !this.state.expanded});
    },

    renderExpander() {
        const text = this.state.expanded ? "^" : "v";
        return (
            <div className="expander"
                 onClick={this.toggleExpand}>
                {text}
            </div>
        );
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

    renderOptions() {
        // If the menu isn't expanded, don't show it
        if (!this.state.expanded) {
            return;
        }
        return (
            <div className="event-options-list">
                {this.renderEventOptionEdit()}
                {this.renderEventOptionDelete()}
            </div>
        )
    },

    render() {
        // If we aren't looking at our own events, offer no options.
        if (!this.props.isCurrentUser) {
            return <div className="event-options"></div>;
        }
        return (
            <div className="event-options">
                {this.renderExpander()}
                {this.renderOptions()}
            </div>
        );
    }
});