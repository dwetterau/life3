import DraftJS from "draft-js"

class SearchService {
    constructor(Events, EventsSearchIndex) {
        this.Events = Events;
        this.EventsSearchIndex = EventsSearchIndex;
        this.eventIdToTokens = {};
    }

    start() {
        // Delete the whole index. lol.
        this.EventsSearchIndex.remove({});
        this.eventIdToTokens = {};
        this.Events.find({}).fetch().forEach((event) => {
            this.indexEvent(event)
        });

        // Yay we have an index, now build a Trie!
        this._rebuildTrie();
    }

    static _tokenizeString(string) {
        return string
            .replace(/[^A-Za-z0-9\s]/g,"")
            .replace(/\s{2,}/g, " ")
            .split(/\s+/);
    }

    _insertToken(event, token, priority) {
        token = token.toLowerCase();

        // Update our mapping that we need when updating events.
        if (!this.eventIdToTokens.hasOwnProperty(event._id)) {
            this.eventIdToTokens[event._id] = {}
        }
        this.eventIdToTokens[event._id][token] = true;

        // TODO: Insert each prefix of a token into this and then
        // user the real FT search index on this thing.
        this.EventsSearchIndex.upsert(
            {token: token},
            {$addToSet: {events: {id: event._id,
                                  priority: priority,
                                  date: event.startTime}
                        }
            }
        );
    }

    _insertEvent(event) {
        if (event.hasOwnProperty("title")) {
            const titleTokens = SearchService._tokenizeString(
                event.title.trim());
            titleTokens.forEach((token) => {
                this._insertToken(event, token, 2);
            })
        }


        if (!event.hasOwnProperty("contents") || ! event.contents.length) {
            return;
        }
        let allText = "";
        event.contents.forEach((content) => {
            if (content.type == "text") {
                if (typeof(content.description) == "string") {
                    allText += content.description + " ";
                } else {
                    const contentState = DraftJS.convertFromRaw(
                        content.description);
                    allText += contentState.getPlainText() + " ";
                }
            }
        });
        allText = allText.trim();
        if (allText) {
            // Yay there's some text to insert for this event
            allText = SearchService._tokenizeString(allText);
            // Now insert into our lovely index!
            allText.forEach((token) => {
                this._insertToken(event, token, 1);
            });
        }
    }

    _removeEvent(eventId) {
         // If the event is in our map, delete it.
        if (!this.eventIdToTokens.hasOwnProperty(eventId)) {
            return;
        }
        const oldTokens = Object.keys(this.eventIdToTokens[eventId]);
        this.EventsSearchIndex.update(
            {token: {$in: oldTokens}},
            {$pull: {events: {id: eventId}}}
        );
        delete this.eventIdToTokens[eventId];
    }

    _rebuildTrie() {
        this.trie = new SearchTrie(this.EventsSearchIndex.find({}).fetch());
    }

    indexEvent(event) {
        this._removeEvent(event._id);
        this._insertEvent(event);
        this._rebuildTrie();
    }

    removeEventFromIndex(eventId) {
        this._removeEvent(eventId);
        this._rebuildTrie();
    }

    getEvents(query) {
        const tokens = query
            .replace(/[^A-Za-z0-9\s]/g,"")
            .replace(/\s{2,}/g, " ")
            .split(/\s+/);

        // If there are no valid tokens to search for, return the empty list.
        if (!tokens.length) {
            return [];
        }

        // Get the set of events for each token in the query. Then perform an
        // AND of the ids at the end.
        const validEvents = {};
        tokens.forEach((token) => {
            token = token.toLowerCase();
            let events = this.trie.getEvents(token);
            Object.keys(events).forEach((eventId) => {
                const {priority, date} = events[eventId];
                if (!validEvents.hasOwnProperty(eventId)) {
                    validEvents[eventId] = [];
                }
                validEvents[eventId].push({priority, date});
            })
        });

        const finalEvents = {};
        Object.keys(validEvents).forEach((eventId) => {
            if (validEvents[eventId].length == tokens.length) {
                // We min the priorities together at the end because if any are
                // lower than the others, then the entire qurey must not be at
                // the highest priority level
                let minPriority = 10;
                let maxDate = 0;
                validEvents[eventId].forEach((trieObject) => {
                    const {priority, date} = trieObject;
                    minPriority = Math.min(minPriority, priority);
                    maxDate = Math.max(maxDate, date)
                });
                finalEvents[eventId] = {date: maxDate, priority: minPriority};
            }
        });
        return finalEvents;
    }
}

class SearchTrie {
    constructor(searchIndex) {
        this.root = {};
        this.wordIndex = {};
        searchIndex.forEach((entry) => {
            // An entry has an _id, a token (string), and a list of event ids
            let i = 0;
            let node = this.root;
            const token = entry.token;
            this.wordIndex[token] = true;
            for (; i < token.length; i++) {
                if (!node.hasOwnProperty(token[i])) {
                    node[token[i]] = {}
                }
                node = node[token[i]];
                if (!node.hasOwnProperty("ends")) {
                    node.ends = {}
                }
                entry.events.forEach((indexedEvent) => {
                    const id = indexedEvent.id;
                    if (!node.ends.hasOwnProperty(id)) {
                        node.ends[id] = {priority: 0, date: 0};
                    }
                    node.ends[id].priority = Math.max(
                        node.ends[id].priority,
                        indexedEvent.priority
                    );
                    node.ends[id].date = Math.max(
                        node.ends[id].date,
                        indexedEvent.date
                    );
                });
            }
        });
    }

    getEvents(prefix) {
        let i = 0;
        let node = this.root;
        for (; i < prefix.length; i++) {
            if (!node.hasOwnProperty(prefix[i])) {
                return []
            }
            node = node[prefix[i]];
        }
        return node.ends || {};
    }

    removeTokenByEventId(eventId, token) {
        // Note: untested
        let i = 0;
        let node = this.root;
        for (; i < token.length; i++) {
            node = node[token[i]];
            if (Object.keys(node.ends).length == 1) {
                // Only one word down this path
                if (i == token.length - 1) {
                    // The last character in the word
                    delete this.wordIndex[token];
                }
            }
            delete node.ends[eventId];
        }
    }
}

module.exports = SearchService;