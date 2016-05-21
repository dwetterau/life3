import uuid from "node-uuid"
import React from "react"
import DraftJS, {Entity} from "draft-js"

getEmptyChecklistContent = () => {
    return {
        _id: uuid.v4(),
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

Checklist = React.createClass({
    getInitialState() {
        return this._getStateFromProps(this.props);
    },

    componentWillReceiveProps(newProps) {
        this.setState(this._getStateFromProps(newProps))
    },

    _getStateFromProps(props) {
        const data = Entity.get(props.block.getEntityAt(0)).getData();
        return {
            itemRows: data.itemRows
        }
    },

    initializeAndGetItemRow(rowIndex) {
        if (!this.state.itemRows) {
            this.state.itemRows = [];
        }
        if (this.state.itemRows[rowIndex] === undefined) {
            if (rowIndex != this.state.itemRows.length) {
                console.error("Adding a item row at a far away index", rowIndex,
                    this.state.itemRows);
            }
            this.state.itemRows[rowIndex] = getEmptyChecklistItemRow();
        }
        return this.state.itemRows[rowIndex];
    },

    handleContentUpdate(newItemRows) {
        const entityKey = this.props.block.getEntityAt(0);
        Entity.mergeData(entityKey, {itemRows: newItemRows});
        this.forceUpdate();
    },

    handleItemRowDescriptionChange(rowIndex, rawContent) {
        let row = this.initializeAndGetItemRow(rowIndex);
        const contentState = DraftJS.convertFromRaw(rawContent);
        row.description = contentState.getPlainText().trim();

        this.handleContentUpdate(this.state.itemRows);
    },

    handleItemRowDoneChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        row.done = !row.done;
        this.handleContentUpdate(this.state.itemRows);
    },

    handleDeleteItemRow(rowIndex) {
        const itemRows = this.state.itemRows;
        itemRows.splice(rowIndex, 1);
        this.handleContentUpdate(itemRows);
    },

    handleAddItemRow() {
        const itemRows = this.state.itemRows || [];
        itemRows.push(getEmptyChecklistItemRow());
        this.handleContentUpdate(itemRows);
    },

    handleReturn() {
        this.handleAddItemRow();

        // We don't want Draft to do anything with this event.
        this.forceUpdate();
        return true;
    },

    handleTextBoxFocus() {
        // We want to swap the editor into editable-only mode.
        this.props.blockProps.setEditable(false);
        if (this.refs.editor !== undefined) {
            this.refs.editor.focus();
        }
    },

    handleTextBoxBlur() {
        // We're losing focus anyway, don't have to do anything special
        if (this.refs.editor !== undefined) {
            this.refs.editor.blur();
        }
        this.props.blockProps.setEditable(true);
    },

    renderCreateChecklistRow(row, index) {
        return (
            <div className="checklist-row" key={row._id}>
                <div className="checklist-checkbox-container">
                    <input type="checkbox" defaultChecked={row.done}
                           onChange={this.handleItemRowDoneChange.bind(
                                this, index)} />
                </div>
                <div className="checklist-description-container"
                     onClick={this.handleTextBoxFocus}
                     onBlur={this.handleTextBoxBlur}>
                    <DraftEditor ref="editor"
                                 text={row.description}
                                 readOnly={false}
                                 onTextChange={
                                    this.handleItemRowDescriptionChange.bind(
                                        this, index
                                 )}
                                 showOptions={false}
                                 placeholder="Description"
                                 handleReturn={this.handleReturn} />
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
        if (this.state.itemRows !== undefined) {
            itemRows = this.state.itemRows.map(
                this.renderCreateChecklistRow);
        }
        return (
            <div className="checklist-items">
                {itemRows}
            </div>
        )
    },

    // Read only view
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

    renderReadOnlyView() {
        return (
            <div className="event-content">
                <div className="event-checklist">
                    {this.state.itemRows.map(this.renderChecklistItemRow)}
                </div>
            </div>
        )
    },

    render() {
        let content;
        if (this.props.blockProps.readOnly) {
            content = this.renderReadOnlyView();
        } else {
            content = (
                <div className="checklist-content-editor">
                    {this.renderCreateChecklistTable()}
                </div>
            );
        }
        return content;
    }
});