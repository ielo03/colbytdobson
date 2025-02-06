document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.getElementById("submit");

  submitButton.addEventListener("click", function () {
    submitButton.value = "Concocting...";
    submitButton.style.backgroundColor = "purple";
    submitButton.disabled = true;

    const ingredients = document.getElementById("ingredients").value;
    const drink = document.getElementById("drink").value;

    const data = {
      ingredients: ingredients,
      drink: drink,
    };

    fetch("http://localhost:8080", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        // Display the response in the recipe div
        const recipeDiv = document.getElementById("recipe");
        recipeDiv.innerHTML = result.recipe;

        // Revert button appearance to normal
        submitButton.value = "Concoct";
        submitButton.style.backgroundColor = "";
        submitButton.disabled = false;
      })
      .catch((error) => {
        console.error("Error:", error);
        const recipeDiv = document.getElementById("recipe");
        recipeDiv.innerHTML = `<p>The cocktail blew up! Try again later.</p>`;

        // Revert button appearance to normal even in case of an error
        submitButton.value = "Concoct";
        submitButton.style.backgroundColor = "";
        submitButton.disabled = false;
      });
  });
});
