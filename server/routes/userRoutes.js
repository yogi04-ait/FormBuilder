const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cookieParser = require("cookie-parser");
const Workspace = require("../models/Workspace");
const Form = require("../models/Form");
const Folder = require("../models/Folder");
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
      .populate([{
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
      },
      {
        path: "forms",
        select: "title workspaceId"
      }
      ]
      )
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

const authenticateUser = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Delete folder endpoint
router.delete("/deleteFolder/:folderId", authenticateUser, async (req, res) => {
  const { folderId } = req.params;
  const userId = req.user.id;
  try {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const workspace = await Workspace.findById(folder.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const hasPermission =
      workspace.owner.toString() === userId ||
      workspace.permissions?.edit === true;

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Delete folder and its child folders recursively
    const deleteFolderRecursively = async (folderId) => {
      const folder = await Folder.findById(folderId);
      if (folder) {
        // Delete child folders
        for (const childId of folder.childFolders) {
          await deleteFolderRecursively(childId);
        }
        // Delete current folder
        await Folder.findByIdAndDelete(folderId);
      }
    };

    await deleteFolderRecursively(folderId);

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post('/createForm', async (req, res) => {
  const { workspaceId, folderId, title } = req.body;
  try {
    if (!workspaceId || !title) {
      return res.status(400).json({ message: "Workspace ID and Form title are required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    let folder = null

    if (folderId) {
      folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      if (String(folder.workspaceId) !== String(workspaceId)) {
        return res.status(400).json({ message: "Folder does not belong to the workspace" });
      }
    }

    const newForm = new Form({
      title,
      workspaceId,
      folderId: folderId || null,
    });

    await newForm.save();

    if (folder) {
      folder.childFolders.push(newForm._id);
      await folder.save();
    } else {
      workspace.forms.push(newForm._id);
      await workspace.save();
    }

    res.status(201).json({
      message: "Form created successfully",
      form: newForm,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while creating the form", error: error.message });
  }
});

router.delete("/deleteForm/:formId", authenticateUser, async (req, res) => {
  const { formId } = req.params;
  const userId = req.user.id;

  try {
    // Find the form by ID
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if the form is associated with a workspace
    const workspace = await Workspace.findOne({ forms: formId });
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Verify user permissions
    const hasPermission =
      workspace.owner.toString() === userId ||
      workspace.permissions?.edit === true;

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Delete the form
    await Form.findByIdAndDelete(formId);

    // Remove the form reference from the workspace
    await Workspace.findByIdAndUpdate(workspace._id, {
      $pull: { forms: formId },
    });

    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/update-profile", async (req, res) => {
  const { name, email, oldPassword, newPassword } = req.body;
  console.log(req.body)
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const userId = decoded.id;

  try {
    if (!name && !email && !newPassword) {
      return res.status(400).json({ message: "At least one field is update is required" })
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password is required to update the password" })
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect." })
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt)
    }

    if (name) user.username = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully" })

  } catch (error) {
    res.status(500).json({ message: "An error occured while updating the profile" })
  }
})

module.exports = router;
