window.addEventListener("load", function () {
    document.getElementById("save").addEventListener("click", save);
    document.getElementById("cancel").addEventListener("click", cancel);
});

function save() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    
    if (title.length > 0 && content.length > 0) {
        fetch("/createPost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({title, content})
        }).then((result) => {
            if (result.ok) {
                window.location = "/journey";
            } else {
                result.text().then(text => console.log(text));
            }
        }).catch((error) => {
            console.error("Error:", error);
        });
    }
}

function cancel() {
    window.location = "/journey";
}