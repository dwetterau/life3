getEmptyTextContent = () => {
    return {
        _id: uuid.v4(),
        type: contentTypes.text,
        description: ""
    };
};

EditTextContent = React.createClass({
    propTypes: {
        // The current properties of the content
        content: React.PropTypes.object.isRequired,

        // The function to call when the content changes
        updateContent: React.PropTypes.func.isRequired
    },

    handleContentUpdate(newContent) {
        if (newContent.type != contentTypes.text) {
            throw Error("Tried to edit non-text content as text.");
        }

        // Note that since we tell the parent and have the props re-flow,
        // fields for different types will be cleared out by this method.
        this.props.updateContent({
            _id: newContent._id,
            type: contentTypes.text,
            description: newContent.description
        });
    },

    handleDescriptionChange(newRawContent) {
        this.props.content.description = newRawContent;
        this.handleContentUpdate(this.props.content);
    },


    render() {
        return (
            <div className="text-content-editor">
                <DraftEditor
                    text={this.props.content.description}
                    readOnly={false}
                    onTextChange={this.handleDescriptionChange}
                    showOptions={true}
                    placeholder={"Description..."} />
            </div>
        )
    }
});