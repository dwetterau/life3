import DraftJS from "draft-js"
import Immutable from "immutable";
import React from "react";

DraftEditor = React.createClass({
    propTypes: {
        text: React.PropTypes.oneOfType([
            React.PropTypes.string, // legacy Markdown format
            React.PropTypes.object // new RawContent format
        ]).isRequired,

        readOnly: React.PropTypes.bool.isRequired,

        onTextChange: React.PropTypes.func.isRequired,

        showOptions: React.PropTypes.bool.isRequired,

        initialOptions: React.PropTypes.object,

        placeholder: React.PropTypes.string,

        handleReturn: React.PropTypes.func,

        handleBackspace: React.PropTypes.func
    },

    getInitialState() {
        // Convert the markdown text to an initial content object
        const editorState = this.getInitialEditorState(this.props.text);
        return {
            editorState,
            // State for link editing
            editingLink: false,
            urlValue: '',
            tempReadOnly: false
        };
    },

    findLinkEntities(contentBlock, callback) {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity();
                return entityKey != null && (
                    DraftJS.Entity.get(entityKey).getType() === 'LINK');
            },
            callback
        );
    },

    getInitialEditorState(text) {
        let contentState;

        if (typeof(text) == "string") {
            // The legacy conversion flow
            contentState = DraftJS.ContentState.createFromText(text.trim())
        } else {
            contentState = DraftJS.convertFromRaw(text)
        }

        const decorator = new DraftJS.CompositeDecorator([{
            strategy: this.findLinkEntities,
            component: Link
        }]);

        return DraftJS.EditorState.createWithContent(contentState, decorator);
    },

    initializeEditor(props, editorState) {
        // initialize the editor styles that we want, forcing into them if we
        // have to.
        if (!props.initialOptions) return;
        if (props.initialOptions.hasOwnProperty("inline")) {
            let currentStyle = editorState.getCurrentInlineStyle();
            props.initialOptions["inline"].forEach(function(style) {
                if (!currentStyle.has(style)) {
                    this.handleInlineClick(style, editorState)
                }
            }.bind(this));
        }
        // TODO: Un-disable this. There are issues right now with setting the
        // block type, typing some stuff, and then deleting it all. Seems
        // like the draft.js contributors are aware of the issue.
        if (false && props.initialOptions.hasOwnProperty("block")) {
            const blockType = this.getBlockType(editorState);
            if (blockType != props.initialOptions["block"]) {
                this.handleBlockClick(
                    props.initialOptions["block"],
                    editorState);
            }
        }
    },

    getBlockType(editorState) {
        const selection = editorState.getSelection();
        return editorState.getCurrentContent()
            .getBlockForKey(selection.getStartKey())
            .getType();
    },

    componentDidMount() {
        this.initializeEditor(this.props, this.state.editorState);
    },

    componentWillReceiveProps(newProps) {
        // We don't always want to re-initialize the editor. We make an
        // exception if we're in readOnly mode however.
        if ((!newProps.text && this.props.text) || newProps.readOnly) {
            const editorState = this.getInitialEditorState(newProps.text);
            this.onChange(editorState);
            this.initializeEditor(newProps, editorState);
        }
    },

    // External API
    focus() {
        this.refs.editor.focus();
    },

    blur() {
        this.refs.editor.blur();
    },

    onChange(editorState, otherState) {
        if (!otherState) {
            otherState = {}
        }

        const contentState = editorState.getCurrentContent();
        const rawContent = DraftJS.convertToRaw(contentState);
        this.props.onTextChange(rawContent);

        // Add the editor state to the rest of the state and set it.
        otherState.editorState = editorState;
        this.setState(otherState)
    },

    setEditable(newValue) {
        // Sets an override. Invalid if we're permanently readOnly
        if (this.props.readOnly) {
            return
        }
        this.setState({tempReadOnly: !newValue});
    },

    forceStateUpdate() {
        // Should be called when an underlying component modifies its state to
        // ensure that the encapsulating editor picks up the changes
        this.onChange(this.state.editorState);
    },

    // Editor buttons
    // Inline styles
    inlineStyleOptions: [
        {label: 'B', style: 'BOLD'},
        {label: 'I', style: 'ITALIC'},
        {label: 'U', style: 'UNDERLINE'},
        {label: 'Code', style: 'CODE'}
    ],

    handleInlineClick(inlineStyle, editorState) {
        this.onChange(DraftJS.RichUtils.toggleInlineStyle(
            editorState, inlineStyle));
    },

    renderInlineButtons() {
        let currentStyle = this.state.editorState.getCurrentInlineStyle();
        return (
            <div className="inline-styles">
                {this.inlineStyleOptions.map((styleOptions) => {
                    let className = "-" + styleOptions.label;
                    if (currentStyle.has(styleOptions.style)) {
                        className += " -active"
                    }
                    return (
                        <div key={styleOptions.label}
                             className={className}
                             onClick={this.handleInlineClick.bind(
                                this, styleOptions.style,
                                this.state.editorState)}>
                            {styleOptions.label}
                        </div>
                    );
                })}
            </div>
        );
    },

    // Block styles
    blockStyleOptions: [
        {label: 'H1', style: 'header-one'},
        {label: 'H2', style: 'header-two'},
        {label: 'H3', style: 'header-three'},
        {label: 'Quote', style: 'blockquote'},
        {label: 'UL', style: 'unordered-list-item'},
        {label: 'OL', style: 'ordered-list-item'},
        {label: 'Code Block', style: 'code-block'}
    ],

    handleBlockClick(blockStyle, editorState) {
        this.onChange(DraftJS.RichUtils.toggleBlockType(
            editorState, blockStyle));
    },

    renderBlockButtons() {
        const blockType = this.getBlockType(this.state.editorState);
        return (
            <div className="block-styles">
                {this.blockStyleOptions.map((styleOptions) => {
                    let className = "-" + styleOptions.label;
                    if (blockType == styleOptions.style) {
                        className += " -active"
                    }
                    return (
                        <div key={styleOptions.label}
                             className={className}
                             onClick={this.handleBlockClick.bind(
                                this, styleOptions.style,
                                this.state.editorState)}>
                            {styleOptions.label}
                        </div>
                    );
                })}
            </div>
        );
    },

    // Other custom styles
    promptForLink(createFunc) {
        this.setState({
            editingLink: !this.state.editingLink,
            urlValue: '',
            createFunc: createFunc
        })
    },

    handleUrlChange(e) {
        this.setState({urlValue: e.target.value})
    },

    handleUrlKeyDown(e, createFunc) {
        if (e.which === 13) {
            createFunc();
        }
    },

    handleKeyCommand(command) {
        if (command === 'backspace') {
            if (this.props.handleBackspace !== undefined) {
                this.props.handleBackspace();
            }
        }
        // Allow this to propagate.
        return false;
    },

    createNewLink() {
        const entityKey = DraftJS.Entity.create('LINK', 'IMMUTABLE', {
            url: this.state.urlValue});
        this.onChange(
            DraftJS.RichUtils.toggleLink(
                this.state.editorState,
                this.state.editorState.getSelection(),
                entityKey
            ),
            {
                editingLink: false,
                urlValue: '',
                createFunc: null
            }
        );
    },

    createImageBlock() {
        const entityKey = DraftJS.Entity.create(
            'image',
            'IMMUTABLE',
            {
                src: this.state.urlValue,
                viewMode: "default"
            }
        );

        const editorState = DraftJS.AtomicBlockUtils.insertAtomicBlock(
            this.state.editorState,
            entityKey,
            ' '
        );
        this.onChange(editorState, {
            editingLink: false,
            urlValue: '',
            createFunc: null
        })
    },

    createLocationBlock() {
        const entityKey = DraftJS.Entity.create(
            'location',
            'IMMUTABLE',
            {
                query: this.state.urlValue
            }
        );

        const editorState = DraftJS.AtomicBlockUtils.insertAtomicBlock(
            this.state.editorState,
            entityKey,
            ' '
        );
        this.onChange(editorState, {
            editingLink: false,
            urlValue: '',
            createFunc: null
        })
    },
    
    createChecklistBlock() {
        const entityKey = DraftJS.Entity.create(
            'checklist',
            'IMMUTABLE',
            getEmptyChecklistContent()
        );

        const editorState = DraftJS.AtomicBlockUtils.insertAtomicBlock(
            this.state.editorState,
            entityKey,
            ' '
        );
        this.onChange(editorState);
    },

    createBudgetBlock() {
        const entityKey = DraftJS.Entity.create(
            'budget',
            'IMMUTABLE',
            getEmptyBudgetContent()
        );

        const editorState = DraftJS.AtomicBlockUtils.insertAtomicBlock(
            this.state.editorState,
            entityKey,
            ' '
        );
        this.onChange(editorState);
    },

    renderLinkPrompt() {
        if (!this.state.editingLink) return;
        return (
            <div className="link-editor">
                <input type="text" placeholder="Type link here.."
                       value={this.state.urlValue}
                       onChange={this.handleUrlChange}
                       onKeyDown={this.handleUrlKeyDown.bind(
                            this,
                            this.state.createFunc
                       )}
                />
                <a onClick={this.state.createFunc}>done</a>
            </div>
        )
    },

    renderLinkButton() {
        return (
            <div className="link-button-container">
                <div className="link-button"
                     onClick={this.promptForLink.bind(this,
                        this.createNewLink)} >
                    Link
                </div>
            </div>
        )
    },

    renderImageButton() {
        return (
            <div className="image-button-container">
                <div className="image-button"
                     onClick={this.promptForLink.bind(this,
                        this.createImageBlock)} >
                    Image
                </div>
            </div>
        )
    },
    
    renderLocationButton() {
        return (
            <div className="location-button-container">
                <div className="location-button"
                     onClick={this.promptForLink.bind(this,
                        this.createLocationBlock)} >
                    Place
                </div>
            </div>
        )
    },
    
    renderChecklistButton() {
        return (
            <div className="checklist-button-container">
                <div className="checklist-button"
                     onClick={this.createChecklistBlock} >
                    Checklist
                </div>
            </div>
        )
    },

    renderBudgetButton() {
        return (
            <div className="budget-button-container">
                <div className="budget-button"
                     onClick={this.createBudgetBlock} >
                    Budget
                </div>
            </div>
        )
    },

    renderEditorButtons() {
        if (this.props.readOnly || !this.props.showOptions) {
            return;
        }
        return (
            <div className="draft-editor-buttons">
                {this.renderInlineButtons()}
                {this.renderBlockButtons()}
                {this.renderLinkButton()}
                {this.renderImageButton()}
                {this.renderLocationButton()}
                {this.renderChecklistButton()}
                {this.renderBudgetButton()}
            </div>
        )
    },

    mediaBlockRenderer(block) {
        if (block.getType() === 'atomic') {
            const entityType = DraftJS.Entity.get(block.getEntityAt(0))
                .getType();
            if (entityType == "image") {
                return {
                    component: Media,
                    editable: false,
                    props: {
                        readOnly: this.props.readOnly
                    }
                };
            } else if (entityType == "location") {
                return {
                    component: Location,
                    editable: false,
                    props: {}
                }
            } else if (entityType == "checklist") {
                return {
                    component: Checklist,
                    editable: false,
                    props: {
                        readOnly: this.props.readOnly,
                        setEditable: this.setEditable,
                        forceStateUpdate: this.forceStateUpdate
                    }
                }
            } else if (entityType == "budget") {
                return {
                    component: Budget,
                    editable: false,
                    props: {
                        readOnly: this.props.readOnly,
                        setEditable: this.setEditable,
                        forceStateUpdate: this.forceStateUpdate
                    }
                }
            }
        }
    },

    // TODO: See if we can remove this hack. See draft-js #395
    // Include 'paragraph' as a valid block and updated the unstyled element but
    // keep support for other draft default block types
    extendedBlockRenderMap: DraftJS.DefaultDraftBlockRenderMap.merge(
        Immutable.Map({
            'paragraph': {
                element: 'div'
            }
        })
    ),

    render() {
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'draft-editor';
        var contentState = this.state.editorState.getCurrentContent();
        if (!contentState.hasText()) {
            const type = contentState.getBlockMap().first().getType();
            if (!(type == 'unstyled' || (
                    this.props.initialOptions &&
                    this.props.initialOptions.hasOwnProperty("block") &&
                    type == this.props.initialOptions["block"]))) {
                className += ' -hide-placeHolder';
            }
        }

        const {editorState} = this.state;
        return (
            <div className={className}>
                {this.renderEditorButtons()}
                {this.renderLinkPrompt()}
                <DraftJS.Editor
                    ref="editor"
                    blockRendererFn={this.mediaBlockRenderer}
                    blockRenderMap={this.extendedBlockRenderMap}
                    editorState={editorState}
                    readOnly={this.props.readOnly || this.state.tempReadOnly}
                    onChange={this.onChange}
                    placeholder={this.props.placeholder}
                    handleReturn={this.props.handleReturn}
                    handleKeyCommand={this.handleKeyCommand} />
            </div>
        );
    }
});
