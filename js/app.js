console.log("APPJS VERSION 2");

const horseForm = document.getElementById("horseForm");
const horseList = document.getElementById("horseList");

let ownerFilter = "";
let brandFilter = "";

let editingHorseId = null;

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

            brand: brand
        })
        .eq("id", editingHorseId));     

if (
    previousOwner &&
    previousOwner !== owner
) {

    console.log(
    "Ownership transfer:",
    previousOwner,
    "->",
    owner
);

    await supabaseClient
        .from("ownership_history")
        .insert([
            {
                horse_id: editingHorseId,
                previous_owner: previousOwner,
                new_owner: owner
            }
        ]);

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

                brand: brand
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

    <h3>${horse.registered_name}</h3>

    <p>
        <strong>Owner:</strong> ${horse.owner_name || "None"}
        |
        <strong>Brand:</strong> ${horse.brand || "None"}
    </p>

    <p>
        ${horse.breed || "Unknown"}
        |
        ${horse.gender || "Unknown"}
        |
        Age ${horse.age || "?"}
    </p>

    <p>
        Status: ${horse.horse_status || "Active"}
        |
        Origin: ${horse.horse_origin || "Unknown"}
    </p>

    <button onclick="editHorse('${horse.id}')">
        Edit
    </button>

    <button onclick="archiveHorse('${horse.id}')">
        Archive
    </button>

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

                <p>
                    ${record.previous_owner}
                    →
                    ${record.new_owner}
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
    <div class="card">

        <h3
            onclick="filterOwner('${owner}')"
            style="cursor:pointer;"
        >
            ${owner}
        </h3>

        <p>${count} horse(s)</p>

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
            <div class="card">

                <h3
                    onclick="filterBrand('${brand}')"
                    style="cursor:pointer;"
                >
                    ${brand}
                </h3>

                <p>${count} horse(s)</p>

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