let accessToken = null;
let decodedToken = null;

// Utility function to check if a specific cookie exists
function hasCookie(name) {
    return document.cookie
        .split("; ")
        .some((cookie) => cookie.startsWith(`${name}=`));
}

function decodeToken() {
    if (!accessToken) {
        console.error("No access token to decode.");
        return null;
    }

    try {
        // Split the token into its components
        const parts = accessToken.split(".");
        if (parts.length !== 3) {
            console.error("Invalid token format.");
            return null;
        }

        // Decode the payload (middle part of the token)
        const payload = atob(parts[1]); // Decode Base64
        decodedToken = JSON.parse(payload); // Parse JSON payload
        console.log(decodedToken);
        return decodedToken;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}

let existingDataDiv;
let existingData;

// Function to show the dynamic resume page
async function showPage() {
    try {
        // Hide the login container
        document.getElementById("login-container").style.display = "none";

        document.getElementById("logout-button").style.display =
            "inline-block";

        document.getElementById(
            "welcome-name"
        ).innerText = `Welcome ${decodedToken.name}!`;

        // Show the dynamic resume container
        document.getElementById("dynamic-resume-container").style.display =
            "block";

        await fetchResumes();

        const res = await fetch("/api/dynamicresume/personal-data", {
            method: "GET",
            headers: {
                // Use CustomAuthorization because API Gateway forwards headers to S3, and S3 throws an error if a
                // bearer authorization is included under the standard Authorization header
                CustomAuthorization: `Bearer ${accessToken}`,
            },
        });

        if (res.ok) {
            existingData = await res.json();

            // Update the resume content
            displayExistingData(existingData);
        } else {
            console.error("Failed to fetch dynamic content:", await res.text());
            alert("Failed to load content. Please try again.");
            showLogin();
        }
    } catch (error) {
        console.error("Error loading content:", error);
        alert("An error occurred. Please try again.");
        showLogin();
    }
}

async function createMainTopic() {
    const text = prompt("Enter new main topic:");
    if (text) {
        try {
            const response = await fetch("/api/dynamicresume/main-topic", {
                method: "POST",
                headers: {
                    CustomAuthorization: `Bearer ${accessToken}`, // Pass the token
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (response.ok) {
                const { newMainTopic } = await response.json();
                console.log("Main topic created:", newMainTopic);

                // Update the UI with the new main topic
                const mainTopicDiv = document.createElement("div");
                mainTopicDiv.className = "main-topic";
                mainTopicDiv.textContent = newMainTopic.text;
                mainTopicDiv.setAttribute("data-id", newMainTopic.id); // Store mainTopicId invisibly

                // Create "Create New Bullet Point" button
                const createButton = document.createElement("button");
                createButton.textContent = "Create New Bullet Point";
                createButton.className = "create-bullet-point";
                createButton.onclick = () => createBulletPoint(newMainTopic.id);

                // Create "Edit Main Topic" button
                const editButton = document.createElement("button");
                editButton.textContent = "Edit Topic";
                editButton.className = "edit-main-topic";
                editButton.onclick = () =>
                    editMainTopic(newMainTopic.id, newMainTopic.text);

                // Create "Delete Main Topic" button
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete Topic";
                deleteButton.className = "delete-main-topic";
                deleteButton.onclick = () => deleteMainTopic(newMainTopic.id);

                const space1 = document.createElement("span");
                space1.innerText = " ";
                const space2 = document.createElement("span");
                space2.innerText = " ";
                const space3 = document.createElement("span");
                space3.innerText = " ";

                mainTopicDiv.appendChild(space1);
                mainTopicDiv.appendChild(createButton);
                mainTopicDiv.appendChild(space2);
                mainTopicDiv.appendChild(editButton);
                mainTopicDiv.appendChild(space3);
                mainTopicDiv.appendChild(deleteButton);

                // Append the new main topic to the existing data div
                existingDataDiv.appendChild(mainTopicDiv);
            } else {
                console.error(
                    "Failed to create main topic:",
                    await response.text()
                );
                alert("Failed to create main topic. Please try again.");
            }
        } catch (error) {
            console.error("Error creating main topic:", error);
            alert("An error occurred while creating the main topic.");
        }
    }
}

async function createBulletPoint(mainTopicId) {
    const text = prompt("Enter new bullet point:");
    if (text) {
        try {
            const response = await fetch(
                "/api/dynamicresume/create-bullet-point",
                {
                    method: "POST",
                    headers: {
                        CustomAuthorization: `Bearer ${accessToken}`, // Pass the token
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ mainTopicId, text }),
                }
            );

            if (response.ok) {
                const { newBulletPoint } = await response.json();
                console.log("Bullet point created:", newBulletPoint);

                // Update the UI with the new bullet point
                const mainTopicDiv = document.querySelector(
                    `.main-topic[data-id="${mainTopicId}"]`
                );
                if (mainTopicDiv) {
                    const bulletPointDiv = document.createElement("div");
                    bulletPointDiv.className = "bullet-point";

                    const span = document.createElement("span");
                    span.textContent = newBulletPoint.text;
                    span.setAttribute("data-id", newBulletPoint.id); // Store bulletPointId invisibly

                    const editButton = document.createElement("button");
                    editButton.textContent = "Edit";
                    editButton.className = "edit";
                    editButton.onclick = () =>
                        editBulletPoint(
                            mainTopicId,
                            newBulletPoint.id,
                            newBulletPoint.text
                        );

                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.className = "delete";
                    deleteButton.onclick = () =>
                        deleteBulletPoint(mainTopicId, newBulletPoint.id);

                    bulletPointDiv.appendChild(span);
                    bulletPointDiv.appendChild(editButton);
                    bulletPointDiv.appendChild(deleteButton);

                    mainTopicDiv.appendChild(bulletPointDiv);
                }
            } else {
                console.error(
                    "Failed to create bullet point:",
                    await response.text()
                );
                alert("Failed to create bullet point. Please try again.");
            }
        } catch (error) {
            console.error("Error creating bullet point:", error);
            alert("An error occurred while creating the bullet point.");
        }
    }
}

async function deleteMainTopic(mainTopicId) {
    if (confirm("Are you sure you want to delete this main topic?")) {
        try {
            const response = await fetch("/api/dynamicresume/main-topic", {
                method: "DELETE",
                headers: {
                    CustomAuthorization: `Bearer ${accessToken}`, // Pass the token
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mainTopicId }),
            });

            if (response.ok) {
                // Remove the main topic from the DOM
                const mainTopicDiv = document.querySelector(
                    `.main-topic[data-id="${mainTopicId}"]`
                );
                if (mainTopicDiv) {
                    mainTopicDiv.remove();
                }
            } else {
                console.error(
                    "Failed to delete main topic:",
                    await response.text()
                );
                alert("Failed to delete main topic. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting main topic:", error);
            alert("An error occurred while deleting the main topic.");
        }
    }
}

function displayExistingData(data) {
    existingDataDiv.innerHTML = ""; // Clear existing data

    for (const [mainTopic, details] of Object.entries(data)) {
        const mainTopicDiv = document.createElement("div");
        mainTopicDiv.className = "main-topic";
        mainTopicDiv.textContent = mainTopic;
        mainTopicDiv.setAttribute("data-id", details.mainTopicId); // Store mainTopicId invisibly

        // Create "Create New Bullet Point" button
        const createButton = document.createElement("button");
        createButton.textContent = "Create New Bullet Point";
        createButton.className = "create-bullet-point";
        createButton.onclick = () => createBulletPoint(details.mainTopicId);

        // Create "Edit Main Topic" button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit Topic";
        editButton.className = "edit-main-topic";
        editButton.onclick = () =>
            editMainTopic(details.mainTopicId, mainTopic);

        // Create "Delete Main Topic" button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Topic";
        deleteButton.className = "delete-main-topic";
        deleteButton.onclick = () => deleteMainTopic(details.mainTopicId);

        const space1 = document.createElement("span");
        space1.innerText = " ";
        const space2 = document.createElement("span");
        space2.innerText = " ";
        const space3 = document.createElement("span");
        space3.innerText = " ";

        mainTopicDiv.appendChild(space1);
        mainTopicDiv.appendChild(createButton);
        mainTopicDiv.appendChild(space2);
        mainTopicDiv.appendChild(editButton);
        mainTopicDiv.appendChild(space3);
        mainTopicDiv.appendChild(deleteButton);

        details.bulletPoints.forEach((point) => {
            const bulletPointDiv = document.createElement("div");
            bulletPointDiv.className = "bullet-point";

            const span = document.createElement("span");
            span.textContent = point.bulletPoint;
            span.setAttribute("data-id", point.id); // Store bulletPointId invisibly

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit";
            editButton.onclick = () =>
                editBulletPoint(details.mainTopicId, point.id, point.bulletPoint);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete";
            deleteButton.onclick = () =>
                deleteBulletPoint(details.mainTopicId, point.id);

            bulletPointDiv.appendChild(span);
            bulletPointDiv.appendChild(editButton);
            bulletPointDiv.appendChild(deleteButton);

            mainTopicDiv.appendChild(bulletPointDiv);
        });

        existingDataDiv.appendChild(mainTopicDiv);
    }
}

async function editMainTopic(mainTopicId, currentText) {
    const text = prompt("Edit Main Topic:", currentText); // Ask for new text
    if (text && text !== currentText) {
        try {
            const response = await fetch("/api/dynamicresume/main-topic", {
                method: "PUT",
                headers: {
                    CustomAuthorization: `Bearer ${accessToken}`, // Pass the token
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mainTopicId, text }),
            });

            if (response.ok) {
                // Update the text in the DOM
                const mainTopicDiv = document.querySelector(
                    `.main-topic[data-id="${mainTopicId}"]`
                );
                if (mainTopicDiv) {
                    mainTopicDiv.childNodes[0].textContent = text; // Update the main text
                }
                console.log("Main topic updated successfully.");
            } else {
                console.error(
                    "Failed to update main topic:",
                    await response.text()
                );
                alert("Failed to update main topic. Please try again.");
            }
        } catch (error) {
            console.error("Error updating main topic:", error);
            alert("An error occurred while updating the main topic.");
        }
    }
}

async function editBulletPoint(mainTopicId, bulletPointId, oldValue) {
    const newValue = prompt("Edit the bullet point:", oldValue);
    if (newValue && newValue !== oldValue) {
        try {
            // Send a PUT request to update the bullet point
            const response = await fetch(
                "https://colbytdobson.com/api/dynamicresume/personal-data",
                {
                    method: "PUT",
                    headers: {
                        CustomAuthorization: `Bearer ${accessToken}`, // Pass the token
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ mainTopicId, bulletPointId, newValue }),
                }
            );
            console.log(await response.json());

            if (response.ok) {
                // Update the text in the DOM using bulletPointId
                const bulletPointSpan = document.querySelector(
                    `.bullet-point span[data-id="${bulletPointId}"]`
                );
                if (bulletPointSpan) {
                    bulletPointSpan.textContent = newValue;
                }
            } else {
                alert("Failed to update bullet point.");
            }
        } catch (error) {
            console.error("Error updating bullet point:", error);
            alert("An error occurred while updating the bullet point.");
        }
    }
}

async function deleteBulletPoint(mainTopicId, bulletPointId) {
    console.log(
        `Delete bullet point with mainTopicId: ${mainTopicId} and bulletPointId: ${bulletPointId}`
    );
    if (confirm("Are you sure you want to delete this bullet point?")) {
        // Send a DELETE request
        const response = await fetch(
            "https://colbytdobson.com/api/dynamicresume/personal-data",
            {
                method: "DELETE",
                headers: {
                    CustomAuthorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mainTopicId, bulletPointId }),
            }
        );

        console.log(await response.json());
        if (response.ok) {
            // Locate the bullet point element and remove it
            const bulletPointElement = document.querySelector(
                `.bullet-point span[data-id="${bulletPointId}"]`
            );
            if (bulletPointElement) {
                const bulletPointDiv = bulletPointElement.parentElement;
                const mainTopicDiv = bulletPointDiv.parentElement;

                // Remove the bullet point div
                bulletPointDiv.remove();

                // Check if there are any remaining bullet points under this main topic
                const remainingBulletPoints =
                    mainTopicDiv.querySelectorAll(".bullet-point");
                if (remainingBulletPoints.length === 0) {
                    // If no bullet points remain, remove the main topic div
                    mainTopicDiv.remove();
                }
            }
        } else {
            alert("Failed to delete bullet point.");
        }
    }
}

