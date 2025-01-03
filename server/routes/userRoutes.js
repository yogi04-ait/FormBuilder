const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cookieParser = require("cookie-parser");
const Workspace = require("../models/Workspace");
const Form = require("../models/Form");
const Folder = require("../models/Folder");
const getUserWorkspaces = require("../config/Workspace");
const authMiddleware = require('../utils/authMiddleware')
router.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1d";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};



// Workspace

router.post("/workspace", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const ownedWorkspaces = await Workspace.find({ owner: userId })
      .populate({
        path: "folders",
        select: "name childFolders forms", // Ensure childFolders is selected
        populate: {
          path: "childFolders",
          select: "name childFolders forms",
          populate: {
            path: "childFolders",
            select: "name",
          },
        },
      })
      .lean();


    const sharedWorkspaces = await Workspace.find({ "sharedWith.user": userId })
      .populate({
        path: "folders",
        select: "name childFolders forms",
        populate: {
          path: "childFolders",
          select: "name childFolders forms",
          populate: {
            path: "childFolders",
            select: "name",
          },
        },
      })
      .lean();


    res.status(200).json({
      message: "Workspaces fetched successfully",
      ownedWorkspaces,
      sharedWorkspaces,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching workspaces", error: err.message });
  }
});



router.post("/register", async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;
  try {
    // Validate inputs
    if (!username || !email || !password || !confirmpassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing user
    const userWithEmail = await User.findOne({ email });
    if (userWithEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Password confirmation
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    try {
      const personalWorkspace = new Workspace({
        name: `${newUser.username}'s Workspace`,
        type: "personal",
        owner: newUser._id,
        sharedLink: { mode: null, token: null },
        permissions: {
          view: true,
          edit: true,
        },
      });

      await personalWorkspace.save();

      newUser.workspaces.push(personalWorkspace._id);
      await newUser.save();

      // Move success response inside
      const token = generateToken(newUser);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: { id: newUser._id, email: newUser.email },
        workspace: { id: personalWorkspace._id, name: personalWorkspace.name },
      });
    } catch (error) {
      console.error("Error creating workspace:", error.message);
      return res
        .status(500)
        .json({ message: "Error creating user workspace", error: error.message });
    }

  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});





// POST /api/forms
router.post("/api/forms", async (req, res) => {

  try {
    const { title, workspaceId, folderId, elements } = req.body;

    // Validate title
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Form title is required and must be a string." });
    }

    // Validate workspaceId
    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required." });
    }
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    // Validate folderId (if provided)
    let folder = null;
    if (folderId) {
      folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found." });
      }
    }

    // Validate elements
    if (!Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ message: "Elements array is required and cannot be empty." });
    }

    // Check each element structure
    for (const [index, element] of elements.entries()) {
      if (!element.type || !["bubble", "input"].includes(element.type)) {
        return res.status(400).json({
          message: `Element at index ${index} must have a valid type ('bubble' or 'input').`,
        });
      }

      if (element.type === "bubble") {
        if (!element.bubbleContent) {
          return res.status(400).json({
            message: `Bubble element at index ${index} must have bubbleContent.`,
          });
        }
        if (
          (!element.bubbleContent.text && !element.bubbleContent.image) ||
          (element.bubbleContent.text && typeof element.bubbleContent.text !== "string") ||
          (element.bubbleContent.image && typeof element.bubbleContent.image !== "string")
        ) {
          return res.status(400).json({
            message: `Bubble element at index ${index} must have valid text or image.`,
          });
        }
      }

      if (element.type === "input") {
        if (!element.inputField || !element.inputField.type) {
          return res.status(400).json({
            message: `Input element at index ${index} must have a valid inputField type.`,
          });
        }
        if (!["text", "number", "email", "phone", "date", "rating", "button"].includes(element.inputField.type)) {
          return res.status(400).json({
            message: `Input element at index ${index} must have a valid type ('text', 'number', 'email', 'phone', 'date', 'rating', 'button').`,
          });
        }
      }
    }

    const form = new Form({
      title,
      workspaceId,
      folderId,
      elements,
    });

    await form.save();

    res.status(201).json({ message: "Form created successfully.", form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while saving the form.", error: error.message });
  }
});



// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: false,
      secure: "false",
    });

    res
      .status(200)
      .json({
        message: "Login successful",
        user: { id: user._id, email: user.email },
      });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// Logout User
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

router.post('/createFolder', async (req, res) => {
  const { workspaceId, name, parentFolderId } = req.body;


  try {
    if (!workspaceId || !name) {
      return res.status(400).json({ message: "Workspace ID and Folder name are required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    let parentFolder = null;
    if (parentFolderId) {
      parentFolder = await Folder.findById(parentFolderId);
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
      if (String(parentFolder.workspaceId) !== String(workspaceId)) {
        return res.status(400).json({ message: "Parent folder does not belong to the workspace" });
      }
    }

    const newFolder = new Folder({
      name,
      workspaceId,
      parentFolderId: parentFolderId || null,
    });

    await newFolder.save();

    if (parentFolder) {
      parentFolder.childFolders.push(newFolder._id);
      await parentFolder.save();
    } else {
      workspace.folders.push(newFolder._id);
      await workspace.save();
    }

    res.status(201).json({
      message: "Folder created successfully",
      folder: newFolder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while creating the folder", error: error.message });
  }
});

router.delete('/deleteFolder/:folderId', async (req, res) => {
  const { folderId } = req.params;

  try {
    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required" });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const workspace = await Workspace.findById(folder.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Remove folder reference from its parent folder or workspace
    if (folder.parentFolderId) {
      const parentFolder = await Folder.findById(folder.parentFolderId);
      if (parentFolder) {
        parentFolder.childFolders = parentFolder.childFolders.filter(
          (childId) => String(childId) !== String(folderId)
        );
        await parentFolder.save();
      }
    } else {
      workspace.folders = workspace.folders.filter(
        (workspaceFolderId) => String(workspaceFolderId) !== String(folderId)
      );
      await workspace.save();
    }

    // Recursively delete all child folders
    const deleteChildFolders = async (childFolders) => {
      for (const childFolderId of childFolders) {
        const childFolder = await Folder.findById(childFolderId);
        if (childFolder) {
          await deleteChildFolders(childFolder.childFolders); // Recursive call
          await Folder.findByIdAndDelete(childFolderId);
        }
      }
    };

    await deleteChildFolders(folder.childFolders);

    await Folder.findByIdAndDelete(folderId);

    res.status(200).json({
      message: "Folder and all its child folders deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while deleting the folder",
      error: error.message,
    });
  }
});





module.exports = router;
