# simple-track
A simple client side library for creating and firing off analytics events.

## Setup

### npm
```
npm install --save simple-track
```

### script tag
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/simple-track"></script>
```

**Note:** The browser global is `SimpleTrack`

## Usage
1. Create an event generator
```javascript
const appName = '<your-app-name>';
const analyticsApiUrl = '<your-analytics-endpoint-url>';

const eventGenerator = window.SimpleTrack.createEventGenerator({
    appName,
    analyticsApiUrl,
});
```

2. Fire off an event!
```javascript
const eventType = '<your-event-type-or-name>';
const eventData = { foo: 'bar' };

eventGenerator.track(eventType, eventData);
```

**Note:** Providing event data is optional, if not provided it defaults to `null`

## Additional Info
Internally this library utilizes the [Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API) to fire off the event to the analytics endpoint provided from the client.

If the Beacon API is not supported by the client, however, it will fallback to using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

At the end of the day your analytics endpoint service will receive a `POST` request with event as a JSON object of the following shape:
```javascript
/**
* @typedef Event
* @type {object}
* @property {string} appName - The name of the app the events are associated with.
* @property {string} analyticsId - The analytics id of the current session.
* @property {string} type - The event type or name. Anything you want really.
* @property {object|null} data - The data associated with the event. null by default, but otherwise an object with properties of your choosing.
* @property {string} timeString - An ISO formatted string representing when the event was created.
* @property {string} eventId - A unique identifier and generated tied to the event itself.
* @property {number} version - The version of the event schema being used.
*/
{
	"appName": "your-app-name",
	"analyticsId": "66eacd05-6624-4589-9c9e-9ef4f194d07a",
	"type": "your-event-type-or-name",
	"data": {
		"foo": "bar"
    },
    "timeString": "2020-12-30T23:18:34.191Z",
	"eventId": "1ff1d482-079b-4f2b-85ff-5f93d832f951",
	"version": 1
}
```