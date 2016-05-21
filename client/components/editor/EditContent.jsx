import React from "react"

EditContent = React.createClass({
    propTypes: {
        // The current properties of the content
        content: React.PropTypes.object.isRequired,

        // The function to call when the content changes
        updateContent: React.PropTypes.func.isRequired,

        // The function to call when the content is completely deleted
        deleteContent: React.PropTypes.func.isRequired
    },

    renderEditor() {
        if (this.props.content.type == contentTypes.text) {
            return <EditTextContent
                content={this.props.content}
                updateContent={this.props.updateContent} />
        } else if (this.props.content.type == contentTypes.budget) {
            return <EditBudgetContent
                content={this.props.content}
                updateContent={this.props.updateContent} />
        } else {
            console.error("Unknown content type, cannot render editor ",
                this.props.content.type);
        }
    },

    renderOptions() {
        const deleteText = `delete this ${this.props.content.type}`;
        return (
            <div className="content-options-menu">
                <a className="-option -delete"
                     onClick={this.props.deleteContent}>
                    {deleteText}
                </a>
            </div>
        )
    },

    render() {
        return (
            <div className="create-content-container">
                {this.renderOptions()}
                {this.renderEditor()}
            </div>
        );
    }
});