import uuid from "node-uuid"
import React from "react"
import DraftJS, {Entity} from "draft-js"

getEmptyBudgetContent = () => {
    return {
        _id: uuid.v4(),
        type: contentTypes.budget,
        payee: "",
        itemRows: [getEmptyBudgetItemRow()]
    };
};

getEmptyBudgetItemRow = () => {
    return {
        _id: uuid.v4(),
        description: "",
        value: "000",
        isExpense: true
    }
};

Budget = React.createClass({
    getInitialState() {
        return this._getStateFromProps(this.props);
    },

    componentWillReceiveProps(newProps) {
        const newState = this._getStateFromProps(newProps);
        if (this.props.blockProps.readOnly) {
            // Only regen based on props if we are in readOnly mode.
            this.setState(newState);
        }
    },

    _getStateFromProps(props) {
        const data = Entity.get(props.block.getEntityAt(0)).getData();
        let itemRows = data.itemRows.map(function(itemRow) {
            return {
                _id: itemRow._id,
                description: itemRow.description,
                value: itemRow.value,
                isExpense: itemRow.isExpense
            }
        });

        return {
            _id: data._id,
            payee: data.payee,
            itemRows: itemRows
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
            this.state.itemRows[rowIndex] = getEmptyBudgetItemRow();
        }
        return this.state.itemRows[rowIndex];
    },

    handleContentUpdate(newContent) {
        const entityKey = this.props.block.getEntityAt(0);

        // Note that since we tell the parent and have the props re-flow,
        // fields for different types will be cleared out by this method.
        let itemRows = newContent.itemRows.map(function(itemRow) {
            return {
                _id: itemRow._id,
                description: itemRow.description,
                value: itemRow.value,
                isExpense: itemRow.isExpense
            }
        });
        const newData =  {
            _id: newContent._id,
            payee: newContent.payee,
            itemRows: itemRows
        };
        Entity.replaceData(entityKey, newData);
        this.setState(newData);
        this.props.blockProps.forceStateUpdate();
    },

    handlePayeeChange(e) {
        this.state.payee = e.target.value;
        this.handleContentUpdate(this.state);
    },

    handleItemRowDescriptionChange(rowIndex, rawContent) {
        let row = this.initializeAndGetItemRow(rowIndex);
        const contentState = DraftJS.convertFromRaw(rawContent);
        row.description = contentState.getPlainText().trim();

        this.handleContentUpdate(this.state);
    },

    handleItemRowValueChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        // This value is in string format, we need to convert it to be in integer form.
        const floatValue = parseFloat(e.target.value);
        if (isNaN(floatValue)) {
            return e.preventDefault();
        }
        row.value = Math.round(floatValue * 100);
        this.handleContentUpdate(this.state);
    },

    handleItemRowExpenseTypeChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        row.isExpense = e.target.checked;
        this.handleContentUpdate(this.state);
    },

    handleDeleteItemRow(rowIndex) {
        const itemRows = this.state.itemRows;
        itemRows.splice(rowIndex, 1);
        this.handleContentUpdate(this.state);
    },

    handleAddItemRow() {
        const itemRows = this.state.itemRows || [];
        itemRows.push(getEmptyBudgetItemRow());
        this.handleContentUpdate(this.state);
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
        if (index !== false) {
            this.focusEditor(index);
        }
    },

    handleTextBoxBlur() {
        // We're losing focus so switch the outer editor back
        this.props.blockProps.setEditable(true);
    },

    renderCreateBudgetRow(row, index) {
        const stringValue = row.value.toString();
        const renderedValue = stringValue.substr(0, stringValue.length - 2) +
            "." + stringValue.substr(stringValue.length - 2);
        return (
            <tr key={row._id}>
                <td>
                    <div className="budget-description-container"
                         onBlur={this.handleTextBoxBlur}
                         onClick={this.handleTextBoxFocus.bind(this, index)} >
                        <DraftEditor
                            ref={"editor_" + index}
                            text={row.description}
                            readOnly={false}
                            onTextChange={
                               this.handleItemRowDescriptionChange.bind(
                                   this, index
                               )
                            }
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
                </td>
                <td>
                    <input type="number" defaultValue={renderedValue}
                           onChange={this.handleItemRowValueChange.bind(
                                this, index)}
                           onClick={this.handleTextBoxFocus.bind(this, false)}
                           onBlur={this.handleTextBoxBlur}
                    />
                </td>
                <td>
                    <input type="checkbox" defaultChecked={row.isExpense}
                           onChange={this.handleItemRowExpenseTypeChange.bind(
                                this, index)} />
                </td>
            </tr>
        );
    },


    renderCreateBudgetTable() {
        let itemRows = [];
        if (this.state.itemRows !== undefined) {
            itemRows = this.state.itemRows.map(
                this.renderCreateBudgetRow);
        }

        // TODO display a sum, tax + tip (customizable?)
        return (
            <table className="budget-items">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>$</th>
                        <th>Expense?</th>
                    </tr>
                </thead>
                <tbody>
                    {itemRows}
                </tbody>
            </table>
        )
    },

    renderCreateBudget() {
        return (
            <div className="budget-content-editor">
                <input className="budget-payee-editor" type="text"
                       placeholder="Payee" defaultValue={this.state.payee}
                       onClick={this.handleTextBoxFocus.bind(this, false)}
                       onBlur={this.handleTextBoxBlur}
                       onChange={this.handlePayeeChange} />
                {this.renderCreateBudgetTable()}
            </div>
        )
    },


    // Read only view
    renderReadOnlyView() {
        return <RenderedBudgetContent content={this.state}/>
    },

    render() {
        if (this.props.blockProps.readOnly) {
            return this.renderReadOnlyView();
        } else {
            return this.renderCreateBudget();
        }
    }
});