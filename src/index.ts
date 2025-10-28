import { Logger } from "./libs/logger";

const server = Bun.serve({
    idleTimeout: 10,
    development: true,
    port: process.env.APP_PORT || 2007,

    routes: {
        "/": () => new Response('Welcome to bun storage server'),

        "/health": () => Response.json({ status: "OK" }, { status: 200 }),

        "/files/:filename": {
            GET: req => {
                const { filename } = req.params;

                return Response.json({
                    filename
                })
            },

            DELETE: req => {
                const { filename } = req.params;

                return Response.json({
                    filename, success: true
                })
            }
        },

        "/files/upload": {
            POST: async req => {
                const formData = await req.formData();
                const file = formData.get('file');

                return Response.json({
                    message: "File uploaded successfully",
                    file
                })
            }
        }
    },

    fetch() {
        return new Response('404!', { status: 404 });
    },

    error(error) {
        Logger.error(new Error('Unhandled server error', { cause: error }));
        return new Response("Something went wrong!", { status: 500 });
    },

});

Logger.success(`🚀 Server running at http://${server.hostname}:${server.port}`);