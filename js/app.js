console.log("APPJS VERSION 2");

const horseForm = document.getElementById("horseForm");
const horseList = document.getElementById("horseList");

let ownerFilter = "";
let brandFilter = "";

let editingHorseId = null;

const saleForm =
    document.getElementById("saleForm");

const breedingForm =
    document.getElementById("breedingForm");

const marketplaceList =
    document.getElementById("marketplaceList");

const breedingHistoryList =
    document.getElementById("breedingHistoryList");

const activeFilter =
    document.getElementById("activeFilter");

const ownersList =
    document.getElementById("ownersList");

const brandsList =
    document.getElementById("brandsList");

const historyList =
    document.getElementById("historyList");

const searchBox =
    document.getElementById("searchBox");

    searchBox.addEventListener(
    "input",
    loadHorses
);

saleForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const horseName =
            document.getElementById(
                "saleHorse"
            ).value;

        const seller =
            document.getElementById(
                "seller"
            ).value;

        const buyer =
            document.getElementById(
                "buyer"
            ).value;

        const salePrice =
            document.getElementById(
                "salePrice"
            ).value;

        const saleType =
            document.getElementById(
                "saleType"
            ).value;

        const saleDate =
            document.getElementById(
                "saleDate"
            ).value;

        const saleNotes =
            document.getElementById(
                "saleNotes"
            ).value;

        const { error } =
            await supabaseClient
                .from(
                    "marketplace_archive"
                )
                .insert([
                    {
    horse_name: horseName,
    seller: seller,
    buyer: buyer,
    sale_price: salePrice,
    sale_type: saleType,
    notes: saleNotes,
    sale_date: saleDate || new Date()
}
                ]);

        if (error) {

    console.error(
        "Marketplace Error:",
        error
    );

    alert(
        JSON.stringify(error)
    );

    return;

}

        saleForm.reset();

        loadMarketplace();

    }
);

activeFilter.innerHTML = "";

if (ownerFilter) {
    activeFilter.innerHTML =
        `Filtering by Owner: ${ownerFilter}`;
}

if (brandFilter) {
    activeFilter.innerHTML =
        `Filtering by Brand: ${brandFilter}`;
}

loadHorses();
loadMarketplace();
loadBreedingHistory();
loadHorseDropdown();

horseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const horseName = document.getElementById("horseName").value;
    const breed = document.getElementById("breed").value;
    const gender = document.getElementById("gender").value;
    const age = Number(document.getElementById("age").value);
    const owner =
    document.getElementById("owner").value;

const horseStatus =
    document.getElementById("status").value;

const horseOrigin =
    document.getElementById("origin").value;

const brand =
    document.getElementById("brand").value;

const sire =
    document.getElementById("sire").value;

const dam =
    document.getElementById("dam").value;

const acquisitionMethod =
    document.getElementById(
        "acquisitionMethod"
    ).value;

const breedingStatus =
    document.getElementById(
        "breedingStatus"
    ).value;

  let error;

if (editingHorseId) {

const { data: existingHorse } =
    await supabaseClient
        .from("horses")
        .select("*")
        .eq("id", editingHorseId)
        .single();

const previousOwner =
    existingHorse?.owner_name || "";

    ({ error } = await supabaseClient
        .from("horses")
       .update({
    registered_name: horseName,
    breed: breed,
    gender: gender,
    age: age,

    owner_name: owner,

    horse_status: horseStatus,

    horse_origin: horseOrigin,

    brand: brand,

    sire: sire,

    dam: dam,

    acquisition_method:
        acquisitionMethod,

    breeding_status:
        breedingStatus,

}) 
        .eq("id", editingHorseId));     

if (
    previousOwner &&
    previousOwner !== owner
) {

    console.log(
        "TRANSFER DETECTED",
        previousOwner,
        "->",
        owner
    );

    const { error: historyError } =
    await supabaseClient
        .from("ownership_history")

.insert([
{
    horse_id: editingHorseId,
    horse_name: horseName,
    previous_owner: previousOwner,
    new_owner: owner,
    transfer_date: new Date()
}
]);

console.log("History Error:", historyError);

    console.log(
        "History Error:",
        historyError
    );

}

} else {

    ({ error } = await supabaseClient
        .from("horses")
        .insert([
            {
    registered_name: horseName,
    breed: breed,
    gender: gender,
    age: age,

    owner_name: owner,

    horse_status: horseStatus,

    horse_origin: horseOrigin,

    brand: brand,

    sire: sire,

    dam: dam,

    acquisition_method:
        acquisitionMethod,

    breeding_status:
        breedingStatus,
}
        ]));

}

    if (error) {
        console.error(error);
        alert("Error saving horse.");
        return;
    }

    horseForm.reset();

    editingHorseId = null;

