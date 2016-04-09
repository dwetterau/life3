import React from "react"

RenderedChecklistContent = React.createClass({
    propTypes: {
        content: React.PropTypes.object.isRequired
    },

    renderDoneCheckbox(done) {
        return (
            <input className="checklist-done-checkbox"
                   type="checkbox" disabled={true} checked={done} />
        )
    },

    renderChecklistItemRow(itemRow) {
        let className = "checklist-item-row";
        className += (itemRow.done) ? " -done" : "";
        return (
            <div key={itemRow._id} className={className}>
                {this.renderDoneCheckbox(itemRow.done)}
                <div className="checklist-item-row-description">
                    {itemRow.description}
                </div>
            </div>
        )
    },

    render() {
        const itemRows = this.props.content.itemRows || [];
        return (
            <div className="event-content">
                <div className="event-checklist">
                    {itemRows.map(this.renderChecklistItemRow)}
                </div>
            </div>
        )
    }
});