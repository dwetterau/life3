EditContent = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    contentTypes: {
        text: "text",
        budget: "budget"
    },

    getInitialState() {
        return {
            contentType: null
        }
    },

    createEvent() {
        if (this.state.contentType == this.contentTypes.text) {
            const titleField = ReactDOM.findDOMNode(this.refs.titleInput);
            const descriptionField = ReactDOM.findDOMNode(this.refs.descriptionInput);

            // TODO: allow this to be better specified
            const content = {
                title: titleField.value,
                description: descriptionField.value,
                startTime: new Date()
            };

            // TODO: check a prop value of the event id, if present, update instead
            Meteor.call("addEvent", content);

            titleField.value = '';
            descriptionField.value = '';
        }
    },

    selectContentType(contentType) {
        this.setState({contentType: contentType});
    },

    renderCreateGeneralContent() {
        const titlePlaceholder = "Title";
        const descriptionPlaceholder = "Description";
        return (
            <div className="general-content-editor">
                <input type="text" ref="titleInput" placeholder={titlePlaceholder}
                       defaultValue={this.props.event.title}/>
                <TextArea ref="descriptionInput" placeholder={descriptionPlaceholder}
                          defaultValue={this.props.event.description} rows={4} />
                {this.renderEditorSelector()}
                {this.renderCreateEventButton()}
            </div>
        )
    },

    renderCreateEventButton() {
        return (
            <div className="add-event-button" onClick={this.createEvent}>
                Click to add your new event!
            </div>
        )
    },

    renderEditorSelectorTile(type) {
        const className = "editor-selector-tile -" + type + ((type == this.state.contentType ? " -selected" : ""));
        return (
            <div key={type} className={className} onClick={this.selectContentType.bind(this, type)}>
                {type[0].toUpperCase() + type.substr(1)}
            </div>
        )
    },

    renderEditorSelector() {
        return (
            <div className="editor-selector-container">
                {Object.keys(this.contentTypes).map(this.renderEditorSelectorTile)}
            </div>
        )
    },

    renderEditor() {
      if (!this.state.contentType) {
          // Render the buttons to select the different types of content
          return this.renderEditorSelector()
      } else if (this.state.contentType == this.contentTypes.text) {
          return this.renderCreateGeneralContent()
      }
    },

    render() {
        return (
            <div className="create-event-container">
                {this.renderEditor()}
            </div>
        );
    }
});