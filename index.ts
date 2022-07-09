/*
    MIT License

    Copyright (c) 2022 Kovács József Miklós <kovacsjozsef7u@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

import { serve } from "https://deno.land/std@0.147.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.147.0/http/file_server.ts";
import { walk } from "https://deno.land/std@0.147.0/fs/mod.ts";

async function find_dirs(path: string) {
    const dirs = [];
    for await (
        const entry of walk(path, {
            maxDepth: 1,
            includeFiles: false,
        })
    ) {
        dirs.push(entry);
    }
    return dirs;
}

async function find_files(path: string) {
    const files = [];
    for await (
        const entry of walk(path, {
            maxDepth: 1,
            exts: [
                "jpg",
                "png",
                "jxl",
                "webp",
                "gif",
                "avif",
                "apng",
                "jpeg",
                "jif",
                "jfif",
                "jpe",
            ],
            includeDirs: false,
        })
    ) {
        files.push(entry);
    }
    return files;
}

const root_dirs = await find_dirs(".");
const root_files = await find_files(".");

// NOTE: foobar-4a5e1e4b, to prevent conflict
serve(
    async (req) => {
        const pathname = new URL(req.url).pathname;

        if (pathname.startsWith("/root-folder-4a5e1e4b")) {
            const final = root_dirs.concat(root_files);
            return new Response(JSON.stringify(final));
        } else if (pathname.startsWith("/find-4a5e1e4b")) {
            const body = await req.json();

            const dirs = await find_dirs(body.path);
            const files = await find_files(body.path);
            const final = dirs.concat(files);
            return new Response(JSON.stringify(final));
        } else if (pathname.startsWith("/")) {
            return serveDir(req, {
                fsRoot: "./",
                showDirListing: true,
            });
        }

        return new Response();
    },
    { hostname: "127.0.0.1", port: 8112 },
);