horseForm.querySelector(
    "button[type='submit']"
).textContent = "Add Horse";

loadHorses();

});

async function loadHorses() {

   const { data, error } = await supabaseClient
    .from("horses")
    .select("*")
    .eq("archived", false)
    .order("registered_name");

    if (error) {
        console.error(error);
        return;
    }

    const searchTerm =
    searchBox.value.toLowerCase();

    horseList.innerHTML = "";

    if (data.length === 0) {
        horseList.innerHTML =
            "<p>No horses entered yet.</p>";
        return;
    }

    data
.filter(horse => {

    if (
        ownerFilter &&
        horse.owner_name !== ownerFilter
    ) {
        return false;
    }

    if (
        brandFilter &&
        horse.brand !== brandFilter
    ) {
        return false;
    }

    return (

        (horse.registered_name || "")
            .toLowerCase()
            .includes(searchTerm)

        ||

        (horse.owner_name || "")
            .toLowerCase()
            .includes(searchTerm)

        ||

        (horse.breed || "")
            .toLowerCase()
            .includes(searchTerm)

        ||

        (horse.brand || "")
            .toLowerCase()
            .includes(searchTerm)

    );

})
.forEach(horse => {

horseList.innerHTML += `
<div class="card">

<div class="horse-card-layout">

    ${
        horse.photo_url
        ? `
            <img
                src="${horse.photo_url}"
                class="horse-preview-image"
            >
        `
        : `
            <div
                class="horse-preview-placeholder"
            ></div>
        `
    }

    <div class="horse-card-info">

        <h3
            class="horse-link"
            onclick="viewHorse('${horse.id}')"
        >
            ${horse.registered_name}
        </h3>

        <p>
            <strong>Owner:</strong>
            ${horse.owner_name || "None"}

            |

            <strong>Brand:</strong>
            ${horse.brand || "None"}
        </p>

        <p>
            ${horse.breed || "Unknown"}
            |
            ${horse.gender || "Unknown"}
            |
            Age ${horse.age || "?"}
        </p>

        <p>
            Status:
            ${horse.horse_status || "Active"}
            |
            Origin:
            ${horse.horse_origin || "Unknown"}
        </p>

        <button onclick="editHorse('${horse.id}')">
    Edit
</button>

<button onclick="uploadPhoto('${horse.id}')">
    Upload Photo
</button>

<button onclick="archiveHorse('${horse.id}')">
    Archive
</button>

</div>

</div>
`;

    });

const { data: historyData } =
    await supabaseClient
        .from("ownership_history")
        .select("*")
        .order("transfer_date", {
            ascending: false
        });

historyList.innerHTML = "";

if (!historyData ||
    historyData.length === 0) {

    historyList.innerHTML =
        "<p>No ownership transfers recorded.</p>";

} else {

    historyData.forEach(record => {

historyList.innerHTML += `
    <div class="card">

        <strong>
            ${record.horse_name || "Unknown Horse"}
        </strong>

        <p>
            ${record.previous_owner}
            →
            ${record.new_owner}
        </p>

        <p>
            ${
                record.transfer_date
                    ? new Date(
                        record.transfer_date
                      ).toLocaleDateString()
                    : "Date Unknown"
            }
        </p>

    </div>
`;

    });

}

    document.getElementById("horseCount").textContent =
    data.length;

document.getElementById("activeCount").textContent =
    data.filter(
        horse => horse.archived === false
    ).length;

    const ownerCounts = {};

data.forEach(horse => {

    if (!horse.owner_name) return;

    ownerCounts[horse.owner_name] =
        (ownerCounts[horse.owner_name] || 0) + 1;

});

ownersList.innerHTML = "";

Object.entries(ownerCounts)
    .forEach(([owner,count]) => {

        ownersList.innerHTML += `
    <div class="registry-list-item">

        <button
            class="registry-text-link"
            onclick="filterOwner('${owner}')"
        >
            ${owner}
        </button>

        <span class="registry-count">
            ${count}
        </span>

    </div>
`;
});

const brandCounts = {};

data.forEach(horse => {

    if (!horse.brand) return;

    brandCounts[horse.brand] =
        (brandCounts[horse.brand] || 0) + 1;

});

brandsList.innerHTML = "";

Object.entries(brandCounts)
    .forEach(([brand,count]) => {

        brandsList.innerHTML += `
    <div class="registry-list-item">

        <button
            class="registry-text-link"
            onclick="filterBrand('${brand}')"
        >
            ${brand}
        </button>

        <span class="registry-count">
            ${count}
        </span>

    </div>
`;

    });

}

