# Miscellaneous Notes

Zone.js looks at any point at which the user or data could interact with the app and traces that through even async boundaries, to the point that it knows an action has finished and then notifies the app to re-render.

It can see a button was pressed and a server request was fired and now data was returned from that request and something could have changed, and it notifies the runtime to reconcile any changes.

Zone.js is like if the browser gave you a callback to register that would fire anytime anything happens on the page where the application got to run some code. Maybe a click event handler fired, maybe an HTTP fetch request came back and I executed a few promises and I'm done running that whole stack. Whenever the browser does something in the application, it notifies the callback and says "okay, something's happened, now it's your turn to react to it." 

This is done my monkeypatching the various APIs in the browser where you could react to something. `addEventListener` for DOM elements, `fetch`/`XHTTPRequest`, `setInterval`/`setTimeout`, `Promise.then`, etc. 

But with this approach, you only know that something's changed, not what changed percisely. An app using Zone.js for it's state manegement must do a dirty check on the entire data model every time Zone notifies that it has changed.

Three types of rendering

Details around components and what part re-runs when, but in general

# Dirty Checking

One pass approach. We have the previous data from the last time, while we're doing the update instead of creating a whole new structure to compare to an old structure, we're just going to walk the actual data bindings and compare the data as it exists to the new data as we go.

# vDOM

Goes through the process of pure rendering, creates a new structure each time, and then compares that structure with the previous version of the structure and then patches the diffs. A two pass approach.
