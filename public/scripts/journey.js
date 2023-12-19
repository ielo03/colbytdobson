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

        data.forEach(post => {
            const postElement = document.createElement("div");
            postElement.className = "post";
            postElement.setAttribute("data-post-id", post._id);

            const title = document.createElement("h3");
            title.innerText = post.title;

            const content = document.createElement("p");
            content.innerText = post.content;

            const author = document.createElement("p");
            author.innerText = "Author: " + post.author;

            const date = document.createElement("p");
            date.innerText = new Date(post.date).toLocaleDateString();

            postElement.appendChild(title);
            postElement.appendChild(content);
            postElement.appendChild(author);
            postElement.appendChild(date);

            postContainer.appendChild(postElement);
        });
    }).catch((error) => {
        console.error("Error:", error);
    });
}

function newPost() {
    window.location = "/createPost";
}