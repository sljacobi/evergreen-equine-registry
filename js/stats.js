console.log(
    "STATSJS VERSION 1"
);


// ========================================
// HORSE STATS ELEMENTS
// ========================================

const horseStatsDialog =
    document.getElementById(
        "horseStatsDialog"
    );

const horseStatsForm =
    document.getElementById(
        "horseStatsForm"
    );

const horseStatsHorseId =
    document.getElementById(
        "horseStatsHorseId"
    );

const horseStatsHorseName =
    document.getElementById(
        "horseStatsHorseName"
    );

const horseStatsMessage =
    document.getElementById(
        "horseStatsMessage"
    );

const saveHorseStatsButton =
    document.getElementById(
        "saveHorseStatsButton"
    );

const closeHorseStatsButton =
    document.getElementById(
        "closeHorseStatsDialog"
    );

const cancelHorseStatsButton =
    document.getElementById(
        "cancelHorseStats"
    );

    // ========================================
// STAT VALUE HELPERS
// ========================================

function horseStatNumberOrNull(
    elementId
) {

    const value =
        document.getElementById(
            elementId
        ).value;


    if (value === "") {
        return null;
    }


    return Number(value);
}

// ========================================
// OPEN HORSE STATS
// ========================================

window.openHorseStats =
async function(horseId) {

    if (
        !horseStatsDialog ||
        !horseStatsForm
    ) {

        console.error(
            "Horse Stats dialog was not found."
        );

        return;
    }


    horseStatsMessage.textContent =
        "";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("horses")
            .select(
                "id, registered_name, speed, acceleration, health, stamina, handling, shoes_state, bonding_level, personality, metabolism"
            )
            .eq(
                "id",
                horseId
            )
            .single();


    if (error) {

        console.error(
            "Horse Stats loading error:",
            error
        );


        alert(
            "The horse's stats could not be loaded."
        );

        return;
    }


    if (!data) {

        alert(
            "The selected horse could not be found."
        );

        return;
    }


    horseStatsHorseId.value =
        data.id;


    horseStatsHorseName.textContent =
        data.registered_name ||
        "Horse Stats";


    document.getElementById(
        "horseStatSpeed"
    ).value =
        data.speed ?? "";


    document.getElementById(
        "horseStatAcceleration"
    ).value =
        data.acceleration ?? "";


    document.getElementById(
        "horseStatHealth"
    ).value =
        data.health ?? "";


    document.getElementById(
        "horseStatStamina"
    ).value =
        data.stamina ?? "";


    document.getElementById(
        "horseStatHandling"
    ).value =
        data.handling || "";


    document.getElementById(
        "horseStatShoesState"
    ).value =
        data.shoes_state ?? "";


    document.getElementById(
        "horseStatBondingLevel"
    ).value =
        data.bonding_level ?? "";


    document.getElementById(
        "horseStatPersonality"
    ).value =
        data.personality || "";


    document.getElementById(
        "horseStatMetabolism"
    ).value =
        data.metabolism || "";


    if (!horseStatsDialog.open) {

        horseStatsDialog.showModal();
    }

};

// ========================================
// CLOSE HORSE STATS
// ========================================

window.closeHorseStats =
function() {

    if (
        horseStatsDialog &&
        horseStatsDialog.open
    ) {

        horseStatsDialog.close();
    }


    if (horseStatsForm) {

        horseStatsForm.reset();
    }


    if (horseStatsHorseId) {

        horseStatsHorseId.value =
            "";
    }


    if (horseStatsMessage) {

        horseStatsMessage.textContent =
            "";
    }

};

if (closeHorseStatsButton) {

    closeHorseStatsButton.addEventListener(
        "click",
        window.closeHorseStats
    );
}


if (cancelHorseStatsButton) {

    cancelHorseStatsButton.addEventListener(
        "click",
        window.closeHorseStats
    );
}

// ========================================
// VALIDATE STAT RANGE
// ========================================

function horseStatIsValid(
    value,
    maximum
) {

    if (value === null) {
        return true;
    }


    return (
        Number.isInteger(value) &&
        value >= 0 &&
        value <= maximum
    );
}

// ========================================
// SAVE HORSE STATS
// ========================================

if (horseStatsForm) {

    horseStatsForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const horseId =
                horseStatsHorseId.value;


            if (!horseId) {

                horseStatsMessage.textContent =
                    "The horse ID is missing.";

                return;
            }


            const speed =
                horseStatNumberOrNull(
                    "horseStatSpeed"
                );


            const acceleration =
                horseStatNumberOrNull(
                    "horseStatAcceleration"
                );


            const health =
                horseStatNumberOrNull(
                    "horseStatHealth"
                );


            const stamina =
                horseStatNumberOrNull(
                    "horseStatStamina"
                );


            const shoesState =
                horseStatNumberOrNull(
                    "horseStatShoesState"
                );


            const bondingLevel =
                horseStatNumberOrNull(
                    "horseStatBondingLevel"
                );


            const handling =
                document.getElementById(
                    "horseStatHandling"
                )
                .value
                .trim();


            const personality =
                document.getElementById(
                    "horseStatPersonality"
                ).value;


            const metabolism =
                document.getElementById(
                    "horseStatMetabolism"
                )
                .value
                .trim();


            if (
                !horseStatIsValid(
                    speed,
                    10
                )
            ) {

                horseStatsMessage.textContent =
                    "Speed must be between 0 and 10.";

                return;
            }


            if (
                !horseStatIsValid(
                    acceleration,
                    10
                )
            ) {

                horseStatsMessage.textContent =
                    "Acceleration must be between 0 and 10.";

                return;
            }


            if (
                !horseStatIsValid(
                    health,
                    9
                )
            ) {

                horseStatsMessage.textContent =
                    "Health must be between 0 and 9.";

                return;
            }


            if (
                !horseStatIsValid(
                    stamina,
                    9
                )
            ) {

                horseStatsMessage.textContent =
                    "Stamina must be between 0 and 9.";

                return;
            }


            if (
                !horseStatIsValid(
                    shoesState,
                    10
                )
            ) {

                horseStatsMessage.textContent =
                    "Shoes State must be between 0 and 10.";

                return;
            }


            if (
                !horseStatIsValid(
                    bondingLevel,
                    4
                )
            ) {

                horseStatsMessage.textContent =
                    "Bonding Level must be between 0 and 4.";

                return;
            }


            horseStatsMessage.textContent =
                "";


            saveHorseStatsButton.disabled =
                true;


            saveHorseStatsButton.textContent =
                "Saving Stats...";


            const { error } =
                await supabaseClient
                    .from("horses")
                    .update({
                        speed:
                            speed,

                        acceleration:
                            acceleration,

                        health:
                            health,

                        stamina:
                            stamina,

                        handling:
                            handling || null,

                        shoes_state:
                            shoesState,

                        bonding_level:
                            bondingLevel,

                        personality:
                            personality || null,

                        metabolism:
                            metabolism || null
                    })
                    .eq(
                        "id",
                        horseId
                    );


            if (error) {

                console.error(
                    "Horse Stats saving error:",
                    error
                );


                horseStatsMessage.textContent =
                    "The horse's stats could not be saved.";


                saveHorseStatsButton.disabled =
                    false;


                saveHorseStatsButton.textContent =
                    "Save Stats";

                return;
            }


            saveHorseStatsButton.disabled =
                false;


            saveHorseStatsButton.textContent =
                "Save Stats";


            window.closeHorseStats();


            if (
                typeof loadHorses ===
                "function"
            ) {

                await loadHorses();
            }


            alert(
                "Horse stats saved successfully."
            );

        }
    );

}