const search = function(name, beforeSend = null) {
    return new Promise((resolve, reject) => {
        $.ajax("/api/airport", {
            method: "GET",
            timeout: 3e4,
            data: {
                airport: name
            },
            beforeSend: function() {
                if (typeof beforeSend === "function") {
                    beforeSend()
                }
            },
            success: function(response) {
                resolve(response)
            },
            error: function() {
                reject()
            }
        })
    })
};

function place_formatter(response) {
    var places = "";

    Object.keys(response).forEach(function(key) {
        places += `<div data-name="${response[key]}" data-code="${response[key]}" class="content-result">${response[key]}</div>`;
    });

    var results = `
    <div id="results">
        <div id="city">
            <div id="header" class="search-titles">
                <i class="suggester-icon-xsm suggester-icon-city"></i>
                <span>CIDADES</span>
            </div>
            <div id="content">
                ${places}
            </div>
        </div>
    </div>`;

    return results;
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args)
        }, timeout)
    }
}

function delayRequest(func, delay) {
    let timeOut;
    return function(...args) {
        const content = this;
        clearTimeout(timeOut);
        timeOut = setTimeout(function() {
            func.apply(content, args)
        }, delay)
    }
}

function openModal(target) {
    $(".modal-desktop").addClass("sf-hidden");
    $(target).removeClass("sf-hidden")
}

function closeModal() {
    $(".modal-desktop").addClass("sf-hidden")
}

