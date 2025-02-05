// Utility function to check if a specific cookie exists
function hasCookie(name) {
    return document.cookie
        .split("; ")
        .some((cookie) => cookie.startsWith(`${name}=`));
}

let existingDataDiv;
let resumeOutputDiv;
let jobForm;
let existingResumes = [];
let existingData;

// Helper functions for DOM creation
function createButton(text, className, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = className;
    button.onclick = onClick;
    return button;
}

function createMainTopicElement(mainTopic, bulletPoints = []) {
    const mainTopicDiv = document.createElement("div");
    mainTopicDiv.className = "main-topic";
    mainTopicDiv.textContent = mainTopic.name;
    mainTopicDiv.setAttribute("data-id", mainTopic.id);

    // Buttons for main topic
    mainTopicDiv.appendChild(createButton("Create New Bullet Point", "create-bullet-point", () => createBulletPoint(mainTopic.id)));
    mainTopicDiv.appendChild(createButton("Edit Topic", "edit-main-topic", () => editMainTopic(mainTopic.id, mainTopic.name)));
    mainTopicDiv.appendChild(createButton("Delete Topic", "delete-main-topic", () => deleteMainTopic(mainTopic.id)));

    // Add bullet points
    bulletPoints.forEach((point) => mainTopicDiv.appendChild(createBulletPointElement(mainTopic.id, point)));

    return mainTopicDiv;
}

function createBulletPointElement(mainTopicId, bulletPoint) {
    const bulletPointDiv = document.createElement("div");
    bulletPointDiv.className = "bullet-point";

    const span = document.createElement("span");
    span.textContent = bulletPoint.bulletPoint;
    span.setAttribute("data-id", bulletPoint.id);
    bulletPointDiv.appendChild(span);

    bulletPointDiv.appendChild(createButton("Edit", "edit", () => editBulletPoint(mainTopicId, bulletPoint.id, bulletPoint.bulletPoint)));
    bulletPointDiv.appendChild(createButton("Delete", "delete", () => deleteBulletPoint(mainTopicId, bulletPoint.id)));

    return bulletPointDiv;
}

function displayExistingData(data) {
    existingDataDiv.innerHTML = ""; // Clear existing data
    console.log(data);

    for (const [mainTopicName, mainTopicData] of Object.entries(data)) {
        const mainTopic = {
            id: mainTopicData.mainTopicId,
            name: mainTopicName,
        };
        const bulletPointElements = mainTopicData.bulletPoints.map((point) => ({
            id: point.id,
            bulletPoint: point.bulletPoint,
        }));

        const mainTopicDiv = createMainTopicElement(mainTopic, bulletPointElements);
        existingDataDiv.appendChild(mainTopicDiv);
    }
}

// CRUD Operations
async function createMainTopic() {
    const text = prompt("Enter new main topic:");
    if (text) {
        try {
            const response = await fetch("/api/dynamicresume/main-topic", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${App.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (response.ok) {
                const { newMainTopic } = await response.json();
                console.log("Main topic created:", newMainTopic);
                const mainTopicDiv = createMainTopicElement(newMainTopic);
                existingDataDiv.appendChild(mainTopicDiv);
            } else {
                alert("Failed to create main topic.");
            }
        } catch (error) {
            console.error("Error creating main topic:", error);
            alert("An error occurred.");
        }
    }
}

async function createBulletPoint(mainTopicId) {
    const text = prompt("Enter new bullet point:");
    if (text) {
        try {
            const response = await fetch("/api/dynamicresume/bullet-point", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${App.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mainTopicId, text }),
            });

            if (response.ok) {
                const newBulletPoint = await response.json();
                console.log("Bullet point created:", newBulletPoint);
                const mainTopicDiv = document.querySelector(`.main-topic[data-id="${mainTopicId}"]`);
                if (mainTopicDiv) {
                    const bulletPointDiv = createBulletPointElement(mainTopicId, newBulletPoint);
                    mainTopicDiv.appendChild(bulletPointDiv);
                }
            } else {
                alert("Failed to create bullet point.");
            }
        } catch (error) {
            console.error("Error creating bullet point:", error);
            alert("An error occurred.");
        }
    }
}