async function archiveHorse(id) {

    const confirmed =
        confirm("Archive this horse?");

    if (!confirmed) return;

    const { error } = await supabaseClient
        .from("horses")
        .update({
            archived: true
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Failed to archive horse.");
        return;
    }

    loadHorses();
    loadHorseDropdown();

}

async function editHorse(id) {

    const { data, error } =
        await supabaseClient
            .from("horses")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {
        console.error(error);
        return;
    }

    editingHorseId = id;

    document.getElementById("horseName").value =
        data.registered_name || "";

    document.getElementById("breed").value =
        data.breed || "";

    document.getElementById("gender").value =
        data.gender || "";

    document.getElementById("age").value =
        data.age || "";

    document.getElementById("owner").value =
        data.owner_name || "";

    document.getElementById("status").value =
        data.horse_status || "Active";

    document.getElementById("origin").value =
        data.horse_origin || "Wild Caught";

    document.getElementById("brand").value =
        data.brand || "";

    horseForm.querySelector(
        "button[type='submit']"
    ).textContent =
        "Save Changes";

}

async function loadHorseDropdown() {

    const { data } =
        await supabaseClient
            .from("horses")
            .select("*")
            .eq("archived", false)
            .order("registered_name");

    const saleHorse =
    document.getElementById(
        "saleHorse"
    );

const breedingSire =
    document.getElementById(
        "breedingSire"
    );

const breedingDam =
    document.getElementById(
        "breedingDam"
    );

const breedingFoal =
    document.getElementById(
        "breedingFoal"
    );

saleHorse.innerHTML =
    '<option>Select Horse</option>';

breedingSire.innerHTML =
    '<option>Select Sire</option>';

breedingDam.innerHTML =
    '<option>Select Dam</option>';

breedingFoal.innerHTML =
    '<option>Select Foal</option>';

data.forEach(horse => {

    saleHorse.innerHTML += `
        <option value="${horse.id}">
            ${horse.registered_name}
        </option>
    `;

    breedingSire.innerHTML += `
        <option value="${horse.id}">
            ${horse.registered_name}
        </option>
    `;

    breedingDam.innerHTML += `
        <option value="${horse.id}">
            ${horse.registered_name}
        </option>
    `;

    breedingFoal.innerHTML += `
        <option value="${horse.id}">
            ${horse.registered_name}
        </option>
    `;

});

}

window.filterOwner = function(owner) {

    ownerFilter = owner;

    loadHorses();

}

window.filterBrand = function(brand) {

    brandFilter = brand;

    loadHorses();

}

window.clearFilters = function() {

    ownerFilter = "";

    brandFilter = "";

    loadHorses();

}

async function loadMarketplace() {

    const { data } =
        await supabaseClient
            .from(
                "marketplace_archive"
            )
            .select("*")
            .order(
                "sale_date",
                {
                    ascending: false
                }
            );

    marketplaceList.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        marketplaceList.innerHTML =
            "<p>No sales recorded.</p>";

        return;

    }

    data.forEach(sale => {

        marketplaceList.innerHTML += `
            <div class="card">

                <strong>
                    ${sale.horse_name}
                </strong>

                <p>
                    ${sale.seller}
                    →
                    ${sale.buyer}
                </p>

                <p>
    ${sale.sale_type}
</p>

<p>
    $${sale.sale_price}
</p>

<p>
    ${
        sale.sale_date
        ? new Date(
            sale.sale_date
          ).toLocaleDateString()
        : ""
    }
</p>

<p>
    ${sale.notes || ""}
</p>

            </div>
        `;

    });

}