async function submitPersonalData(text) {
    const submitButton = document.getElementById("submitButton");
    const inputText = document.getElementById("inputText");

    try {
        // Turn the submit button blue while loading
        submitButton.style.backgroundColor = "lightblue";
        submitButton.disabled = true;

        // Make the POST request
        const response = await fetch(
            "https://colbytdobson.com/api/dynamicresume/personal-data",
            {
                method: "POST",
                headers: {
                    CustomAuthorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: text }),
            }
        );

        // Handle the response
        if (response.ok) {
            // Clear the textarea
            inputText.value = "";

            // Call the refreshExistingData function
            // refreshExistingData();
        } else {
            console.error(`Failed to submit data. ${response.statusText}`);
            alert(`Failed to submit text`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        // Reset the button to normal
        submitButton.style.backgroundColor = "";
        submitButton.disabled = false;
    }
}

let existingResumes = [];

async function submitJobListing(jobInputText, resumeTitle) {
    const submitButton = document.getElementById("jobSubmitButton");

    if (!jobInputText || !resumeTitle) {
        alert("Job listing and resume title required to generate resume");
        return;
    }

    if (
        existingData == null ||
        existingData === "" ||
        (Array.isArray(existingData) && existingData.length === 0) ||
        (typeof existingData === "object" &&
            Object.keys(existingData).length === 0)
    ) {
        alert("No resume data to generate resume from");
        return;
    }

    try {
        // Set button to light blue while loading
        submitButton.style.backgroundColor = "lightblue";

        const result = await fetch(
            "https://colbytdobson.com/api/dynamicresume/job-listing",
            {
                method: "POST",
                headers: {
                    CustomAuthorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ jobInputText, resumeTitle }),
            }
        );

        const newResume = await result.json();
        newResume.createdAt = new Date().toISOString();
        console.log(result);
        console.log(newResume);

        if (result.ok) {
            // Clear the text inputs after successful submission
            document.getElementById("jobInputText").value = "";
            document.getElementById("resumeTitle").value = "";

            existingResumes.push(newResume); // Add the new resume to the list

            // Display updated resumes list
            displayExistingResumes();
        }
    } catch (error) {
        console.error(error);
        alert("Ran into an issue generating resume");
        return;
    } finally {
        // Reset the button color
        submitButton.style.backgroundColor = "";
    }
}

