const express = require("express");
const Workspace = require("../models/Workspace");

const getUserWorkspaces = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming `req.user.id` contains the logged-in user's ID from authentication middleware

        // Fetch workspaces owned by the user
        const ownedWorkspaces = await Workspace.find({ owner: userId })
            .sort({ createdAt: 1 }) // Sort by creation time (oldest first)
            .lean();

        // Fetch workspaces shared with the user
        const sharedWorkspaces = await Workspace.find({ "sharedWith.user": userId })
            .sort({ createdAt: 1 }) // Sort by creation time (oldest first)
            .lean();

        // Default workspace: first in `ownedWorkspaces`, if it exists
        const defaultWorkspace = ownedWorkspaces.length > 0 ? ownedWorkspaces[0] : null;

        // Respond with the data
        return res.status(200).json({
            message: "Workspaces fetched successfully",
            defaultWorkspace,
            ownedWorkspaces,
            sharedWorkspaces,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching workspaces",
            error: error.message,
        });
    }
};

module.exports = { getUserWorkspaces };
