import uuid from "node-uuid"
import React from "react";

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

EditBudgetContent = React.createClass({
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
            this.props.content.itemRows[rowIndex] = getEmptyBudgetItemRow();
        }
        return this.props.content.itemRows[rowIndex];
    },

    handleContentUpdate(newContent) {
        if (newContent.type != contentTypes.budget) {
            throw Error("Tried to edit non-budget content as a budget.");
        }

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
        this.props.updateContent({
            _id: newContent._id,
            type: contentTypes.budget,
            payee: newContent.payee,
            itemRows: itemRows
        });
    },

    handlePayeeChange(e) {
        this.props.content.payee = e.target.value;
        this.handleContentUpdate(this.props.content);
    },

    handleItemRowDescriptionChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        row.description = e.target.value;
        this.handleContentUpdate(this.props.content);
    },

    handleItemRowValueChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        // This value is in string format, we need to convert it to be in integer form.
        const floatValue = parseFloat(e.target.value);
        if (isNaN(floatValue)) {
            return e.preventDefault();
        }
        row.value = Math.round(floatValue * 100);
        this.handleContentUpdate(this.props.content);
    },

    handleItemRowExpenseTypeChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        row.isExpense = e.target.checked;
        this.handleContentUpdate(this.props.content);
    },

    handleDeleteItemRow(rowIndex) {
        let itemRows = this.props.content.itemRows;
        itemRows.splice(rowIndex, 1);
        this.handleContentUpdate(this.props.content);
    },

    handleAddItemRow() {
        let itemRows = this.props.content.itemRows || [];
        itemRows.push(getEmptyBudgetItemRow());
        this.handleContentUpdate(this.props.content);
    },

    renderCreateBudgetRow(row, index) {
        const stringValue = row.value.toString();
        const renderedValue = stringValue.substr(0, stringValue.length - 2) +
            "." + stringValue.substr(stringValue.length - 2);
        return (
            <tr key={row._id}>
                <td>
                    <input type="text" placeholder="Description"
                           defaultValue={row.description}
                           onChange={this.handleItemRowDescriptionChange.bind(
                                this, index)} />
                </td>
                <td>
                    <input type="text" defaultValue={renderedValue}
                           onChange={this.handleItemRowValueChange.bind(
                                this, index)} />
                </td>
                <td>
                    <input type="checkbox" defaultChecked={row.isExpense}
                           onChange={this.handleItemRowExpenseTypeChange.bind(
                                this, index)} />
                </td>
                <td>
                    <div className="item-row-delete-button"
                         onClick={this.handleDeleteItemRow.bind(
                            this, index)}>
                        x
                    </div>
                </td>
            </tr>
        );
    },

    renderCreateBudgetTable() {
        let itemRows = [];
        if (this.props.content.itemRows !== undefined) {
            itemRows = this.props.content.itemRows.map(
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

    renderAddItemRowButton() {
        return (
            <div className="budget-add-item-row"
                 onClick={this.handleAddItemRow}>
                Add row
            </div>
        )
    },

    render() {
        return (
            <div className="budget-content-editor">
                <input className="budget-payee-editor" type="text"
                       placeholder="Payee" value={this.props.content.payee}
                       onChange={this.handlePayeeChange} />
                {this.renderCreateBudgetTable()}
                {this.renderAddItemRowButton()}
            </div>
        )
    }
});