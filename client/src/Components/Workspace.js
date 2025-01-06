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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const apiUrl = process.env.REACT_APP_URL;

const Workspace = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [formName, setFormName] = useState("");
    const [email, setEmail] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [folderDeleteModal, setFolderDeleteModal] = useState(false)
    const [iseditable, setIsEditable] = useState(true);
    const [isdrop, setIsDrop] = useState(false);
    const [currentdir, setCurrentDir] = useState("");
    const [deleteFolderId, setDeleteFolderID] = useState('');
    const [folderstruct, setfolderstruct] = useState(1);
    const [formDeleteModal, setFormDeleteModal] = useState(false);
    const [deleteFormId, setDeleteFormId] = useState('')

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

    const notifySuccess = (message) => toast.success(message);
    const notifyError = (message) => toast.error(message);



    const handleEmailInvite = () => {
        setEmail("");
        alert(`Invitation sent to ${email}`);
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
                notifySuccess("Folder created successfully");
            } else {
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
            const title = formName;
            const parentFolderId = selectedFolder?._id;
            const response = await fetch(`${apiUrl}/createForm`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workspaceId, parentFolderId, title }),
            })

            if (response.ok) {
                const data = await response.json();
                setFormName("");
                setfolderstruct(folderstruct + 1);
                notifySuccess("Form created successfully");
            } else {
                alert("Failed to create form")
                console.error("Error:", response);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while creating the form.");
        }

    };

    const emailInvite = async()=>{
        try {
            const mode = iseditable ? "edit" : "view";
            const response = await fetch(`${apiUrl}/workspace/emailIvite/`,{
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({mode:mode
                })


            })
        } catch (error) {
            
        }

    }


    const inviteLink = async () => {
        const workspaceId = selectedWorkspace?._id;
        try {
            const mode = iseditable ? "edit" : "view";
            const response = await fetch(`${apiUrl}/workspace/share-link/${workspaceId}`, {
                method: "Post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mode:mode
                }),

            })

            if (!response.ok) {
                throw new Error("Failed to generate link");
            }

            const { link } = await response.json();
            await navigator.clipboard.writeText(link);
        } catch (error) {
            
        }
    }

    const handleFormCancel = () => {
        setIsFormModalOpen(false);
        setFormName("");
    };

    const handleFormDone = () => {
        handleCreateForm();
        setIsFormModalOpen(false);
        setFormName("");
    };



    const deleteForm = async (formId) => {
        setFormDeleteModal(false);
        try {
            const response = await fetch(`${apiUrl}/deleteForm/${deleteFormId}`, {
                method: 'DELETE',
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setfolderstruct(folderstruct + 1);


        } catch (error) {
            console.error("Error deleting folder:", error);
        }
    };

    const deleteFolder = async (folderId) => {
        try {
            const response = await fetch(`${apiUrl}/deleteFolder/${folderId}`, {
                method: 'DELETE',
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setfolderstruct(folderstruct + 1);
            setFolderDeleteModal(false);


        } catch (error) {
            console.error("Error deleting folder:", error);
        }
    };

    if (workspaces.length === 0) return;

    return (
        <div>
            <ToastContainer />
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
                                        setFolderDeleteModal(true);
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
                    {
                        currentdir.forms.map(form => {
                            return <div className={style.formType}>
                                <p>{form.title}</p>
                                <RiDeleteBin6Line className={style.formDeleteIcon} onClick={() => {
                                    setFormDeleteModal(true);
                                    setDeleteFormId(form?._id);
                                }}
                                />
                            </div>
                        })
                    }
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
                                    <button onClick={() => setIsEditable(true)}>Edit</button>
                                    <div className={style.divider}></div >
                                    <button onClick={() => setIsEditable(false)}>View</button>
                                </div>)
                                }
                            </div>

                        </div>
                        <input placeholder="Enter email id" />
                        <button onClick={emailInvite}>Send Invite</button>
                        <p className={style.linkInvite}>Invite by link</p>
                        <button onClick={inviteLink} >Copy link</button>
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

            {folderDeleteModal && (
                <div className={style.modal}>
                    <div className={style.modalContent}>
                        <h2>Are you sure you want to delete this folder?</h2>
                        <div className={style.modalActions}>
                            <button className={style.doneButton} onClick={() => deleteFolder(deleteFolderId)}>
                                Confirm
                            </button>
                            <button className={style.cancelButton} onClick={() => setFolderDeleteModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {formDeleteModal && (
                <div className={style.modal}>
                    <div className={style.modalContent}>
                        <h2>Are you sure you want to delete this form?</h2>
                        <div className={style.modalActions}>
                            <button className={style.doneButton} onClick={() => (deleteForm(deleteFormId))}>
                                Confirm
                            </button>
                            <button className={style.cancelButton} onClick={() => setFormDeleteModal(false)} >
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
