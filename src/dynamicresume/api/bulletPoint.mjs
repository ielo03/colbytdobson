import {newConnection, verifyBulletPointOwnership, verifyMainTopicOwnership} from "../../utils/dbUtils.mjs";

const post = async (req, res) => {
    try {
        // Verify ownership of the main topic
        const ownershipVerified = await verifyMainTopicOwnership(
            req.body.mainTopicName,
            req.user.userId
        );

        if (!ownershipVerified) {
            console.error("Unauthorized: User does not own this main topic");
            return res.status(401).send("Unauthorized");
        }

        // Establish database connection
        const connection = await newConnection();

        // Insert the new bullet point
        const [insertResult] = await connection.execute(
            `
                INSERT IGNORE INTO bulletPoints (mainTopicId, bulletPoint, userId)
                VALUES (?, ?, ?)
            `,
            [ownershipVerified.id, req.body.text, req.user.userId]
        );

        await connection.end();

        if (insertResult.affectedRows === 0) {
            console.error("Failed to create bullet point");
            return res.status(500).send("Database error. Unable to create bullet point");
        }

        console.log("Bullet point created successfully");
        return res.status(200).json({
            id: insertResult.insertId,
            mainTopicId: ownershipVerified.id,
            text: req.body.text,
        });
    } catch (error) {
        console.error("Error creating bullet point:", error.message || error);
        throw new Error("Internal database error");
    }
};

const put = async (req, res) => {
    try {
        // Verify ownership of the bullet point
        const ownershipVerified = await verifyBulletPointOwnership(
            req.body.bulletPointId,
            req.body.mainTopicName,
            req.user.userId
        );

        if (!ownershipVerified) {
            console.error("Unauthorized: User does not own this bullet point");
            return res.status(401).send("Unauthorized");
        }

        // Establish database connection
        const connection = await newConnection();

        // Update the bullet point value
        const [updateResult] = await connection.execute(
            `
            UPDATE bulletPoints
            SET bulletPoint = ?
            WHERE id = ?
          `,
            [req.body.newValue, req.body.bulletPointId]
        );

        await connection.end();

        if (updateResult.affectedRows === 0) {
            console.error("Bullet point not found or could not be updated");
            return res.status(400).send("Update failed");
        }

        console.log("Bullet point updated successfully");
        return res.status(200).json({ message: "Successfully updated bullet point" });
    } catch (error) {
        console.error("Error updating bullet point:", error.message || error);
        throw new Error("Internal database error");
    }
};

const del = async (req, res) => {
    try {
        // Verify ownership of the bullet point
        const ownershipVerified = await verifyBulletPointOwnership(
            req.body.bulletPointId,
            req.body.mainTopicId,
            req.user.userId
        );

        if (!ownershipVerified) {
            console.error("Unauthorized: User does not own this bullet point");
            return res.status(401).send("Unauthorized");
        }

        // Establish database connection
        const connection = await newConnection();

        // Delete the bullet point
        const [deleteResult] = await connection.execute(
            `
            DELETE FROM bulletPoints
            WHERE id = ? AND userId = ?
          `,
            [req.body.bulletPointId, req.user.userId]
        );

        await connection.end();

        if (deleteResult.affectedRows === 0) {
            console.error("Bullet point not found or could not be deleted");
            return res.status(400).send("Delete failed");
        }

        console.log("Bullet point deleted successfully");
        return res.status(200).json({ message: "Successfully deleted bullet point" });
    } catch (error) {
        console.error("Error deleting bullet point:", error.message || error);
        throw new Error("Internal database error");
    }
};

export default {
    post,
    put,
    del,
};
