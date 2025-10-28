const server = Bun.serve({
    idleTimeout: 10,
    development: true,
    port: process.env.APP_PORT || 2007,

    routes: {
        "/": () => new Response('Bun storage server! sssssss'),

        "/health": () => Response.json({ status: "OK" }, { status: 200 }),
    },

    fetch() {
        return new Response('404!', { status: 404 });
    },

    error(error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    },

});

console.log(`Listening on ${server.url}`);