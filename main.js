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

// TODO: DOMPurify, conflicts?

const path_list = [];
let last_id;

async function fetchRootFolder() {
    const rootFolder = await (await fetch("/root-folder-4a5e1e4b")).json();

    for (let i = 0; i < rootFolder.length; i++) {
        const item = rootFolder[i];
        if (item.isDirectory) {
            addFolder(item.name, item.path);
        } else if (item.isFile) {
            addImage(item.path);
        }
    }
}

function addFolder(folderName, folderPath) {
    const root = document.getElementById("folder-list");

    const id = uuidv4();

    if (path_list.includes(folderPath)) {
        return;
    }

    path_list.push(folderPath);

    const new_element = DOMPurify.sanitize(
        `<li><button id="${id}" class="border border-secondary my-1 me-3" type="button" data-sg="${folderPath}">${folderName}</button></li>`,
    );

    const last = document.getElementById(last_id);
    if (last) {
        last.insertAdjacentHTML("afterend", new_element);
    } else {
        root.innerHTML += new_element;
    }

    document.getElementById(id).setAttribute("onclick", "fetchFolder(this);");
}

function addImage(path) {
    const imageContainer = document.getElementById("images-container");
    imageContainer.innerHTML += DOMPurify.sanitize(
        `<a href="${path}" target="_blank" rel="noopener noreferrer"><img class="img-fluid m-1 lazy" data-src="" src="https://i.imgur.com/TRj02cJ.jpg" loading="lazy"></a>`,
        { ADD_ATTR: ["target"] },
    );
}

async function fetchFolder(e) {
    last_id = e.id;

    const rootFolder = await (await fetch("/find-4a5e1e4b", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: e.getAttribute("data-sg") }),
    })).json();

    document.getElementById("images-container").replaceChildren();

    for (let i = 0; i < rootFolder.length; i++) {
        const item = rootFolder[i];
        if (item.isDirectory) {
            addFolder(item.name, item.path);
        } else if (item.isFile) {
            addImage(item.path);
        }
    }
}

fetchRootFolder();
