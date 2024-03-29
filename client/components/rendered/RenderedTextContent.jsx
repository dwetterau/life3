import React from "react"

RenderedTextContent = React.createClass({
    propTypes: {
        content: React.PropTypes.object.isRequired
    },

    render() {
        const source = this.props.content.description || "";
        return (
            <div className="event-content">
                <DraftEditor
                    text={source}
                    readOnly={true}
                    showOptions={false}
                    onTextChange={(x) => {}} />
            </div>
        )
    }
});