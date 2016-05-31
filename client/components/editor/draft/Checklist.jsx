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
        if (this.props.blockProps.readOnly) {
            // Only regen based on props if we are in readOnly mode.
            this.setState(this._getStateFromProps(newProps))
        }
    },

    _getStateFromProps(props) {
        const data = Entity.get(props.block.getEntityAt(0)).getData();
        this._id = data._id;
        let itemRows = data.itemRows.map(function(itemRow) {
            return {
                _id: itemRow._id,
                description: itemRow.description,
                done: itemRow.done
            }
        });

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
        Entity.replaceData(entityKey, {
            _id: this._id,
            itemRows: newItemRows
        });
        this.setState({itemRows: newItemRows});
        this.props.blockProps.forceStateUpdate();
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
        this.forceUpdate();
    },

    handleAddItemRow() {
        const itemRows = this.state.itemRows || [];
        itemRows.push(getEmptyChecklistItemRow());
        this.handleContentUpdate(itemRows);
        this.forceUpdate();
    },

    _focusNextEditor(index) {
        this.blurEditor(index);
        this.focusEditor(index + 1);
        this.handleTextBoxFocus(index + 1);
    },

    handleReturn(index, e) {
        if (index + 1 == this.state.itemRows.length) {
            this.handleAddItemRow();
            setTimeout(this._focusNextEditor.bind(this, index), 0);
        } else {
            this._focusNextEditor(index)
        }

        // We don't want Draft to do anything with this event.
        this.forceUpdate();
        return true;
    },

    handleBackspace(index) {
        if (this.state.itemRows[index].description == "") {
            // The current row is empty and we pressed backspace again, delete
            // this index now.
            if (index > 0) {
                this.handleDeleteItemRow(index);
                setTimeout(() => {
                   this.focusEditor(index - 1);
                   this.handleTextBoxFocus(index - 1)
                }, 0);
            }
        }
    },

    _getCurrentEditor(index) {
        return this.refs["editor_" + index]
    },

    focusEditor(index) {
        const curEditor = this._getCurrentEditor(index);
        if (curEditor !== undefined) {
            curEditor.focus();
        }
    },

    blurEditor(index) {
        const curEditor = this._getCurrentEditor(index);
        if (curEditor !== undefined) {
            curEditor.blur();
        }
    },

    handleTextBoxFocus(index) {
        // We want to swap the editor into editable-only mode.
        this.props.blockProps.setEditable(false);
        this.focusEditor(index);
    },

    handleTextBoxBlur() {
        // We're losing focus so switch the outer editor back
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
                     onBlur={this.handleTextBoxBlur}
                     onClick={this.handleTextBoxFocus.bind(this, index)} >
                    <DraftEditor ref={"editor_" + index}
                                 text={row.description}
                                 readOnly={false}
                                 onTextChange={
                                    this.handleItemRowDescriptionChange.bind(
                                        this, index
                                 )}
                                 showOptions={false}
                                 placeholder="Description"
                                 handleReturn={
                                    this.handleReturn.bind(this, index)
                                 }
                                 handleBackspace={
                                    this.handleBackspace.bind(this, index)
                                 }
                    />
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
            <div className="checklist-content-editor">
                <div className="checklist-items">
                    {itemRows}
                </div>
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
        if (this.props.blockProps.readOnly) {
            return this.renderReadOnlyView();
        } else {
            return this.renderCreateChecklistTable();
        }
    }
});