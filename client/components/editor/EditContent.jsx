import React from "react"

EditContent = React.createClass({
    propTypes: {
        // The current properties of the content
        content: React.PropTypes.object.isRequired,

        // The function to call when the content changes
        updateContent: React.PropTypes.func.isRequired
    },

    handleDescriptionChange(newRawContent) {
        this.props.content.description = newRawContent;
        this.props.updateContent({
            description: newRawContent
        });
    },

    render() {
        return (
            <div className="create-content-container">
                <div className="text-content-editor">
                    <DraftEditor
                        text={this.props.content.description}
                        readOnly={false}
                        onTextChange={this.handleDescriptionChange}
                        showOptions={true}
                        placeholder={"Description..."} />
                </div>
            </div>
        );
    }
});