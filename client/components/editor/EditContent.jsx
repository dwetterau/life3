EditContent = React.createClass({
    propTypes: {
        // The current properties of the content
        content: React.PropTypes.object.isRequired,

        // The function to call when the content changes
        updateContent: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            content: this.props.content
        }
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
        content.type = newContent.type;
        this.props.updateContent(content);
    },

    handleDescriptionChange(e) {
        this.props.content.description = e.target.value;
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

    selectContentType(contentType) {
        this.props.content.type = contentType;
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
                    <input type="text" placeholder="Description"
                           defaultValue={row.description}
                           onChange={this.handleItemRowDescriptionChange.bind(this, row.index)} />
                </td>
                <td>
                    <input type="text" defaultValue={renderedValue}
                           onChange={this.handleItemRowValueChange.bind(this, row.index)} />
                </td>
                <td>
                    <input type="checkbox" defaultChecked={row.isExpense}
                           onChange={this.handleItemRowExpenseTypeChange.bind(this, row.index)} />
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
                {this.renderEditorContentSelector()}
            </div>
        )
    },

    renderCreateTextContent() {
        return (
            <div className="text-content-editor">
                <TextArea placeholder="Description"
                          value={this.props.content.description || ""} rows={4}
                          onChange={this.handleDescriptionChange} />
                {this.renderEditorContentSelector()}
            </div>
        )
    },

    renderEditorContentSelectorTile(type) {
        const className = "editor-selector-tile -" + type + (
                (type == this.props.content.type ? " -selected" : ""));
        return (
            <div key={type} className={className}
                 onClick={this.selectContentType.bind(this, type)}>
                {type[0].toUpperCase() + type.substr(1)}
            </div>
        )
    },

    renderEditorContentSelector() {
        return (
            <div className="editor-selector-container">
                {Object.keys(contentTypes).map(
                    this.renderEditorContentSelectorTile)}
            </div>
        )
    },

    renderEditor() {
        if (!this.props.content || !this.props.content.type) {
            // Render the buttons to select the different types of content
            return this.renderEditorContentSelector()
        } else if (this.props.content.type == contentTypes.text) {
            return this.renderCreateTextContent()
        } else if (this.props.content.type == contentTypes.budget) {
            return this.renderCreateBudgetContent()
        }
    },

    render() {
        return (
            <div className="create-content-container">
                {this.renderEditor()}
            </div>
        );
    }
});