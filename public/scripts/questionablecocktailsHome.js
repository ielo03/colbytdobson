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

    fetch("/api/questionablecocktails/concoct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || result.error || "Unable to concoct a cocktail.");
        }
        return result;
      })
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
        recipeDiv.innerHTML = `<p>The cocktail blew up: ${error.message}</p>`;

        // Revert button appearance to normal even in case of an error
        submitButton.value = "Concoct";
        submitButton.style.backgroundColor = "";
        submitButton.disabled = false;
      });
  });
});
