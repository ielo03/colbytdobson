import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../../../environment.mjs";

// Configure the API key
const genAI = new GoogleGenerativeAI(env.genai.geminiAPIKey);

// Define the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const post = async (req, res) => {
    const data = req.body;
    const ingredients = data.ingredients || '';
    const drink = data.drink || '';

    console.log(`Ingredients: ${ingredients}, Drink: ${drink}`);

    const cocktails = await generateCocktails(ingredients, drink);

    return res.status(200).json({recipe: cocktails});
};

export default {
    post
}

// Function to generate cocktails
export async function generateCocktails(ingredients, drinkType) {
    let prompt;

    if (ingredients && ingredients.length) {
        prompt = `
Your task is to suggest a cocktail recipe using only the following ingredients: ${ingredients}. Even if it is not possible
to create a drink with the given ingredients or the drink will be disgusting, you are required to make some sort of cocktail. You do not need to use all the ingredients,
    and you cannot use ingredients that weren't listed.
${drinkType !== 'none' ? " Make it as similar as possible to or a variation of " + drinkType + "." : ""}

Format your response to be HTML-friendly with the following structure:

    1. Wrap the cocktail name in an <h3> tag.
    2. Provide a brief description of the cocktail in a <p> tag.${drinkType !== 'none' ? " Include how it will taste compared to a " + drinkType + "." : ""}
    3. List the ingredients using an unordered list (<ul>), with each ingredient in a <li> tag.
    4. Use a <strong> tag for the "Ingredients" and "Instructions" headings.
    5. Provide the instructions as an ordered list (<ol>), with each step in a <li> tag.
    6. Only use the provided ingredients.
`;
    } else {
        prompt = `
${drinkType !== 'none'
            ? "I don't have any specific ingredients on hand, but I'd like to make a " + drinkType +
            ". Please suggest a standard recipe for a " + drinkType +
            " using common ingredients. Assume that all necessary ingredients are available."
            : "Please make a random cocktail for me."}

Format your response to be HTML-friendly with the following structure:

    1. Wrap the cocktail name in an <h3> tag.
    2. Provide a brief description of the cocktail in a <p> tag.
    3. List the ingredients using an unordered list (<ul>), with each ingredient in a <li> tag.
    4. Use a <strong> tag for the "Ingredients" and "Instructions" headings.
    5. Provide the instructions as an ordered list (<ol>), with each step in a <li> tag.
    6. Only use the provided ingredients.
`;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        if (text.startsWith('```html\n')) {
            text = text.substring(8);
        }
        if (text.endsWith('\n```\n')) {
            text = text.substring(0, text.length - 5);
        }
        return text;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}