async function fetchResumes() {
    try {
        const response = await fetch(
            "https://colbytdobson.com/api/dynamicresume/resume",
            {
                method: "GET",
                headers: {
                    CustomAuthorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const body = await response.json();
        console.log(response);
        console.log(body);

        if (response.ok) {
            existingResumes = body.existingResumes;

            displayExistingResumes();
        }
    } catch (error) {
        console.error("Error retrieving past resumes:", error.message);
        alert("Error retrieving past resumes");
    }
}

function displayExistingResumes() {
    existingResumes = Array.from(existingResumes);

    const resumeOutputDiv = document.getElementById("resumeOutputDiv");
    resumeOutputDiv.innerHTML = ""; // Clear the div

    if (existingResumes.length === 0) {
        const emptyText = document.createElement("p");
        emptyText.innerText =
            "Submit resume information and a job listing to view a custom generated resume here!";
        resumeOutputDiv.appendChild(emptyText);
        return;
    }

    // Display the list of resumes
    console.log(existingResumes);
    existingResumes.forEach((resume) => {
        const resumeItem = document.createElement("div");
        resumeItem.style.display = "flex";
        resumeItem.style.justifyContent = "space-between";
        resumeItem.style.alignItems = "center";
        resumeItem.style.marginBottom = "10px";

        // Title link
        const titleLink = document.createElement("a");
        titleLink.textContent = resume.title;
        titleLink.style.textDecoration = "none";
        titleLink.style.color = "blue";
        titleLink.style.cursor = "pointer";
        titleLink.onclick = () => displayResumeText(resume);

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.marginLeft = "10px";
        deleteButton.onclick = () => deleteResume(resume.id);

        resumeItem.appendChild(titleLink);
        resumeItem.appendChild(deleteButton);
        resumeOutputDiv.appendChild(resumeItem);
    });
}

// Function to display a specific resume text
function displayResumeText(resume) {
    const resumeOutputDiv = document.getElementById("resumeOutputDiv");
    resumeOutputDiv.innerHTML = ""; // Clear the div

    const backButton = document.createElement("button");
    backButton.textContent = "Back";
    backButton.style.marginBottom = "10px";
    backButton.onclick = () => displayExistingResumes();

    const resumeText = document.createElement("div");
    resumeText.textContent = resume.resume;
    resumeText.style.whiteSpace = "pre-wrap";

    resumeOutputDiv.appendChild(backButton);
    resumeOutputDiv.appendChild(resumeText);
}

async function deleteResume(id) {
    try {
        console.log(
            JSON.stringify({
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    CustomAuthorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ id }),
            })
        );
        // Call the API to delete the resume
        const response = await fetch(
            `https://colbytdobson.com/api/dynamicresume/resume`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    CustomAuthorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ id }),
            }
        );

        // Handle the response
        if (response.ok) {
            const result = await response.json();
            console.log("Resume deleted successfully:", result);

            // Find the index of the resume by its id
            const index = existingResumes.findIndex(
                (resume) => resume.id === id
            );
            if (index !== -1) {
                existingResumes.splice(index, 1); // Remove the resume from the array
                displayExistingResumes(); // Update the UI
            } else {
                console.warn(
                    "Resume with the given ID not found in existingResumes."
                );
            }
        } else {
            const error = await response.json();
            console.error("Error deleting resume:", error.error);
            alert(`Failed to delete resume: ${error.error}`);
        }
    } catch (err) {
        console.error("Error calling delete API:", err.message || err);
        alert("An unexpected error occurred while deleting the resume.");
    }
}

// On page load, check authentication and load appropriate view
window.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("submissionForm");
    existingDataDiv = document.getElementById("existingData");

    // Parse and display data
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const inputText = document.getElementById("inputText").value;

        await submitPersonalData(inputText);
    });

    const jobForm = document.getElementById("jobSubmissionForm");
    const resumeOutputDiv = document.getElementById("resumeOutputDiv");

    jobForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const jobInputText = document.getElementById("jobInputText").value;
        const resumeTitle = document.getElementById("resumeTitle").value;

        await submitJobListing(jobInputText, resumeTitle);
    });
});