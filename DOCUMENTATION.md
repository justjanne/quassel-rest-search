# Documentation

## API Endpoints

Authentication happens via [HTTP basic auth](https://tools.ietf.org/html/rfc7617)

### api/backlog/

This endpoint returns full backlog for a single quassel buffer, centered around a certain message.

**Parameters**:

| Name     | Type   | Required | Description                                                       |
| -------- | ------ | -------- | ----------------------------------------------------------------- |
| `anchor` | Number | `true`   | Index message for which to retrieve surrounding backlog           |
| `buffer` | Number | `true`   | Chat/Buffer from which messages should be retrieved               |
| `before` | Number | `true`   | Number of messages to load chronologically before the anchorpoint |
| `after`  | Number | `true`   | Number of messages to load chronologically after the anchorpoint  |

### api/search/

This endpoint returns search results across all buffers.

**Parameters**:

| Name      | Type      | Required | Description                                                                    |
| --------- | --------- | -------- | ------------------------------------------------------------------------------ |
| `query`   | String    | `true`   | Query to filter messages                                                       |
| `since`   | Timestamp | `false`  | If set, only show messages received after this timestamp. Format: '1970-01-01' |
| `before`  | Timestamp | `false`  | If set, only show messages received beforethis timestamp. Format: '1970-01-01' |
| `buffer`  | String    | `false`  | If set, only show messages if the name of the chat/buffer they are in matches  |
| `network` | String    | `false`  | If set, only show messages if the name of the network they are in matches      |
| `sender`  | String    | `false`  | If set, only show messages if the nick!user@host of the sender matches         |
| `limit`   | Number    | `true`   | Number of messages to return per buffer                                        |

### api/searchbuffer/

This endpoint returns search results for a single quassel buffer.

**Parameters**:

| Name      | Type      | Required | Description                                                                    |
| --------- | --------- | -------- | ------------------------------------------------------------------------------ |
| `query`   | String    | `true`   | Query to filter messages                                                       |
| `since`   | Timestamp | `false`  | If set, only show messages received after this timestamp. Format: '1970-01-01' |
| `before`  | Timestamp | `false`  | If set, only show messages received beforethis timestamp. Format: '1970-01-01' |
| `buffer`  | Number    | `true`   | Id of the buffer to search in                                                  |
| `sender`  | String    | `false`  | If set, only show messages if the nick!user@host of the sender matches         |
| `offset`  | Number    | `true`   | Number of results to skip (for pagination)                                     |
| `limit`   | Number    | `true`   | Number of messages to return                                                   |
