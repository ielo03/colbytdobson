import {fetchExistingData, newConnection} from "../../utils/dbUtils.mjs";
import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import JSON5 from "json5";

const bedrockClient = new BedrockRuntimeClient({ region: "us-west-2" });

async function get(req, res) {
    try {
        const existingData = await fetchExistingData(req.user?.userId);

        return res.status(200).json(existingData);
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function post(req, res) {
    try {
        // Fetch the user's resume data
        const existingData = await fetchExistingData(req.user?.userId);

        const prompt = promptTemplate({
            existingData: JSON.stringify(existingData),
            text: req.body.text,
        });

        const body = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2048,
            top_k: 250,
            temperature: 1,
            top_p: 0.999,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt,
                        },
                    ],
                },
            ],
        };

        // Construct Bedrock parameters
        const bedrockParams = {
            modelId: env.bedrock.modelId,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(body),
        };

        const command = new InvokeModelCommand(bedrockParams);
        const response = await bedrockClient.send(command);

        if (!response.body) {
            throw new Error("Response body is null or undefined");
        }

        const parsedBody = parseBody(response);
        const insertedData = await processBody(parsedBody, decodedToken.userId);

        return res.status(200).json(insertedData);
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const processBody = async (parsedBody, userId) => {
    const contentItem = parsedBody.content[0]?.text;
    if (!contentItem) {
        throw new Error("Parsed body does not contain valid text content");
    }

    let newData;
    try {
        newData = JSON5.parse(contentItem);
    } catch (error) {
        throw new Error("Failed to parse contentItem as JSON");
    }

    let connection;

    try {
        // Establish database connection
        connection = await newConnection();

        for (const [mainTopic, bulletPoints] of Object.entries(newData)) {
            console.log("Main Topic:", mainTopic);
            await connection.execute(
                `INSERT IGNORE INTO mainTopics (name, userId) VALUES (?, ?);`,
                [mainTopic, String(userId)]
            );
            const [[row]] = await connection.execute(
                `SELECT * FROM mainTopics WHERE name = ? AND userId = ?;`,
                [mainTopic, String(userId)]
            );
            if (row?.id !== null && row?.id !== undefined) {
                for (const bulletPoint of bulletPoints) {
                    console.log("Bullet Point:", bulletPoint);
                    const [result] = await connection.execute(
                        "INSERT IGNORE INTO bulletPoints (mainTopicId, bulletPoint, userId) VALUES (?, ?, ?)",
                        [row.id, bulletPoint, String(userId)]
                    );
                    console.log(result);
                }
            }
        }

        return newData;
    } catch (error) {
        console.error("Error uploading resume data:", error.message || error);
        throw new Error("Failed to upload resume data");
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

const parseBody = (response) => {
    try {
        if (!response.body) {
            throw new Error("Response body is null or undefined");
        }

        // Decode the Uint8Array body to a string
        const decoder = new TextDecoder("utf-8");
        const decodedString = decoder.decode(response.body);

        // Parse the decoded string as JSON
        return JSON.parse(decodedString);
    } catch (error) {
        console.error("Error processing response:", error);
        throw error;
    }
};

const promptTemplate = ({ existingData, text }) =>
    `You are a language model specialized in organizing detailed information for dynamic resume generation tailored to specific job postings. I will provide structured content, along with existing JSON-like data that has already been broken down. Your task is to:
  1.	Identify new, unique main topics in the provided text and cross-check them against the existing JSON-like data to avoid any duplicate information.
  2.	Preserve all important details, including links to portfolios, LinkedIn, GitHub, and other relevant profiles or projects, ensuring they are not lost in the output.
  3.	Break down only the new, unique information into a JSON format, preserving as much detail as possible while ensuring all content is properly categorized and distinct.
  4.	Treat each distinct item (e.g., an individual project, job, skill category, course, or event) as its own main topic, rather than grouping them into broader categories.
  5.	For each main topic, include an array of concise, detailed bullet points summarizing key information. Avoid summarizing excessively or omitting important context. Use as many or as few bullet points as necessary to capture all the information.
  6.	Organize the content in a JSON structure that can be dynamically used to generate tailored resumes. This ensures every detail is categorized for relevance to different job postings.
  7.	Format the output as plain text in the following proper JSON structure:
  {
    “Main Topic 1”: [
    “First detailed bullet point about Main Topic 1”,
    “Second detailed bullet point about Main Topic 1”
    ],
    “Main Topic 2”: [
    “First detailed bullet point about Main Topic 2”,
    “Second detailed bullet point about Main Topic 2”
    ]
  }
    
  Additional Notes for Execution:
  •	Ensure that all important links (e.g., LinkedIn, GitHub, portfolio) and their associated context are preserved across iterations and included in relevant sections.
  •	Avoid introducing duplicate information. Instead, expand on or re-contextualize existing entries when relevant.
  •	The output must be detailed enough to support the creation of job-specific resumes dynamically, ensuring each skill, project, or experience is readily accessible and relevant.
  •	Output only the JSON structure
  • If there are bullet points that would fit well into a main topic already in the existing data, use the same title for the main topic.
    
  Here is the existing JSON data:
  ${existingData}
    
  Here is the new text for analysis:
  ${text}
  `;

export default {
    get,
    post
};