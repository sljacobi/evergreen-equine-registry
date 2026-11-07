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
async function() {

    if (!currentUserIsAdmin()) {

        alert(
            "Admin access is required."
        );

        return;
    }


    showSection(
        "adminSection"
    );


    await window.loadAdminPanel();

};


if (adminNavButton) {

    adminNavButton.addEventListener(
        "click",
        window.openAdminPanel
    );
}

// ========================================
// ADMIN DATA
// ========================================

let adminActivityRecords = [];
let adminMemberRecords = [];


// ========================================
// LOAD ADMIN PANEL DATA
// ========================================

window.loadAdminPanel =
async function() {

    if (!currentUserIsAdmin()) {
        return;
    }

    const refreshButton =
        document.getElementById(
            "refreshAdminButton"
        );

    if (refreshButton) {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "Refreshing...";
    }


    await Promise.all([
        loadAdminActivity(),
        loadAdminMembers()
    ]);


    updateAdminSummary();


    if (refreshButton) {

        refreshButton.disabled =
            false;

        refreshButton.textContent =
            "Refresh Admin Data";
    }
};


// ========================================
// LOAD ACTIVITY LOG
// ========================================

async function loadAdminActivity() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("activity_log")
            .select(
                "id, actor_user_id, actor_email, actor_display_name, table_name, action, record_id, old_data, new_data, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Admin Activity Log error:",
            error
        );

        adminActivityRecords = [];

        document.getElementById(
            "adminActivityList"
        ).innerHTML = `
            <p class="admin-error-state">
                Activity Log could not be loaded.
            </p>
        `;

        return;
    }


    adminActivityRecords =
        data || [];


    buildAdminMemberFilter();

    renderAdminActivity();
}


// ========================================
// LOAD MEMBERS
// ========================================

async function loadAdminMembers() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("user_profiles")
            .select(
                "id, display_name, role, created_at"
            )
            .order(
                "display_name",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Admin Member loading error:",
            error
        );

        adminMemberRecords = [];

        document.getElementById(
            "adminMemberList"
        ).innerHTML = `
            <p class="admin-error-state">
                Member information could not be loaded.
            </p>
        `;

        return;
    }


    adminMemberRecords =
        data || [];


    renderAdminMembers();
}

// ========================================
// BUILD MEMBER FILTER
// ========================================

function buildAdminMemberFilter() {

    const memberFilter =
        document.getElementById(
            "activityMemberFilter"
        );


    if (!memberFilter) {
        return;
    }


    const currentValue =
        memberFilter.value;


    const memberNames =
        [...new Set(
            adminActivityRecords
                .map(record =>
                    record.actor_display_name ||
                    record.actor_email
                )
                .filter(Boolean)
        )]
        .sort((a, b) =>
            a.localeCompare(b)
        );


    memberFilter.innerHTML = `
        <option value="">
            All Members
        </option>
    `;


    memberNames.forEach(name => {

        const option =
            document.createElement(
                "option"
            );

        option.value = name;
        option.textContent = name;

        memberFilter.appendChild(
            option
        );
    });


    if (
        memberNames.includes(
            currentValue
        )
    ) {

        memberFilter.value =
            currentValue;
    }
}

// ========================================
// RENDER MEMBERS
// ========================================

function renderAdminMembers() {

    const memberList =
        document.getElementById(
            "adminMemberList"
        );


    if (!memberList) {
        return;
    }


    if (
        adminMemberRecords.length === 0
    ) {

        memberList.innerHTML = `
            <p class="admin-empty-state">
                No KPS members were found.
            </p>
        `;

        return;
    }


    memberList.innerHTML =
        adminMemberRecords
            .map(member => {

                const firstLetter =
                    (
                        member.display_name ||
                        "?"
                    )
                    .charAt(0)
                    .toUpperCase();


                const isAdmin =
                    member.role ===
                    "admin";


                return `
                    <div class="admin-member-entry">

                        <div class="admin-member-avatar">
                            ${firstLetter}
                        </div>

                        <div class="admin-member-info">

                            <strong>
                                ${member.display_name}
                            </strong>

                            <span>
                                KPS account
                            </span>

                        </div>

                        <span
                            class="admin-member-role
                            ${isAdmin
                                ? "admin-member-role-admin"
                                : ""}"
                        >
                            ${member.role}
                        </span>

                    </div>
                `;

            })
            .join("");
}

// ========================================
// ACTIVITY HELPERS
// ========================================

function getAdminActivityActor(
    record
) {

    return (
        record.actor_display_name ||
        record.actor_email ||
        "Unknown Member"
    );
}


function getAdminActivityName(
    record
) {

    const data =
        record.new_data ||
        record.old_data ||
        {};


    if (
        record.table_name ===
        "horses"
    ) {

        return (
            data.registered_name ||
            "Horse Record"
        );
    }


    if (
        record.table_name ===
        "ownership_history"
    ) {

        return (
            data.horse_name ||
            "Ownership Record"
        );
    }


    if (
        record.table_name ===
        "marketplace_archive"
    ) {

        return (
            data.horse_name ||
            "Marketplace Record"
        );
    }


    if (
        record.table_name ===
        "breeding_logs"
    ) {

        return "Breeding Record";
    }


    return "Registry Record";
}


function getAdminActionLabel(
    action
) {

    if (action === "INSERT") {
        return "Added";
    }


    if (action === "UPDATE") {
        return "Updated";
    }


    if (action === "DELETE") {
        return "Deleted";
    }


    return action;
}


