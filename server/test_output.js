console.log("Hello from test script!");
setTimeout(() => {
    console.log("Timeout done");
    process.exit(0);
}, 1000);
