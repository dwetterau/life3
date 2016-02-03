getEmptyPhotoContent = () => {
    return {
        _id: uuid.v4(),
        type: contentTypes.photo,
        url: "",
        description: ""
    };
};

EditPhotoContent = React.createClass({
    propTypes: {
        // The current properties of the content
        content: React.PropTypes.object.isRequired,

        // The function to call when the content changes
        updateContent: React.PropTypes.func.isRequired
    },

    handleContentUpdate(newContent) {
        if (newContent.type != contentTypes.photo) {
            throw Error("Tried to edit non-photo content as photo.");
        }

        // Note that since we tell the parent and have the props re-flow,
        // fields for different types will be cleared out by this method.
        this.props.updateContent({
            _id: newContent._id,
            type: contentTypes.photo,
            url: newContent.url,
            description: newContent.description
        });
    },

    handleUrlChange(e) {
        this.props.content.url = e.target.value;
        this.handleContentUpdate(this.props.content);
    },

    handleDescriptionChange(e) {
        this.props.content.description = e.target.value;
        this.handleContentUpdate(this.props.content);
    },


    render() {
        return (
            <div className="photo-content-editor">
                <input className="photo-url-editor" type="text"
                       placeholder="http://" value={this.props.content.url}
                       onChange={this.handleUrlChange} />
                <TextArea placeholder="Description"
                          value={this.props.content.description || ""} rows={2}
                          onChange={this.handleDescriptionChange}/>
            </div>
        )
    }
});