function getAdminAreaLabel(
    tableName
) {

    const labels = {

        horses:
            "Horse Registry",

        ownership_history:
            "Ownership History",

        marketplace_archive:
            "Marketplace",

        breeding_logs:
            "Breedings"
    };


    return (
        labels[tableName] ||
        tableName
    );
}


function formatAdminActivityDate(
    value
) {

    if (!value) {
        return "";
    }


    return new Date(
        value
    ).toLocaleString();
}

// ========================================
// RENDER ACTIVITY LOG
// ========================================

function renderAdminActivity() {

    const activityList =
        document.getElementById(
            "adminActivityList"
        );

    const resultsCount =
        document.getElementById(
            "activityResultsCount"
        );


    if (
        !activityList ||
        !resultsCount
    ) {
        return;
    }


    const searchValue =
        document.getElementById(
            "activitySearch"
        )
        .value
        .trim()
        .toLowerCase();


    const memberValue =
        document.getElementById(
            "activityMemberFilter"
        ).value;


    const actionValue =
        document.getElementById(
            "activityActionFilter"
        ).value;


    const tableValue =
        document.getElementById(
            "activityTableFilter"
        ).value;


    const filteredRecords =
        adminActivityRecords
            .filter(record => {

                const actor =
                    getAdminActivityActor(
                        record
                    );


                const itemName =
                    getAdminActivityName(
                        record
                    );


                const searchText =
                    (
                        actor +
                        " " +
                        itemName +
                        " " +
                        record.action +
                        " " +
                        record.table_name
                    )
                    .toLowerCase();


                const matchesSearch =
                    !searchValue ||
                    searchText.includes(
                        searchValue
                    );


                const matchesMember =
                    !memberValue ||
                    actor ===
                        memberValue;


                const matchesAction =
                    !actionValue ||
                    record.action ===
                        actionValue;


                const matchesArea =
                    !tableValue ||
                    record.table_name ===
                        tableValue;


                return (
                    matchesSearch &&
                    matchesMember &&
                    matchesAction &&
                    matchesArea
                );

            });


    resultsCount.textContent =
        filteredRecords.length === 1
            ? "1 activity"
            : filteredRecords.length +
                " activities";


    if (
        filteredRecords.length === 0
    ) {

        activityList.innerHTML = `
            <p class="admin-empty-state">
                No activities match the selected filters.
            </p>
        `;

        return;
    }


    activityList.innerHTML =
        filteredRecords
            .map(record => {

                const actor =
                    getAdminActivityActor(
                        record
                    );


                const itemName =
                    getAdminActivityName(
                        record
                    );


                return `
                    <div class="activity-entry">

                        <div class="activity-entry-header">

                            <div>

                                <div class="activity-title">

                                    <strong class="activity-actor">
                                        ${actor}
                                    </strong>

                                    <span>
                                        ${getAdminActionLabel(
                                            record.action
                                        )}
                                    </span>

                                    <strong>
                                        ${itemName}
                                    </strong>

                                </div>


                                <div class="activity-meta">

                                    <span>
                                        ${getAdminAreaLabel(
                                            record.table_name
                                        )}
                                    </span>

                                    <span>
                                        ${formatAdminActivityDate(
                                            record.created_at
                                        )}
                                    </span>

                                </div>

                            </div>


                            <span
                                class="
                                    activity-action-badge
                                    activity-action-${record.action.toLowerCase()}
                                "
                            >
                                ${record.action}
                            </span>

                        </div>

                    </div>
                `;

            })
            .join("");
}

// ========================================
// ADMIN SUMMARY
// ========================================

function updateAdminSummary() {

    const horseAdds =
        adminActivityRecords
            .filter(record =>
                record.table_name ===
                    "horses" &&
                record.action ===
                    "INSERT"
            )
            .length;


    const updates =
        adminActivityRecords
            .filter(record =>
                record.action ===
                    "UPDATE"
            )
            .length;


    document.getElementById(
        "adminTotalActivity"
    ).textContent =
        adminActivityRecords.length;


    document.getElementById(
        "adminHorseAdds"
    ).textContent =
        horseAdds;


    document.getElementById(
        "adminRecordUpdates"
    ).textContent =
        updates;


    document.getElementById(
        "adminMemberCount"
    ).textContent =
        adminMemberRecords.length;
}

// ========================================
// ADMIN EVENTS
// ========================================

const activitySearch =
    document.getElementById(
        "activitySearch"
    );

const activityMemberFilter =
    document.getElementById(
        "activityMemberFilter"
    );

const activityActionFilter =
    document.getElementById(
        "activityActionFilter"
    );

const activityTableFilter =
    document.getElementById(
        "activityTableFilter"
    );

const refreshAdminButton =
    document.getElementById(
        "refreshAdminButton"
    );


if (activitySearch) {

    activitySearch.addEventListener(
        "input",
        renderAdminActivity
    );
}


if (activityMemberFilter) {

    activityMemberFilter.addEventListener(
        "change",
        renderAdminActivity
    );
}


if (activityActionFilter) {

    activityActionFilter.addEventListener(
        "change",
        renderAdminActivity
    );
}


if (activityTableFilter) {

    activityTableFilter.addEventListener(
        "change",
        renderAdminActivity
    );
}


if (refreshAdminButton) {

    refreshAdminButton.addEventListener(
        "click",
        window.loadAdminPanel
    );
}