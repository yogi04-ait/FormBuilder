const apiUrl = process.env.REACT_APP_URL;

const handleLogout = async (navigate) => {
    try {
        const response = await fetch(`${apiUrl}/logout`, {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            console.log("Logout successful");
            localStorage.removeItem("userToken");
            navigate("/login");
        } else {
            console.error("Failed to logout. Try again.");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

export default handleLogout;