async function loadMarketplace() {

    const { data } =
        await supabaseClient
            .from(
                "marketplace_archive"
            )
            .select("*")
            .order(
                "sale_date",
                {
                    ascending: false
                }
            );

    marketplaceList.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        marketplaceList.innerHTML =
            "<p>No sales recorded.</p>";

        return;

    }

    data.forEach(sale => {

        marketplaceList.innerHTML += `
            <div class="card">

                <strong>
                    ${sale.horse_name}
                </strong>

                <p>
                    ${sale.seller}
                    →
                    ${sale.buyer}
                </p>

                <p>
                    ${sale.sale_type}
                </p>

                <p>
                    $${sale.sale_price}
                </p>

                <p>
                    ${
                        sale.sale_date
                        ? new Date(
                            sale.sale_date
                          ).toLocaleDateString()
                        : ""
                    }
                </p>

                <p>
                    ${sale.notes || ""}
                </p>

            </div>
        `;

    });

}

async function loadBreedingHistory() {

    const { data: breedingData } =
        await supabaseClient
            .from("breeding_logs")
            .select("*")
            .order(
                "breeding_date",
                {
                    ascending: false
                }
            );

    const { data: horses } =
        await supabaseClient
            .from("horses")
            .select("*");

    breedingHistoryList.innerHTML =
        "";

    if (
        !breedingData ||
        breedingData.length === 0
    ) {

        breedingHistoryList.innerHTML =
            "<p>No breeding records found.</p>";

        return;

    }

    breedingData.forEach(record => {

        const sire =
            horses.find(
                horse =>
                    horse.id ===
                    record.sire_id
            );

        const dam =
            horses.find(
                horse =>
                    horse.id ===
                    record.dam_id
            );

        const foal =
            horses.find(
                horse =>
                    horse.id ===
                    record.foal_id
            );

        breedingHistoryList.innerHTML += `
            <div class="card">

                <p>
                    <strong>Sire:</strong>
                    ${
                        sire
                        ? sire.registered_name
                        : "Unknown"
                    }
                </p>

                <p>
                    <strong>Dam:</strong>
                    ${
                        dam
                        ? dam.registered_name
                        : "Unknown"
                    }
                </p>

                <p>
                    <strong>Foal:</strong>
                    ${
                        foal
                        ? foal.registered_name
                        : "Pending"
                    }
                </p>

                <p>
                    <strong>Status:</strong>
                    ${record.status}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${
                        new Date(
                            record.breeding_date
                        ).toLocaleDateString()
                    }
                </p>

                <p>
                    <strong>Notes:</strong>
                    ${
                        record.notes ||
                        "None"
                    }
                </p>

                <button>
                    Edit
                </button>

            </div>
        `;

    });

}

