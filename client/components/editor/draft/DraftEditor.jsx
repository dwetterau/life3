converter = new DraftMarkup(MarkdownSyntax);
DraftEditor = React.createClass({
    propTypes: {
        text: React.PropTypes.oneOfType([
            React.PropTypes.string, // legacy Markdown format
            React.PropTypes.object // new RawContent format
        ]).isRequired,

        readOnly: React.PropTypes.bool.isRequired,

        onTextChange: React.PropTypes.func.isRequired,

        placeholder: React.PropTypes.string
    },

    getInitialState() {
        // Convert the markdown text to an initial content object
        const editorState = this.getInitialEditorState(this.props.text);
        return {editorState};
    },

    getInitialEditorState(text) {
        let rawContent = text;
        if (typeof(rawContent) == "string") {
            // The legacy conversion flow
            rawContent =  converter.toRawContent(text);
        }
        const blocks = DraftJS.convertFromRaw(rawContent);
        let editorState;
        if (blocks.length) {
            const contentState =
                DraftJS.ContentState.createFromBlockArray(blocks);
            editorState = DraftJS.EditorState.createWithContent(contentState)
        } else {
            editorState = DraftJS.EditorState.createEmpty()
        }
        return editorState;
    },

    onChange(editorState) {
        const contentState = editorState.getCurrentContent();
        const rawContent = DraftJS.convertToRaw(contentState);
        this.props.onTextChange(rawContent);
        this.setState({editorState})
    },

    // Editor buttons
    // Inline styles
    inlineStyleOptions: [
        {label: 'Bold', style: 'BOLD'},
        {label: 'Italic', style: 'ITALIC'},
        {label: 'Underline', style: 'UNDERLINE'},
        {label: 'Code', style: 'CODE'}
    ],

    _handleInlineClick(inlineStyle) {
        this.onChange(DraftJS.RichUtils.toggleInlineStyle(
            this.state.editorState, inlineStyle));
    },

    renderEditorButtons() {
        if (this.props.readOnly) {
            return;
        }
        let currentStyle = this.state.editorState.getCurrentInlineStyle();
        return (
            <div className="draft-editor-buttons">
                {this.inlineStyleOptions.map((styleOptions) => {
                    let className = "-" + styleOptions.label;
                    if (currentStyle.has(styleOptions.style)) {
                        className += " -active"
                    }
                    return (
                        <div key={styleOptions.label}
                             className={className}
                             onClick={this._handleInlineClick.bind(
                                this, styleOptions.style)}>
                            {styleOptions.label}
                        </div>
                    );
                })}
            </div>
        )
    },

    render() {
        const {editorState} = this.state;
        return (
            <div className="draft-editor">
                {this.renderEditorButtons()}
                <DraftJS.Editor
                    editorState={editorState}
                    readOnly={this.props.readOnly}
                    onChange={this.onChange}
                    placeholder={this.props.placeholder} />
            </div>
        );
    }
});
