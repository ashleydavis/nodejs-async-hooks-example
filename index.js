const async_hooks = require("async_hooks");
const fs = require("fs");

process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection at:", reason.stack || reason)
});

process.on("uncaughtException", function (err) {
    console.log("uncaughtException: ");
    console.log(err);
});

//
// Helper function to create an async hook callback function.
// I want the same behavior for each hook, but you might want different behavior.
//
function makeAsyncHook(name) {
    console.log(`Creating async hook ${name}\n`);

    return () => {
        fs.writeSync(1, `Invoked async hook "${name}" with args:\n`);  // You can't call 'console.log' in an async hook callback!!
        fs.writeSync(1, JSON.stringify(arguments, null, 4));           // This is because console.log is itself asynchronous!
        fs.writeSync(1, `\n`);
    };
}

//
// Create the async hook.
//
const asyncHook = async_hooks.createHook({ 
    init: makeAsyncHook("init"),  // Wire in async hook callback functions.
    before: makeAsyncHook("before"),
    after: makeAsyncHook("after"), 
    destroy: makeAsyncHook("destroy"), 
    promiseResolve: makeAsyncHook("promiseResolve")
});

//
// Enable the async hook callbacks.
//
asyncHook.enable();

//
// This is possibly the simplest async operation in Node.js.
// This call to setTimeout normally keeps Node.js alive for 10 seconds until the timeout expires.
//
setTimeout(() => { 
    console.log("Goodbye");
}, 10000);

console.log("Just waiting...");

//
// The script ends here, but Node.js doesn't actually exit until all async operations
// have completed. This means Node.js won't exit until our timeout expires.