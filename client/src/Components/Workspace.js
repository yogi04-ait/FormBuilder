import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toggle from "../utils/Toggle";
import style from "../styles/Workspace.module.css";
import { IoMdAdd } from "react-icons/io";
import { FaFolderPlus } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import handleLogout from "../utils/handleLogout";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
const apiUrl = process.env.REACT_APP_URL;

const Workspace = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [formName, setFormName] = useState("");
    const [email, setEmail] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [iseditable, setIsEditaable] = useState(true);
    const [isdrop, setIsDrop] = useState(false);
    const [currentEnviro, setCurrentEnviro] = useState("");
    const [currentdir, setCurrentDir] = useState("");
    const [deleteFolderId, setDeleteFolderID] = useState('');
    const [folderstruct, setfolderstruct] = useState(1);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const response = await fetch(`${apiUrl}/workspace`, {
                    method: "POST",
                    credentials: "include",
                });

                if (response.status === 401) {
                    navigate("/login");
                }

                if (response.ok) {
                    const data = await response.json();
                    const allWorkspaces = await [
                        ...(data.ownedWorkspaces || []),
                        ...(data.sharedWorkspaces || []),
                    ];
                    setWorkspaces(allWorkspaces);
                    setSelectedWorkspace(allWorkspaces[0]);
                    console.log(allWorkspaces[0])

                    setCurrentDir(...data.ownedWorkspaces)

                } else {
                    console.error("Failed to fetch workspaces");
                }
            } catch (err) {
                console.error("An error occurred:", err);
            }
        };
        fetchWorkspaces();
    }, [navigate, folderstruct]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleShareModalToggle = () => {
        setIsShareModalOpen(!isShareModalOpen);
    };

    const handleWorkspaceSelect = (workspace) => {
        setSelectedWorkspace(workspace);
        setIsDropdownOpen(false);
    };


    const handleSettingsRedirect = () => {
        navigate("/settings");
    };

    const handleEmailInvite = () => {
        console.log("Invite sent to:", email);
        setEmail("");
        alert(`Invitation sent to ${email}`);
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/workspace/${selectedWorkspace.id || "default"}`;
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
    };


    const handleCreateCancel = () => {
        setIsCreateModalOpen(false);
        setFolderName("");
    };

    const handleCreateDone = async () => {
        setIsCreateModalOpen(false);

        if (!folderName.trim()) {
            alert("Folder name is required!");
            return;
        }
        try {
            const workspaceId = selectedWorkspace?._id;
            const name = folderName;
            const parentFolderId = selectedFolder?._id;
            const response = await fetch(`${apiUrl}/createFolder`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workspaceId, name, parentFolderId }),
            })

            if (response.ok) {
                const data = await response.json();
                setFolderName("");
                console.error("Error:", data.statusText);
                setfolderstruct(folderstruct + 1);
            } else {
                alert("Failed to create folder")
                console.error("Error:", response);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while creating the folder.");
        }

    };

    const handleCreateForm = async () => {
        setIsCreateModalOpen(false);
        if (!formName.trim()) {
            alert("Form name is required!");
            return;
        }
        try {
            const workspaceId = selectedWorkspace?._id;
            const name = formName;
            const parentFolderId = selectedFolder?._id;
            const response = await fetch(`${apiUrl}/createForm`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workspaceId, name, parentFolderId }),
            })

            if (response.ok) {
                const data = await response.json();
                setFormName("");
                console.error("Error:", data.statusText);
                setfolderstruct(folderstruct + 1);
            } else {
                alert("Failed to create form")
                console.error("Error:", response);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while creating the form.");
        }

    };

    const handleFormCancel = () => {
        setIsFormModalOpen(false);
        setFormName("");
    };

    const handleFormDone = () => {
        handleCreateForm();
        setIsFormModalOpen(false);
        setFormName("");
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setSelectedFolder(null);
    };

    // const deleteForm = async (formId) => {
    //     console.log(folderId);
    //     try {
    //         const response = await fetch(`${apiUrl}/deleteFolder/${folderId}`, {
    //             method: 'DELETE',
    //             credentials: "include",
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         setfolderstruct(folderstruct + 1);
    //         setIsDeleteModalOpen(false);


    //     } catch (error) {
    //         console.error("Error deleting folder:", error);
    //     }
    // };
    
    const deleteFolder = async (folderId) => {
        console.log(folderId);
        try {
            const response = await fetch(`${apiUrl}/deleteFolder/${folderId}`, {
                method: 'DELETE',
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setfolderstruct(folderstruct + 1);
            setIsDeleteModalOpen(false);


        } catch (error) {
            console.error("Error deleting folder:", error);
        }
    };

    if (workspaces.length === 0) return;

    return (
        <div>
            <div className={style.header}>
                <div className={style.workspace}>
                    <div className={style.default} onClick={toggleDropdown}><p>{workspaces[0]?.name}</p>
                        {isDropdownOpen ? (<MdOutlineKeyboardArrowUp />) : (<MdOutlineKeyboardArrowDown />)}
                    </div>
                    {isDropdownOpen && (
                        <div className={style.options}>
                            {workspaces.map((workspace, index) => (
                                index > 0 && (
                                    <div
                                        key={workspace.id}
                                        className={style.dropdownItem}
                                        onClick={() => { handleWorkspaceSelect(workspace) }}
                                    >
                                        {workspace.name}
                                    </div>
                                )
                            ))}

                            <div className={style.dropdownItem} onClick={handleSettingsRedirect} >Setting  </div>
                            <div className={style.dropdownItem} onClick={() => handleLogout(navigate)} >Log out</div>
                        </div>

                    )}
                </div>
                <div className={style.func}>
                    <div className={style.toggle}>
                        <p>Light</p>
                        <Toggle />
                        <p>Dark</p>
                    </div>
                    <button className={style.sharebtn} onClick={handleShareModalToggle}>Share</button>
                </div>
            </div>
            <div className={style.container}>
                <div className={style.folder}>
                    <button onClick={() => setIsCreateModalOpen(true)}>
                        <FaFolderPlus />
                        Create a folder
                    </button>
                    {
                        currentdir?.folders.map(folder => {
                            return (<p key={folder?._id} >
                                {folder.name}
                                <RiDeleteBin6Line width="20px"
                                    className={style.deletefolder}
                                    onClick={() => {
                                        setIsDeleteModalOpen(true);
                                        setDeleteFolderID(folder?._id);
                                    }} />
                            </p>)
                        })
                    }
                </div>
                <div className={style.form}>
                    <button onClick={() => setIsFormModalOpen(true)}>
                        <IoMdAdd className={style.icon} />
                        Create a typebot
                    </button>
                    <div className={style.formType}>
                        <p>This is a form</p>
                        <RiDeleteBin6Line className={style.formDeleteIcon}
 />
                    </div>
                </div>
            </div>

            {isShareModalOpen && (
                <div className={style.modal}>
                    <div className={style.shareModalContent}>
                        <div className={style.closeIcon} onClick={() => setIsShareModalOpen(false)}><IoClose /></div>
                        <div className={style.emailInvite}>
                            <p>Invite by Email</p>
                            <div className={style.perm} >
                                <div onClick={() => setIsDrop(!isdrop)}  >{iseditable ? "Edit" : "View"} <MdOutlineKeyboardArrowDown /></div>
                                {isdrop && (<div className={style.viewEdit}>
                                    <button onClick={() => setIsEditaable(true)}>Edit</button>
                                    <div className={style.divider}></div >
                                    <button onClick={() => setIsEditaable(false)}>View</button>
                                </div>)
                                }
                            </div>

                        </div>
                        <input placeholder="Enter email id" />
                        <button>Send Invite</button>
                        <p className={style.linkInvite}>Invite by link</p>
                        <button>Copy link</button>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className={style.modal}>
                    <div className={style.modalContent}>
                        <h2>Create New Folder</h2>
                        <input
                            type="text"
                            placeholder="Enter folder name"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            className={style.inputField}
                        />
                        <div className={style.modalActions}>
                            <button className={style.doneButton} onClick={handleCreateDone}>
                                Done
                            </button>
                            <button className={style.cancelButton} onClick={handleCreateCancel}>
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className={style.modal}>
                    <div className={style.modalContent}>
                        <h2>Are you sure you want to delete this folder?</h2>
                        <div className={style.modalActions}>
                            <button className={style.doneButton} onClick={() => deleteFolder(deleteFolderId)}>
                                Confirm
                            </button>
                            <button className={style.cancelButton} onClick={handleDeleteCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isFormModalOpen && (
                <div className={style.modal}>
                    <div className={style.modalContent}>

                        <h2>Create a Form</h2>
                        <input
                            type="text"
                            placeholder="Enter form name"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className={style.inputField}
                        />
                        <div className={style.modalActions}>
                            <button className={style.doneButton} onClick={handleFormDone}>
                                Done
                            </button>
                            <button className={style.cancelButton} onClick={handleFormCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workspace;
