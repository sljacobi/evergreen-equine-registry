console.log("AUTHJS VERSION 1");


// ========================================
// AUTH ELEMENTS
// ========================================

const authGate =
    document.getElementById(
        "authGate"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const userSessionArea =
    document.getElementById(
        "userSessionArea"
    );

const signedInUserName =
    document.getElementById(
        "signedInUserName"
    );

const signedInUserRole =
    document.getElementById(
        "signedInUserRole"
    );

const adminPanelButton =
    document.getElementById(
        "adminPanelButton"
    );

const signOutButton =
    document.getElementById(
        "signOutButton"
    );


// ========================================
// LOAD KPS USER PROFILE
// ========================================

async function loadSignedInProfile(user) {

    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("user_profiles")
            .select(
                "display_name, role"
            )
            .eq(
                "id",
                user.id
            )
            .single();


    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        return null;
    }


    if (!profile) {
        return null;
    }


    return profile;
}


// ========================================
// DISPLAY AUTHENTICATED WEBSITE
// ========================================

async function showAuthenticatedSite(
    user
) {

    const profile =
        await loadSignedInProfile(
            user
        );


    if (!profile) {

        loginMessage.textContent =
            "Your account does not have access to this registry.";

        await supabaseClient
            .auth
            .signOut();

        return;
    }


    authGate.classList.add(
        "authenticated"
    );


    userSessionArea.style.display =
        "flex";


    signedInUserName.textContent =
        profile.display_name;


    signedInUserRole.textContent =
        profile.role;


    signedInUserRole.classList.toggle(
        "admin-role",
        profile.role === "admin"
    );

if (adminPanelButton) {

    adminPanelButton.style.display =
        profile.role === "admin"
            ? "inline-block"
            : "none";
}

    window.currentKpsUser = {

        id:
            user.id,

        email:
            user.email,

        displayName:
            profile.display_name,

        role:
            profile.role

    };


    loginMessage.textContent = "";


    console.log(
        "KPS user authenticated:",
        window.currentKpsUser
    );
}


// ========================================
// DISPLAY LOGIN SCREEN
// ========================================

function showSignedOutSite() {

    authGate.classList.remove(
        "authenticated"
    );


    userSessionArea.style.display =
        "none";


    signedInUserName.textContent =
        "Signed In";


    signedInUserRole.textContent =
        "Member";


    signedInUserRole.classList.remove(
        "admin-role"
    );

    if (adminPanelButton) {

    adminPanelButton.style.display =
        "none";
}


    window.currentKpsUser =
        null;


    loginPassword.value =
        "";


    loginMessage.textContent =
        "";
}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        loginMessage.textContent =
            "";


        loginButton.disabled =
            true;

        loginButton.textContent =
            "Signing In...";


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


        if (error) {

            console.error(
                "Sign-in error:",
                error
            );


            loginMessage.textContent =
                "The email or password was not accepted.";


            loginButton.disabled =
                false;

            loginButton.textContent =
                "Sign In";

            return;
        }


        if (
            !data ||
            !data.user
        ) {

            loginMessage.textContent =
                "The account could not be loaded.";


            loginButton.disabled =
                false;

            loginButton.textContent =
                "Sign In";

            return;
        }


        await showAuthenticatedSite(
            data.user
        );


        loginButton.disabled =
            false;

        loginButton.textContent =
            "Sign In";

    }
);


// ========================================
// LOGOUT
// ========================================

signOutButton.addEventListener(
    "click",
    async function() {

        signOutButton.disabled =
            true;

        signOutButton.textContent =
            "Signing Out...";


        const { error } =
            await supabaseClient
                .auth
                .signOut();


        signOutButton.disabled =
            false;

        signOutButton.textContent =
            "Sign Out";


        if (error) {

            console.error(
                "Sign-out error:",
                error
            );

            return;
        }


        showSignedOutSite();

    }
);


// ========================================
// RESTORE EXISTING SESSION
// ========================================

async function initializeAuth() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(
            "Session loading error:",
            error
        );

        showSignedOutSite();

        return;
    }


    if (
        data.session &&
        data.session.user
    ) {

        await showAuthenticatedSite(
            data.session.user
        );

    } else {

        showSignedOutSite();

    }

}


// ========================================
// START AUTHENTICATION
// ========================================

initializeAuth();