async function deleteMainTopic(mainTopicId) {
    if (confirm("Are you sure you want to delete this main topic?")) {
        try {
            const response = await fetch("/api/dynamicresume/main-topic", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${App.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mainTopicId }),
            });

            if (response.ok) {
                const mainTopicDiv = document.querySelector(`.main-topic[data-id="${mainTopicId}"]`);
                if (mainTopicDiv) mainTopicDiv.remove();
            } else {
                alert("Failed to delete main topic.");
            }
        } catch (error) {
            console.error("Error deleting main topic:", error);
            alert("An error occurred.");
        }
    }
}

async function editMainTopic(mainTopicId, currentText) {
    const newText = prompt("Edit Main Topic:", currentText);
    if (newText && newText !== currentText) {
        try {
            const response = await fetch("/api/dynamicresume/main-topic", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${App.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mainTopicId, text: newText }),
            });

            if (response.ok) {
                const mainTopicDiv = document.querySelector(`.main-topic[data-id="${mainTopicId}"]`);
                if (mainTopicDiv) mainTopicDiv.firstChild.textContent = newText;
            } else {
                alert("Failed to edit main topic.");
            }
        } catch (error) {
            console.error("Error editing main topic:", error);
            alert("An error occurred.");
        }
    }
}

async function editBulletPoint(mainTopicId, bulletPointId, oldValue) {
    const newValue = prompt("Edit the bullet point:", oldValue);
    if (newValue && newValue !== oldValue) {
        try {
            const response = await fetch("/api/dynamicresume/bullet-point", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${App.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mainTopicId, bulletPointId, text: newValue }),
            });

            if (response.ok) {
                const bulletPointSpan = document.querySelector(`.bullet-point span[data-id="${bulletPointId}"]`);
                if (bulletPointSpan) bulletPointSpan.textContent = newValue;
            } else {
                alert("Failed to edit bullet point.");
            }
        } catch (error) {
            console.error("Error editing bullet point:", error);
            alert("An error occurred.");
        }
    }
}

async function deleteBulletPoint(mainTopicId, bulletPointId) {
    if (confirm("Are you sure you want to delete this bullet point?")) {
        try {
            const response = await fetch("/api/dynamicresume/bullet-point", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${App.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mainTopicId, bulletPointId }),
            });

            if (response.ok) {
                const bulletPointDiv = document.querySelector(`.bullet-point span[data-id="${bulletPointId}"]`).parentElement;
                if (bulletPointDiv) bulletPointDiv.remove();
            } else {
                alert("Failed to delete bullet point.");
            }
        } catch (error) {
            console.error("Error deleting bullet point:", error);
            alert("An error occurred.");
        }
    }
}

// Submit Personal Data
async function submitPersonalData(text) {
    const submitButton = document.getElementById("submitButton");
    const inputText = document.getElementById("inputText");

    try {
        submitButton.style.backgroundColor = "lightblue";
        submitButton.disabled = true;

        const response = await fetch("/api/dynamicresume/data", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${App.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        });

        if (response.ok) {
            inputText.value = "";
            await refreshData();
        } else {
            alert("Failed to submit text.");
        }
    } catch (error) {
        console.error(error);
    } finally {
        submitButton.style.backgroundColor = "";
        submitButton.disabled = false;
    }
}

// Refresh and Initialize
async function refreshData() {
    try {
        const response = await fetch("/api/dynamicresume/data", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${App.accessToken}`,
            },
        });

        if (response.ok) {
            existingData = await response.json();
            displayExistingData(existingData);
        } else {
            console.error("Failed to refresh data.");
        }
    } catch (error) {
        console.error("Error refreshing data:", error);
    }
}

window.addEventListener("load", () => {
    existingDataDiv = document.getElementById("existingData");

    document.getElementById("submissionForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const inputText = document.getElementById("inputText").value;
        await submitPersonalData(inputText);
    });

    window.addEventListener('loggedIn', () => refreshData());
});