EditContent = React.createClass({
    propTypes: {
        // The current properties of the content
        content: React.PropTypes.object.isRequired,

        // The function to call when the content changes
        updateContent: React.PropTypes.func.isRequired,

        // The function to call when the content is completely deleted
        deleteContent: React.PropTypes.func.isRequired
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
            this.props.content.itemRows[rowIndex] = {
                index: rowIndex,
                source: "",
                description: "",
                value: "000",
                isExpense: true
            };
        }
        return this.props.content.itemRows[rowIndex];
    },

    handleContentUpdate(newContent) {
        let content = {};
        // Only pass in the proper fields depending on the type
        // Note that since we tell the parent and have the props re-flow,
        // fields for different types will be cleared out by this method.
        if (newContent.type == contentTypes.text) {
            content = {
                description: newContent.description
            };
        } else if (newContent.type == contentTypes.budget) {
            content = {
                itemRows: newContent.itemRows
            }
        }
        content._id = newContent._id;
        content.type = newContent.type;
        this.props.updateContent(content);
    },

    handleDescriptionChange(e) {
        this.props.content.description = e.target.value;
        this.handleContentUpdate(this.props.content);
    },

    handleItemRowSourceChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        row.source = e.target.value;
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

    computeNextBudgetRowIndex() {
        if (!this.props.content.itemRows) {
            return 0;
        } else {
            return this.props.content.itemRows.length;
        }
    },

    renderCreateBudgetRow(row) {
        const stringValue = row.value.toString();
        const renderedValue = stringValue.substr(0, stringValue.length - 2) +
            "." + stringValue.substr(stringValue.length - 2);
        return (
            <tr key={row.index}>
                <td>
                    <input type="text" placeholder="Source"
                           defaultValue={row.source}
                           onChange={this.handleItemRowSourceChange.bind(
                                this, row.index)} />
                </td>
                <td>
                    <input type="text" placeholder="Description"
                           defaultValue={row.description}
                           onChange={this.handleItemRowDescriptionChange.bind(
                                this, row.index)} />
                </td>
                <td>
                    <input type="text" defaultValue={renderedValue}
                           onChange={this.handleItemRowValueChange.bind(
                                this, row.index)} />
                </td>
                <td>
                    <input type="checkbox" defaultChecked={row.isExpense}
                           onChange={this.handleItemRowExpenseTypeChange.bind(
                                this, row.index)} />
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
        // Append on the default row
        itemRows.push(this.renderCreateBudgetRow({
            index: this.computeNextBudgetRowIndex(),
            description: '',
            value: "000",
            isExpense: true
        }));

        // TODO display a sum, tax + tip (customizable?)
        return (
            <table className="budget-items">
                <thead>
                    <tr>
                        <th>Source</th>
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

    renderCreateBudgetContent() {
        return (
            <div className="budget-content-editor">
                {this.renderCreateBudgetTable()}
            </div>
        )
    },

    renderCreateTextContent() {
        return (
            <div className="text-content-editor">
                <TextArea placeholder="Description"
                          value={this.props.content.description || ""} rows={4}
                          onChange={this.handleDescriptionChange} />
            </div>
        )
    },

    renderEditor() {
        if (this.props.content.type == contentTypes.text) {
            return this.renderCreateTextContent()
        } else if (this.props.content.type == contentTypes.budget) {
            return this.renderCreateBudgetContent()
        } else {
            console.error("Unknown content type, cannot render editor",
                this.props.content.type);
        }
    },

    renderOptions() {
        return (
            <div className="content-options-menu"
                 onClick={this.props.deleteContent}>
                x
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