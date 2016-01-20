getEmptyEvent = () => {
    return {
        startTime: new Date(),
        title: "",
        contents: [],
        public: false
    };
};

EditEvent = React.createClass({
    propTypes: {
        // The current properties of the event
        event: React.PropTypes.object.isRequired,

        // The function to call to create the event
        createFunc: React.PropTypes.func,

        // The function to call to update the event
        updateFunc: React.PropTypes.func,

        // The function to call to delete the event
        deleteFunc: React.PropTypes.func
    },

    getInitialState() {
        return {
            event: this.props.event,
            creating: !this.props.event._id
        }
    },

    handleTitleChange(e) {
        this.state.event.title = e.target.value;
        this.setState({event: this.state.event});
    },

    handleDateChange(newDate) {
        this.state.event.startTime = newDate;
        this.setState({event: this.state.event});
    },

    handlePublicChange() {
        this.state.event.public = !this.state.event.public;
        this.setState({event: this.state.event})
    },

    handleContentChange(index, newContent) {
        this.state.event.contents[index] = newContent;
        this.setState({event: this.state.event});
    },

    handleDeleteContent(index) {
        this.state.event.contents.splice(index, 1);
        this.setState({event: this.state.event});
    },

    selectNewContentType(contentType) {
        if (contentType == contentTypes.text) {
            this.state.event.contents.push(getEmptyTextContent());
        } else if (contentType == contentTypes.budget) {
            this.state.event.contents.push(getEmptyBudgetContent());
        } else if (contentType == contentTypes.checklist) {
            this.state.event.contents.push(getEmptyChecklistContent());
        }
        this.setState({event: this.state.event});
    },

    createEvent() {
        if (!this.state.creating) {
            throw Error("Tried to create event in non-create mode.");
        }
        let newEvent = {};
        newEvent.startTime = this.state.event.startTime;
        newEvent.title = this.state.event.title;
        newEvent.contents = this.state.event.contents;
        newEvent.public = this.state.event.public;

        this.props.createFunc(newEvent);

        // Reset the editor to a blank event of the same type
        this.setState({event: getEmptyEvent()})
    },

    updateEvent() {
        let newEvent = {};
        // Clear off the _id value
        Object.keys(this.state.event).forEach(function(key) {
            if (key == "_id") {
                return;
            }
            newEvent[key] = this.state.event[key];
        }.bind(this));
        this.props.updateFunc(this.state.event._id, newEvent);
    },

    renderOptions() {
        const saveOrEdit = (this.state.creating) ? this.createEvent :
            this.updateEvent;
        const deleteFunc = (this.state.creating) ? () => {} :
            this.props.deleteFunc;
        return <EventOptions creating={this.state.creating}
                             editing={true}
                             saveOrEditFunc={saveOrEdit}
                             deleteFunc={deleteFunc} />
    },

    renderDatePicker() {
        return <DatePicker callback={this.handleDateChange}
                           date={this.state.event.startTime} />
    },

    renderTitleEditor() {
        return (
            <div className="event-title-editor">
                <input type="text" placeholder="Title"
                       value={this.state.event.title}
                       onChange={this.handleTitleChange}/>
            </div>
        )
    },

    renderContentEditors() {
        return (
            <div className="event-content-editors-container">
                {this.state.event.contents.map(function(content, index) {
                    return <EditContent
                        key={content._id}
                        content={content}
                        updateContent={
                            this.handleContentChange.bind(this, index)
                        }
                        deleteContent={
                            this.handleDeleteContent.bind(this, index)
                        }
                    />
                }.bind(this))}
            </div>
        )
    },

    renderEditorContentSelectorTile(type) {
        const className = "editor-selector-tile -" + type;
        return (
            <div key={type} className={className}
                 onClick={this.selectNewContentType.bind(this, type)}>
                {type[0].toUpperCase() + type.substr(1)}
            </div>
        )
    },

    renderEditorContentSelector() {
        return (
            <div className="editor-selector-container">
                {Object.keys(contentTypes).map(
                    this.renderEditorContentSelectorTile)}
            </div>
        )
    },

    renderEditorPublicSelector() {
        // TODO: Make this a select menu for the visibility options?
        const verb = (this.state.event._id) ? "is" : "will be";
        let text = `This event ${verb} visible to only you.`;
        if (this.state.event.public) {
            text = `This event ${verb} visible to the world.`;
        }
        return (
            <div className="editor-public-container">
                <div className="editor-public-changer"
                     onClick={this.handlePublicChange}>
                    {text}
                </div>
            </div>
        )
    },

    render() {
        return (
            <div className="event-editor">
                {this.renderOptions()}
                {this.renderDatePicker()}
                {this.renderTitleEditor()}
                {this.renderContentEditors()}
                {this.renderEditorContentSelector()}
                {this.renderEditorPublicSelector()}
            </div>
        )
    }
});