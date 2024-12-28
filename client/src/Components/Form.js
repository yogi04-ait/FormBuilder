import React, { useState } from "react";
import "./CreateForm.css"; // Optional: Add custom styles for your form creation UI.

const CreateForm = ({ workspaceId, folderId }) => {
    const [formName, setFormName] = useState(""); // Form name input
    const [elements, setElements] = useState([]); // Dynamic form elements

    const addBubble = (type) => {
        const content = prompt(
            type === "text"
                ? "Enter the text for the bubble"
                : "Enter the image link for the bubble"
        );
        if (content) {
            setElements((prev) => [
                ...prev,
                {
                    type: "bubble",
                    order: prev.length + 1,
                    bubbleContent: type === "text" ? { text: content } : { image: content },
                },
            ]);
        }
    };

    const addInput = (inputType) => {
        setElements((prev) => [
            ...prev,
            {
                type: "input",
                order: prev.length + 1,
                inputField: { type: inputType, required: false, placeholder: "" },
            },
        ]);
    };

    const deleteElement = (order) => {
        setElements((prev) => prev.filter((el) => el.order !== order));
    };

    const saveForm = async () => {
        if (!formName) {
            alert("Please enter a form name before saving.");
            return;
        }
        try {
            const response = await fetch("/api/forms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ workspaceId, folderId, title: formName, elements }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Form saved successfully!");
            } else {
                alert(`Error saving form: ${data.message}`);
            }
        } catch (error) {
            console.error("Error saving form:", error);
            alert("An error occurred while saving the form.");
        }
    };

    return (
        <div className="form-creation-container">
            <input
                type="text"
                placeholder="Enter Form Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="form-name-input"
            />
            <div className="sections">
                <div className="bubble-section">
                    <h3>Bubble Section</h3>
                    <button onClick={() => addBubble("text")}>Add Text</button>
                    <button onClick={() => addBubble("image")}>Add Image</button>
                </div>
                <div className="input-section">
                    <h3>Input Section</h3>
                    {["text", "number", "email", "phone", "date", "rating", "button"].map(
                        (type) => (
                            <button key={type} onClick={() => addInput(type)}>
                                Add {type.charAt(0).toUpperCase() + type.slice(1)} Field
                            </button>
                        )
                    )}
                </div>
            </div>
            <div className="form-preview">
                <h3>Form Preview</h3>
                {elements.map((element, index) => (
                    <div key={index} className="form-element">
                        <div>
                            {element.type === "bubble" && element.bubbleContent.text && (
                                <p>{element.bubbleContent.text}</p>
                            )}
                            {element.type === "bubble" && element.bubbleContent.image && (
                                <img src={element.bubbleContent.image} alt="Bubble Element" />
                            )}
                            {element.type === "input" && (
                                <input
                                    type={element.inputField.type}
                                    placeholder={element.inputField.placeholder || "Input Field"}
                                    readOnly
                                />
                            )}
                        </div>
                        <button
                            onClick={() => deleteElement(element.order)}
                            className="delete-button"
                        >
                            ❌
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={saveForm} className="save-form-button">
                Save Form
            </button>
        </div>
    );
};

export default CreateForm;