function passengersApply() {
    let adults = parseInt($("#adults").val());
    let kids = 0;
    let babies = 0;
    let itens = $("#content-for-minor .minor_ages");
    itens.each(function() {
        let age = parseInt($(this).val());
        if (age === 0) {
            babies++
        } else if (age >= 1) {
            kids++
        }
    });
    let totalPassengers = adults + kids + babies;
    let message;
    if (totalPassengers === 1) {
        message = "1 Pessoa, Econômica"
    } else {
        message = `${totalPassengers} Pessoas, Econômica`
    }
    $("#qtd-adults").val(adults);
    $("#qtd-kids").val(kids);
    $("#qtd-babies").val(babies);
    $("#input-passengers").val(message)
}
$(function() {
    let calendarItens = $(".calendar-item");
    let currentCalendar = 0;
    $(".calendar-arrow-right").on("click", function() {
        currentCalendar++;
        let item = `.calendar-tem-${currentCalendar}`;
        let calendar = $(item);
        if (calendar.length) {
            calendarItens.addClass("sf-hidden");
            calendar.removeClass("sf-hidden")
        } else {
            currentCalendar--
        }
    });
    $(".calendar-arrow-left").on("click", function() {
        currentCalendar--;
        let item = `.calendar-tem-${currentCalendar}`;
        let calendar = $(item);
        if (calendar.length) {
            calendarItens.addClass("sf-hidden");
            calendar.removeClass("sf-hidden")
        } else {
            currentCalendar++
        }
    });
    let modalSearchOne = $(".modal-search-one");
    let modalSearchTwo = $(".modal-search-two");
    let origem = $("#origem");
    const origemBeforeSend = $(".origem-before-send");
    const origemContent = $(".search-content-origem");
    origem.on("input", function() {
        const origemInput = origem.val();
        if (origemInput.length >= 3) {
            modalSearchOne.removeClass("sf-hidden");
            origemBeforeSend.removeClass("sf-hidden")
        } else {
            modalSearchOne.addClass("sf-hidden");
            origemBeforeSend.addClass("sf-hidden")
        }
        origemContent.html("")
    });
    origem.on("input", debounce(function() {
        const origemInput = origem.val();
        if (origemInput.length >= 3) {
            modalSearchOne.removeClass("sf-hidden");
            origemBeforeSend.removeClass("sf-hidden");

            search(origemInput).then(function(response) {
                var results = place_formatter(response);
                origemContent.html(results);
            }).finally(function() {
                origemBeforeSend.addClass("sf-hidden");
                origemContent.removeClass("sf-hidden")
            })
        }
    }, 700));
    modalSearchOne.on("click", ".content-result", function() {
        let object = $(this);
        let {
            name,
            code
        } = object.data();
        origem.val(name);
        $("#Boarding").val(code);
        modalSearchOne.addClass("sf-hidden")
    });
    origem.on("click", function() {
        if (origemContent.html().trim().length) {
            openModal(".modal-search-one")
        }
    });
    let destino = $("#destino");
    const destinoBeforeSend = $(".destino-before-send");
    const destinoContent = $(".search-content-destino");
    destino.on("input", function() {
        const destinoInput = destino.val().trim();
        if (destinoInput.length >= 3) {
            modalSearchTwo.removeClass("sf-hidden");
            destinoBeforeSend.removeClass("sf-hidden")
        } else {
            modalSearchTwo.addClass("sf-hidden");
            destinoBeforeSend.addClass("sf-hidden")
        }
        destinoContent.html("")
    });
    destino.on("input", debounce(function() {
        const destinoInput = destino.val().trim();
        if (destinoInput.length >= 3) {
            search(destinoInput).then(function(response) {
                var results = place_formatter(response);
                destinoContent.html(results);
            }).finally(function() {
                destinoBeforeSend.addClass("sf-hidden")
            })
        }
    }, 700));
    destino.on("keyus", debounce(function() {
        if (destino.val().length >= 3) {
            openModal(".modal-search-two");
            search(destino.val()).then(function(response) {
                modalSearchTwo.html(response)
            })
        } else {
            modalSearchTwo.html("");
            closeModal()
        }
    }, 50));
    modalSearchTwo.on("click", ".content-result", function() {
        let object = $(this);
        let {
            name,
            code
        } = object.data();
        destino.val(name);
        $("#Disembarking").val(code);
        modalSearchTwo.addClass("sf-hidden")
    });
    destino.on("click", function() {
        if (destinoContent.html().trim().length) {
            openModal(".modal-search-two")
        }
    });
   
    let goingDate = $(".calendar-going td.active");
    goingDate.on("click", function() {
        let closest = $(this);
        let {
            count,
            value
        } = closest.data();
        let index = $(".calendar-going td.active[data-count]").index(this);
        $(".thd-day").removeClass("going-active");
        $(`td[data-count="${count}"] .thd-day`).addClass("going-active").attr("data-going", index);
        $("#going-date").val(value);
        if (!$("#return-date").is(":disabled")) {
            $("#return-date-label").click();
            openModal(".calendar-return")
        } else {
            closeModal()
        }
    });
    let returnDate = $(".calendar-return td.active .thd-day");
    returnDate.on("click", function() {
        let closest = $(this).closest("td");
        let {
            date,
            count,
            value
        } = closest.data();
        $(".thd-day").removeClass("return-active");
        $(`.calendar-return td[data-count="${count}"] .thd-day`).addClass("return-active");
        $("#return-date").val(value);
        closeModal()
    });
    $(".calendar-going .calendar-arrow-left:first").attr("disabled", true);
    $(".calendar-going .calendar-arrow-right:last").attr("disabled", true);
    $(".calendar-return .calendar-arrow-left:first").attr("disabled", true);
    $(".calendar-return .calendar-arrow-right:last").attr("disabled", true);
    $("#return-date").on("click", function() {
        openModal(".calendar-return")
    });
    $("#going-date").on("click", function() {
        openModal(".calendar-going")
    });
    $("#input-passengers").on("click", function() {
        openModal(".modal-passengers")
    });
    let adults = $("#adults");
    let adultsBtnPlus = $("#adult-plus");
    let adultsBtnLess = $("#adult-less");
    adultsBtnPlus.on("click", function() {
        let adultsQtd = parseInt(adults.val());
        adultsQtd++;
        adultsQtd = Math.min(adultsQtd, 8);
        adults.val(adultsQtd);
        $("#qtd-adults").val(adultsQtd)
    });
    adultsBtnLess.on("click", function() {
        let adultsQtd = parseInt(adults.val());
        adultsQtd--;
        adultsQtd = Math.max(adultsQtd, 1);
        adults.val(adultsQtd);
        $("#qtd-adults").val(adultsQtd)
    });
    let minors = $("#total-minors");
    let btnMinorsPlus = $("#minor-plus");
    let btnMinorsLess = $("#minor-less");
    btnMinorsLess.on("click", function() {
        let minorsQtd = parseInt(minors.val());
        minorsQtd--;
        minorsQtd = Math.max(minorsQtd, 0);
        minors.val(minorsQtd);
        $("#content-for-minor .stepper__room__row:last").remove()
    });
    btnMinorsPlus.on("click", function() {
        let minorsQtd = parseInt(minors.val());
        minorsQtd++;
        minorsQtd = Math.min(minorsQtd, 5);
        minors.val(minorsQtd);
        let actives = $("#content-for-minor .stepper__room__row").length;
        if (actives <= 5) {
            let example = $(".minor-example").html();
            example = example.replace("{{minor_number}}", minorsQtd);
            $("#content-for-minor").append(example)
        }
    });
    let input = $("input");
    let modalDesktop = $(".modal-desktop");
    let searchBox = $("#SEARCHBOX label");
    $(document).on("click", function(event) {
        if (modalDesktop.is(":visible")) {
            let targetEvent = event.target;
            if (!modalDesktop.is(targetEvent) && !modalDesktop.has(targetEvent).length && !input.is(event.target) && !searchBox.is(event.target)) {
                if ($(".modal-passengers").is(":visible")) {
                    passengersApply()
                }
                closeModal()
            }
        }
    });
    origem.on("focus", function() {
        modalSearchTwo.addClass("sf-hidden")
    });
    destino.on("focus", function() {
        modalSearchOne.addClass("sf-hidden")
    });
    $(".passengers-apply").on("click", function() {
        passengersApply();
        closeModal()
    });
    $(".search-travel-form input").on("click, focus", function() {
        let div = $(this).closest(".form-group").removeClass("error")
    });
    $(".travel-type").on("click", function() {
        let object = $(this);
        let value = object.val();
        $(".travel-type").removeClass("-active");
        object.addClass("-active");
        if (value === "oneWay") {
            $("#return-date").attr("disabled", true).closest(".form-group").removeClass("error");
            $(".sbox5-dates-input2-container").addClass("-disabled")
        } else {
            $("#return-date").attr("disabled", false);
            $(".sbox5-dates-input2-container").removeClass("-disabled")
        }
    });
    $(".search-travel-form").on("submit", function() {
        let status = true;
        let boarding = $("#Boarding");
        if (!boarding.val().length) {
            status = false;
            boarding.closest(".form-group").addClass("error")
        } else {
            boarding.closest(".form-group").removeClass("error")
        }
        let disembarking = $("#Disembarking");
        if (!disembarking.val().length) {
            status = false;
            disembarking.closest(".form-group").addClass("error")
        } else {
            disembarking.closest(".form-group").removeClass("error")
        }
        let goingDate = $("#going-date");
        if (!goingDate.val().length) {
            status = false;
            goingDate.closest(".form-group").addClass("error")
        } else {
            goingDate.closest(".form-group").removeClass("error")
        }
        let returnDate = $("#return-date");
        if (!returnDate.is(":disabled")) {
            if (!returnDate.val().length) {
                status = false;
                returnDate.closest(".form-group").addClass("error")
            } else {
                returnDate.closest(".form-group").removeClass("error")
            }
        }
        if (!status) {
            return false
        }
    })
});

$("#searchButton").click(function() {
    var origem = $("#origem").val();
    var destino = $("#destino").val();
    var openModal = origem != "" && destino != "";

    if (openModal) {
        var local = {
            origem: origem,
            destino: destino,
            ida: $("#going-date").val(),
            volta: $("#return-date").val(),
            passageiros: $("#input-passengers").val()
        };

        localStorage.setItem("local", JSON.stringify(local));
        window.location.href = "./black/flights.html";
    }
});