window.viewHorse =
async function(id) {

    const { data } =
        await supabaseClient
            .from("horses")
            .select("*")
            .eq("id", id)
            .single();

    const profile =
        document.getElementById(
            "horseProfile"
        );

    const content =
        document.getElementById(
            "horseProfileContent"
        );

    profile.style.display =
        "block";

    // Hide every main website section
const mainSections = [
    "dashboardSection",
    "registrySection",
    "breedingsSection",
    "pedigreesSection",
    "marketplaceSection",
    "brandsSection",
    "guideSection"
];

mainSections.forEach(sectionId => {

    const section =
        document.getElementById(sectionId);

    if (section) {
        section.style.display = "none";
    }

});

// Show only the horse profile
profile.style.display = "block";

// Move back to the top of the page
window.scrollTo({
    top: 0,
    behavior: "smooth"
});

    const { data: ownershipHistory } =
    await supabaseClient
        .from("ownership_history")
        .select("*")
        .eq(
            "horse_name",
            data.registered_name
        );

const { data: marketplaceHistory } =
    await supabaseClient
        .from("marketplace_archive")
        .select("*")
        .eq(
            "horse_name",
            data.registered_name
        );

const { data: breedingHistory } =
    await supabaseClient
        .from("breeding_logs")
        .select("*")
        .or(
            `sire_id.eq.${id},dam_id.eq.${id},foal_id.eq.${id}`
        );

const { data: offspringLogs } =
    await supabaseClient
        .from("breeding_logs")
        .select("*")
        .or(
            `sire_id.eq.${id},dam_id.eq.${id}`
        );

        content.innerHTML = `

<h2 class="profile-title">
    ${data.registered_name}
</h2>

${
    data.photo_url
    ? `

     <div class="profile-photo-frame">

        <img
    src="${data.photo_url}"
    alt="${data.registered_name}"
    style="
    max-width:800px;
    max-height:600px;
    width:auto;
    height:auto;
    display:block;
    margin:20px auto;
    border-radius:12px;
                "
            >

        </div>
    `
    : `
        <p
            style="
                text-align:center;
                color:#999;
                margin:20px 0;
            "
        >
            No horse photo uploaded.
        </p>
    `
}

    <h3 class="profile-section-title">
    Horse Information
</h3>

        <p>
           Breed:
           ${data.breed || "Unknown"}
        </p>

        <p>
            Gender:
            ${data.gender || "Unknown"}
        </p>

        <p>
            Age:
            ${data.age || "Unknown"}
        </p>

        <p>
            Owner:
            ${data.owner_name || "None"}
        </p>

        <p>
            Brand:
            ${data.brand || "None"}
        </p>

        <p>
    Breeding Status:
    ${data.breeding_status || "Not Recorded"}
</p>

        <p>
            Origin:
            ${data.horse_origin}
        </p>

        <p>
    Acquisition Method:
    ${data.acquisition_method || "Not Recorded"}
</p>

<h3 class="profile-section-title">
    Family
</h3>

<p>
    Sire:

    <span
        class="horse-link"
        onclick="openHorseByName('${data.sire}')"
    >
        ${data.sire || "Not Recorded"}
    </span>
</p>

<p>
    Dam:

    <span
        class="horse-link"
        onclick="openHorseByName('${data.dam}')"
    >
        ${data.dam || "Not Recorded"}
    </span>
</p>

        <h3 class="profile-section-title">
    Ownership History
</h3>

${
    ownershipHistory?.length
    ? ownershipHistory.map(record => `
        <p>
            ${record.previous_owner}
            →
            ${record.new_owner}
        </p>
    `).join("")
    : "<p>No ownership history.</p>"
}

<h3 class="profile-section-title">
    Marketplace History
</h3>

${
    marketplaceHistory?.length
    ? marketplaceHistory.map(record => `
        <p>
            ${record.seller}
            →
            ${record.buyer}

            ($${record.sale_price})
        </p>
    `).join("")
    : "<p>No marketplace records.</p>"
}

<h3 class="profile-section-title">
    Offspring
</h3>

${
    offspringLogs?.length
    ? offspringLogs.map(record => `
        <p>
            Foal ID:
            ${record.foal_id}
        </p>
    `).join("")
    : "<p>No offspring recorded.</p>"
}

<h3 class="profile-section-title">
    Breeding Records
</h3>

${
    breedingHistory?.length
    ? breedingHistory.map(record => `
        <p>
            Date:
            ${record.breeding_date || "Not Recorded"}
        </p>

        <p>
            Status:
            ${record.status || "Not Recorded"}
        </p>

        <p>
            Notes:
            ${record.notes || "None"}
        </p>

        <hr>
    `).join("")
    : "<p>No breeding records recorded.</p>"
}

`;

}

window.openHorseByName =
async function(name) {

    if (!name) return;

    const { data } =
        await supabaseClient
            .from("horses")
            .select("*")
            .eq(
                "registered_name",
                name
            )
            .single();

    if (!data) return;

    viewHorse(data.id);

}

window.closeHorseProfile =
function() {

    const profile =
        document.getElementById(
            "horseProfile"
        );

    if (profile) {
        profile.style.display = "none";
    }

    showSection("registrySection");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

};

window.showSection =
function(sectionId) {

    const registrySection =
        document.getElementById(
            "registrySection"
        );

    const breedingsSection =
        document.getElementById(
            "breedingsSection"
        );

    if (
        sectionId ===
        "breedingsSection"
    ) {

        registrySection.style.display =
            "none";

        breedingsSection.style.display =
            "block";

    }

    else {

        registrySection.style.display =
            "block";

        breedingsSection.style.display =
            "none";

    }

};

