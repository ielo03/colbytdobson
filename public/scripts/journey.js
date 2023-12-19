window.addEventListener("load", function () {
    loadPosts();
});

function loadPosts() {
    const postContainer = document.getElementById("post-container");
    fetch("/post", {
        method: "GET"
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
    }).then(data => {
        postContainer.innerHTML = "";

        data.forEach((post, index) => {
            const postElement = document.createElement("div");
            postElement.className = "post padding";
            postElement.setAttribute("data-post-id", post._id);

            const author = document.createElement("p");
            author.innerText = "Author: " + post.author;

            const date = document.createElement("p");
            date.innerText = `${new Date(post.date).toLocaleDateString()} at ${new Date(post.date).toLocaleTimeString()}`;

            const title = document.createElement("h3");
            title.innerText = post.title;

            const content = document.createElement("p");
            content.innerText = post.content;

            postElement.appendChild(author);
            postElement.appendChild(date);
            postElement.appendChild(title);
            postElement.appendChild(content);

            postContainer.appendChild(postElement);

            if (index !== data.length - 1) {
                const hr = document.createElement("hr");
                postContainer.appendChild(hr);
            }
        });
    }).catch((error) => {
        console.error("Error:", error);
    });
}

function newPost() {
    window.location = "/createPost";
}