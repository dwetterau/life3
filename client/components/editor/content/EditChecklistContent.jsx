getEmptyChecklistContent = () => {
    return {
        _id: uuid.v4(),
        type: contentTypes.checklist,
        itemRows: [getEmptyChecklistItemRow()]
    };
};

getEmptyChecklistItemRow = () => {
    return {
        _id: uuid.v4(),
        description: "",
        done: false
    }
};

EditChecklistContent = React.createClass({
    propTypes: {
        // The current properties of the content
        content: React.PropTypes.object.isRequired,

        // The function to call when the content changes
        updateContent: React.PropTypes.func.isRequired
    },

    initializeAndGetItemRow(rowIndex) {
        if (!this.props.content.itemRows) {
            this.props.content.itemRows = [];
        }
        if (this.props.content.itemRows[rowIndex] === undefined) {
            if (rowIndex != this.props.content.itemRows.length) {
                console.error("Adding a item row at a far away index", rowIndex,
                    this.props.content.itemRows);
            }
            this.props.content.itemRows[rowIndex] = getEmptyChecklistItemRow();
        }
        return this.props.content.itemRows[rowIndex];
    },

    handleContentUpdate(newContent) {
        if (newContent.type != contentTypes.checklist) {
            throw Error("Tried to edit non-checklist content as a checklist.");
        }

        // Note that since we tell the parent and have the props re-flow,
        // fields for different types will be cleared out by this method.
        let itemRows = newContent.itemRows.map(function(itemRow) {
            return {
                _id: itemRow._id,
                description: itemRow.description,
                done: itemRow.done
            }
        });
        this.props.updateContent({
            _id: newContent._id,
            type: contentTypes.checklist,
            itemRows: itemRows
        });
    },

    handleItemRowDescriptionChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        row.description = e.target.value;
        this.handleContentUpdate(this.props.content);
    },

    handleItemRowDoneChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        row.done = !row.done;
        this.handleContentUpdate(this.props.content);
    },

    handleDeleteItemRow(rowIndex) {
        let itemRows = this.props.content.itemRows;
        itemRows.splice(rowIndex, 1);
        this.handleContentUpdate(this.props.content);
    },

    handleAddItemRow() {
        let itemRows = this.props.content.itemRows || [];
        itemRows.push(getEmptyChecklistItemRow());
        this.handleContentUpdate(this.props.content);
    },

    renderCreateChecklistRow(row, index) {
        return (
            <div className="checklist-row" key={row._id}>
                <div className="checklist-checkbox-container">
                    <input type="checkbox" defaultChecked={row.done}
                           onChange={this.handleItemRowDoneChange.bind(
                                this, index)} />
                </div>
                <div className="checklist-description-container">
                    <textarea
                        placeholder="Description"
                        value={row.description || ""} rows={1}
                        onChange={this.handleItemRowDescriptionChange.bind(
                            this, index)} />
                </div>
                <div className="checklist-item-row-delete-button"
                     onClick={this.handleDeleteItemRow.bind(
                        this, index)}>
                    x
                </div>
            </div>
        );
    },

    renderCreateChecklistTable() {
        let itemRows = [];
        if (this.props.content.itemRows !== undefined) {
            itemRows = this.props.content.itemRows.map(
                this.renderCreateChecklistRow);
        }
        return (
            <div className="checklist-items">
                {itemRows}
            </div>
        )
    },

    renderAddItemRowButton() {
        return (
            <div className="checklist-add-item-row"
                 onClick={this.handleAddItemRow}>
                Add task
            </div>
        )
    },

    render() {
        return (
            <div className="checklist-content-editor">
                {this.renderCreateChecklistTable()}
                {this.renderAddItemRowButton()}
            </div>
        )
    }
});