window.uploadPhoto =
function(id) {

    const input =
        document.getElementById(
            "photoUploadInput"
        );

    input.onchange =
    async function(event) {

        const file =
            event.target.files[0];

        if (!file) return;

        const fileName =
            `${id}-${Date.now()}-${file.name}`;

        const { error: uploadError } =
            await supabaseClient
                .storage
                .from("horse-photos")
                .upload(
                    fileName,
                    file,
                    {
                        upsert: true
                    }
                );

        if (uploadError) {

    console.error(
        "UPLOAD ERROR:",
        uploadError
    );

    alert(
        JSON.stringify(uploadError)
    );

    return;

}

        const {
            data: photoData
        } =
            supabaseClient
                .storage
                .from("horse-photos")
                .getPublicUrl(
                    fileName
                );

        await supabaseClient
            .from("horses")
            .update({
                photo_url:
                    photoData.publicUrl
            })
            .eq("id", id);

        loadHorses();

    };

    input.click();

}

breedingForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const sireId =
            document.getElementById(
                "breedingSire"
            ).value;

        const damId =
            document.getElementById(
                "breedingDam"
            ).value;

        let foalId =
    document.getElementById(
        "breedingFoal"
    ).value;

if (
    foalId === "Select Foal"
) {
    foalId = null;
}

        const breedingDate =
            document.getElementById(
                "breedingDate"
            ).value;

        const status =
            document.getElementById(
                "breedingRecordStatus"
            ).value;

        const notes =
            document.getElementById(
                "breedingNotes"
            ).value;

        const { error } =
            await supabaseClient
                .from("breeding_logs")
                .insert([
                    {
                        sire_id: sireId,
                        dam_id: damId,
                        foal_id: foalId,
                        breeding_date: breedingDate,
                        status: status,
                        notes: notes
                    }
                ]);

       if (error) {

    console.error(
        "BREEDING ERROR:",
        error
    );

    alert(
        JSON.stringify(error)
    );

    return;

}

        alert(
    "Breeding record saved."
);

breedingForm.reset();

loadBreedingHistory();

    }
);

// ========================================
// SITE NAVIGATION
// ========================================

window.showSection = function(sectionId) {

    const horseProfile =
        document.getElementById(
            "horseProfile"
        );

    if (horseProfile) {
        horseProfile.style.display =
            "none";
    }

    const sections = [
        "dashboardSection",
        "registrySection",
        "breedingsSection",
        "pedigreesSection",
        "marketplaceSection",
        "brandsSection",
        "guideSection"
    ];

    sections.forEach(id => {

        const section =
            document.getElementById(id);

        if (section) {
            section.style.display = "none";
        }

    });

    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.style.display = "block";
    }

    document
        .querySelectorAll("nav button")
        .forEach(button => {

            button.classList.remove(
                "active-nav"
            );

            if (
                button
                    .getAttribute("onclick")
                    ?.includes(sectionId)
            ) {
                button.classList.add(
                    "active-nav"
                );
            }

        });

    if (sectionId === "dashboardSection") {
        loadDashboard();
    }

    if (sectionId === "registrySection") {
        loadHorses();
    }

    if (sectionId === "breedingsSection") {
        loadBreedingHistory();
        loadHorseDropdown();
    }

};

// ========================================
// DASHBOARD
// ========================================

async function loadDashboard() {

    const {
        data: horses,
        error: horseError
    } =
        await supabaseClient
            .from("horses")
            .select("*")
            .eq("archived", false);

    if (horseError) {
        console.error(
            "Dashboard horse error:",
            horseError
        );
        return;
    }

    const {
        data: breedings,
        error: breedingError
    } =
        await supabaseClient
            .from("breeding_logs")
            .select("*");

    if (breedingError) {
        console.error(
            "Dashboard breeding error:",
            breedingError
        );
    }

    const safeHorses = horses || [];
    const safeBreedings = breedings || [];

    const brands =
        new Set(
            safeHorses
                .map(horse => horse.brand)
                .filter(Boolean)
        );

    const horseCount =
        document.getElementById(
            "dashboardHorseCount"
        );

    const activeCount =
        document.getElementById(
            "dashboardActiveCount"
        );

    const breedingCount =
        document.getElementById(
            "dashboardBreedingCount"
        );

    const brandCount =
        document.getElementById(
            "dashboardBrandCount"
        );

    if (horseCount) {
        horseCount.textContent =
            safeHorses.length;
    }

    if (activeCount) {
        activeCount.textContent =
            safeHorses.filter(
                horse =>
                    horse.horse_status ===
                    "Active"
            ).length;
    }

    if (breedingCount) {
        breedingCount.textContent =
            safeBreedings.length;
    }

    if (brandCount) {
        brandCount.textContent =
            brands.size;
    }

}

showSection("dashboardSection");