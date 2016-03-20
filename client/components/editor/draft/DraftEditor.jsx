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

    render() {
        const {editorState} = this.state;
        return <DraftJS.Editor
            editorState={editorState}
            readOnly={this.props.readOnly}
            onChange={this.onChange}
            placeholder={this.props.placeholder} />
    }
});
