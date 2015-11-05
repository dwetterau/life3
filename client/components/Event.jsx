Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            inEditMode: false
        }
    },

    getMarkdownContent() {
        return "# " + this.props.event.title +
               "\n" + this.props.event.description;
    },

    toggleEditMode() {
        // TODO: On the save here, we should actually save the new state...

        this.setState({inEditMode: !this.state.inEditMode});
    },

    renderOptions() {
        const editText = (this.state.inEditMode) ? "Save" : "Edit";
        return <div className="event-option-edit"
                    onClick={this.toggleEditMode}>{editText}</div>
    },

    renderWorkout() {
        if (!this.props.event.workout) {
            return;
        }
        return (
            <div className="workout-container">
                <div className="workout-duration">
                    {this.props.event.workout.duration}
                </div>
                <div className="workout-description">
                    {this.props.event.workout.description},
                </div>
            </div>
        )
    },

    renderEvent() {
        if (!this.state.inEditMode) {
            return (
                <div className="event-body">
                    <ReactMarkdown
                        className="event-description"
                        source={this.getMarkdownContent()} />
                    {this.renderWorkout()}
                </div>
            )
        } else {
            return (
                <EditContent event={this.props.event} />
            )
        }
    },

    render() {
        return (
            <div className="event-container card">
                <div className="event-header">
                    <div className="event-options">
                        {this.renderOptions()}
                    </div>
                </div>
                {this.renderEvent()}
            </div>
        );
    }
});