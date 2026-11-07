console.log(
    "ADMINJS VERSION 1"
);


// ========================================
// ADMIN PANEL ACCESS
// ========================================

const adminNavButton =
    document.getElementById(
        "adminPanelButton"
    );


function currentUserIsAdmin() {

    return Boolean(
        window.currentKpsUser &&
        window.currentKpsUser.role ===
            "admin"
    );
}


window.openAdminPanel =
function() {

    if (!currentUserIsAdmin()) {

        alert(
            "Admin access is required."
        );

        return;
    }


    showSection(
        "adminSection"
    );

};


if (adminNavButton) {

    adminNavButton.addEventListener(
        "click",
        window.openAdminPanel
    );
}