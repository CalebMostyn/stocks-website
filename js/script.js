var openstackDomain = "caleb-mostyn.com";
var URL = "php/final.php"
var NUM_ARTICLES = 5;
var API_URL = "https://api.polygon.io";
var API_KEY = null;
var API_KEY_2 = null;

function fetchApiKey() {
    return $.ajax({
        url: "php/fetchApiKey.php",
        method: "GET"
    }).done(function (response) {
        API_KEY = response['API_KEY_1'];
        API_KEY_2 = response['API_KEY_2'];
        console.log("API Key loaded successfully");
    }).fail(function () {
        console.error("Failed to retrieve API key");
    });
}

function swapKeys() {
    let temp = API_KEY_2;
    API_KEY_2 = API_KEY;
    API_KEY = temp;
}

function getCookie(cookieName) {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].split('=');
        if (cookie[0] === cookieName) {
            return decodeURIComponent(cookie[1]);
        }
    }
    return null;
}

function loggedIn() {
    if (getCookie("loggedIn") == "true") {
        if (getCookie("session") == null || getCookie("username") == null) {
            logoutUser();
            return false;
        }
        return true;
    } else {
        return false;
    }
}

function loginUser() {
    let uname = $("#loginForm #username").val();
    let pword = $("#loginForm #password").val();

    // PHP API Call -- AJAX
    a = $.ajax({
        url: URL + '/login',
        method: "GET",
        data: {
            username: uname,
            password: pword
        }
    }).done(function (data) {
        // Handle JSON Response
        if (data['status'] == 0) {
            $("#loginForm #username").val("");
            $("#loginForm #password").val("");
            $('#loginModal').modal('hide');
            var date = new Date();
            date.setTime(date.getTime() + (60 * 60 * 1000));
            let expiration = "; expires=" + date.toUTCString();
            document.cookie = "loggedIn=true; path=/; domain=" + openstackDomain;
            document.cookie = "session=" + data['session'] + "; path=/; domain=" + openstackDomain + "; expires=" + expiration;
            document.cookie = "username=" + uname + "; path=/; domain=" + openstackDomain + "; expires=" + expiration;
            refreshButtons();
            if (window.location.pathname.endsWith('/stocks.html')) {
                getFavorites();
            }
        } else {
            // Incorrect username or password
            $('#loginForm #error').html('<br> Incorrect Username or Password').show();
        }
    }).fail(function (error) {
        console.log("error", error.statusText);
    });


}


function logoutUser() {
    let uname = getCookie("username");
    let sessionID = getCookie("session");

    // PHP API Call -- AJAX
    a = $.ajax({
        url: URL + '/logout',
        method: "GET",
        data: {
            username: uname,
            session: sessionID
        }
    }).done(function (data) {
        // Handle JSON Response
        if (data['status'] == 0) {
            document.cookie = "loggedIn=false; path=/; domain=" + openstackDomain;
            document.cookie = "session=; Max-Age=-1; path=/;";
            document.cookie = "username=; Max-Age=-1; path=/;";
            sessionStorage.clear();

            refreshButtons();
            displayFavorites();
            $("#stocks").hide();
            $("#sort").hide();
            $(".stocks").hide();
            $("#selectedStock").removeClass('visibleContainer').addClass('hiddenContainer');
            $("#results").removeClass('visibleContainer').addClass('hiddenContainer');
            $("#selectedStock").html(`<!-- Selected Stock content -->
            <div id="title"></div>
            <br>
            <div id="details" class="visibleContainer full-width"></div>
            <div id="chart-div" class="outlined-container visibleContainer full-width"></div>
            <div class="outlined-container" id="newsContainer">
              <div id="newsTitle"></div>
              <div id="news" class="visibleContainer"></div>
            </div>`);
            $('input[name=radio]').prop('checked', false);
            $('input[type=date]').parent().hide();
            $('input[type=date]').val('');


            $("#favoriteSubmit").hide();
            if (window.location.pathname.endsWith('/stocks.html') || 
window.location.pathname.endsWith('/favorites.html')) {
                $('#loginModal').modal('show');
                $(".closebtn").hide();
            }
        } else {
            // Incorrect Session -- Log User Out and Notify Session Expired
            $('#logoutAlert').html(`<div class="alert alert-danger alert-dismissible" role="alert">
            <div>Session Expired, Logging You Out...</div>
            </div>`)
            $('#logoutAlert').show();
            setTimeout(() => {
                $('#logoutAlert').html("");
                $('#logoutAlert').hide();
            }, 3000);
            document.cookie = "loggedIn=false; path=/; domain=" + openstackDomain;
            document.cookie = "session=; Max-Age=-1; path=/;";
            document.cookie = "username=; Max-Age=-1; path=/;";
            sessionStorage.clear();
            refreshButtons();
            displayFavorites();
            $("#sort").hide();
            $(".stocks").hide();
            $("#results").removeClass('visibleContainer').addClass('hiddenContainer');
            $("#selectedStock").removeClass('visibleContainer').addClass('hiddenContainer');
            $("#selectedStock").html(`<!-- Selected Stock content -->
            <div id="title"></div>
            <br>
            <div id="details" class="visibleContainer full-width"></div>
            <div id="chart-div" class="outlined-container visibleContainer full-width"></div>
            <div class="outlined-container" id="newsContainer">
              <div id="newsTitle"></div>
              <div id="news" class="visibleContainer"></div>
            </div>`);
            $('input[name=radio]').prop('checked', false);
            $('input[type=date]').parent().hide();
            $('input[type=date]').val('');



            if (window.location.pathname.endsWith('/stocks.html') || 
window.location.pathname.endsWith('/favorites.html')) {
                $('#loginModal').modal('show');
                $(".closebtn").hide();
            }
        }
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function validateForm(uname, pword, name) {
    let nameTest = /.{2,}/
    if (!nameTest.test(name)) {
        $('#signUpForm #error').html("<br> Name is invalid, must be at least 2 characters").show();
        return false;
    }

    let unameTest = /.{2,}/
    if (!unameTest.test(uname)) {
        $('#signUpForm #error').html("<br> Username is invalid, must be at least 2 characters").show();
        return false;
    }

    let uppercaseRegex = /[A-Z]/;
    let digitRegex = /\d/;
    let symbolRegex = /[!@#$%^&*]/;
    if (!uppercaseRegex.test(pword) && !digitRegex.test(pword) && !symbolRegex.test(pword)) {
        $('#signUpForm #error').html("<br> Pasword is invalid, must contain a capital letter, a number, and a symbol").show();
        return false;
    } else if (!uppercaseRegex.test(pword) && !digitRegex.test(pword)) {
        $('#signUpForm #error').html("<br> Pasword is invalid, must contain a capital letter and a number").show();
        return false;
    } else if (!uppercaseRegex.test(pword) && !symbolRegex.test(pword)) {
        $('#signUpForm #error').html("<br> Pasword is invalid, must contain a capital letter and a symbol").show();
        return false;
    } else if (!digitRegex.test(pword) && !symbolRegex.test(pword)) {
        $('#signUpForm #error').html("<br> Pasword is invalid, must contain a number and a symbol").show();
        return false;
    } else if (!uppercaseRegex.test(pword)) {
        $('#signUpForm #error').html("<br> Pasword is invalid, must contain a capital letter").show();
        return false;
    } else if (!digitRegex.test(pword)) {
        $('#signUpForm #error').html("<br> Pasword is invalid, must contain a number").show();
        return false;
    } else if (!symbolRegex.test(pword)) {
        $('#signUpForm #error').html("<br> Pasword is invalid, must contain a symbol").show();
        return false;
    }
    return true;
}


function signUpUser() {
    let uname = $("#signUpForm #username").val();
    let pword = $("#signUpForm #password").val();
    let name = $("#name").val();

    if (validateForm(uname, pword, name)) {

        // PHP API Call
        a = $.ajax({
            url: URL + '/signUp',
            method: "GET",
            data: {
                username: uname,
                password: pword,
                name: name
            }
        }).done(function (data) {
            // Handle JSON Response
            if (data['status'] == 0) {
                $('#signUpModal').modal('hide');
                $('#loginModal').modal('show');
                $('#accountCreation').html('Account With Username ' + uname + ' Created! <br>').show();
                $('#loginForm #username').val(uname);
                $('#loginForm #password').val("");
            } else {
                // Incorrect username or password
                $('#signUpForm #error').html('<br> Account With Username ' + uname + ' Already Exists').show();

            }
        }).fail(function (error) {
            console.log("error", error.statusText);
        });
    }
}

function getFavorites() {
    if (!loggedIn()) {
        return;
    }
    let favorites = sessionStorage.getItem("favorites");
    if (favorites == null) {
        favorites = "";
        a = $.ajax({
            url: URL + '/getFavorites',
            method: "GET",
            data: {
                username: getCookie("username"),
                session: getCookie("session"),
                date: "none"
            }
        }).done(function (data) {
            // Handle JSON Response
            for (const favorite of data.results) {
                favorites += favorite.stock + ",";
                let names = JSON.parse(sessionStorage.getItem("names"));
                if (names == null) {
                    let names = {};
                    names[favorite.stock] = favorite.name;
                    sessionStorage.setItem("names", JSON.stringify(names));
                } else if (!Object.keys(names).includes(favorite.stock)) {
                    names[favorite.stock] = favorite.name;
                    sessionStorage.setItem("names", JSON.stringify(names));
                }
            }

            sessionStorage.setItem("favorites", favorites);
            displayFavorites();
            return favorites;
        }).fail(function (error) {
            console.log("error", error.statusText);
        });
    } else {
        return favorites
    }
}

// Needs to get details for each favorite
function displayFavorites() {
    let favorites = sessionStorage.getItem("favorites");
    $("#favorites-header").html(`<div class="container">
    <div class="row align-items-center">
        <div class="col-10">
            <label for="favorites" class="col-form-label">Favorites</label>
        </div>
        <div class="col-1">
            <button type="button" class="btn btn-light hiddenContainer" id="sort" style="width: fit-content; height: fit-content"
                onclick="flipSort('#favorites'); $(this).find('img').toggleClass('flipped-image');">
                <img src="resources/redtriangle.png" class="grayscale-image" height="15px" width="15px">
            </button>
        </div>
    </div>
</div>
`);
    $("#favorites").html("");
    if (favorites != null) {
        for (const favorite of favorites.split(",")) {
            if (favorite != "") {
                $("#favorites").append(`<div id="${favorite}" class="outlined-container"> <b><u>${favorite}</b></u>
            <div class="details"></div>
            <button class="btn btn-danger delete" type="button" onclick="deleteFavorite('${favorite}')">Remove Favorite</button>
            </div>`);
            }
        }
        let refresh = "";
        for (const favorite of favorites.split(",")) {
            let details = sessionStorage.getItem(favorite);
            if (details == null && favorite != "") {
                refresh += favorite + ",";
            } else if (details != null) {
                displayFavoriteDetails(favorite);
            }
        }
        if (refresh != "") {
            loadDetails(refresh);
        }
    } else if (loggedIn()) {
        getFavorites();
    }
}

// function isFavorite(ticker) {
//     // PHP API Call -- AJAX
//     let favorites = sessionStorage.getItem("favorites");
//     favorites = favorites.split(",");
//     for (const favorite of favorites) {
//         if (ticker == favorite) {
//             return true;
//         }
//     }
//     return false;
// }

function addFavorite(ticker) {
    if (!loggedIn()) {
        return;
    }
    getFavorites();
    a = $.ajax({
        url: URL + '/addFavorite',
        method: "GET",
        data: {
            username: getCookie("username"),
            session: getCookie("session"),
            stock: ticker,
            name: JSON.parse(sessionStorage.getItem("names"))[ticker]
        }
    }).done(function (data) {
        // Add favorite to session storage
        let existingFavorites = sessionStorage.getItem("favorites");
        existingFavorites = existingFavorites == null ? "" : existingFavorites;
        if (data.status == "0") {
            sessionStorage.setItem("favorites", existingFavorites + ticker + ",")
        }
        displayFavorites();
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function deleteFavorite(ticker) {
    if (!loggedIn()) {
        return;
    }
    a = $.ajax({
        url: URL + '/deleteFavorite',
        method: "GET",
        data: {
            username: getCookie("username"),
            session: getCookie("session"),
            stock: ticker
        }
    }).done(function (data) {
        // Add favorite to session storage
        let existingFavorites = sessionStorage.getItem("favorites").split(',');
        let newFavorites = "";
        for (const favorite of existingFavorites) {
            newFavorites += favorite == ticker || favorite == "" ? "" : favorite + ",";
        }
        sessionStorage.setItem("favorites", newFavorites)
        displayFavorites();
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function loadExchanges() {
    let exchanges = sessionStorage.getItem("exchanges");
    if (exchanges == null) {
        exchanges = "";
        try {
            a = $.ajax({
                url: API_URL + '/v3/reference/exchanges?apiKey=' + API_KEY,
                method: "GET",
                data: {
                    asset_class: "stocks",
                    locale: "us"
                }
            }).done(function (data) {
                // Handle JSON Response
                if (data.status == "ERROR") {
                    setTimeout(() => { loadExchanges() }, "1000");
                    swapKeys();
                } else {
                    let length = data['results'].length;
                    for (let i = 0; i < length; i++) {
                        let result = data['results'][i];
                        let exchange = "<option value ='" + result.operating_mic + "'>" + result.name + "</option>";
                        exchanges += exchange;
                    }
                    sessionStorage.setItem("exchanges", exchanges);
                    $("#exchanges").html(exchanges);
                }
            }).fail(function (error) {
                setTimeout(() => { loadExchanges() }, "1000");
                swapKeys();
            });
        } catch (error) {
            setTimeout(() => { loadExchanges() }, "1000");
            swapKeys();
        }
    } else {
        $("#exchanges").html(exchanges);
    }
}

function loadTickers() {
    let exchange = $("#exchanges").val();
    let tickers = sessionStorage.getItem(exchange);

    $("#stocks").html("");
    if (tickers == null) {
        // Call Polygon API
        tickers = "";
        try {
            a = $.ajax({
                url: API_URL + '/v3/reference/tickers?apiKey=' + API_KEY,
                method: "GET",
                data: {
                    exchange: exchange,
                    market: "stocks",
                    active: "true",
                    limit: "500",
                    sort: "composite_figi"
                }
            }).done(function (data) {
                // Handle JSON Response
                if (data.status == "ERROR") {
                    setTimeout(() => { loadTickers() }, "1000");
                    swapKeys();
                } else {
                    let fullNames = sessionStorage.getItem("names");
                    if (fullNames == null) {
                        fullNames = {};
                    } else {
                        fullNames = JSON.parse(fullNames);
                    }
                    let length = data['results'].length;
                    for (let i = 0; i < length; i++) {
                        let result = data['results'][i];
                        tickers += result.ticker + ","
                        fullNames[result.ticker] = result.name;
                    }
                    sessionStorage.setItem(exchange, tickers);
                    sessionStorage.setItem("names", JSON.stringify(fullNames));
                    let tickerList = tickers.split(",");
                    for (const ticker of tickerList) {
                        tickers += "<option value ='" + ticker + "'>" + ticker + "</option>";
                    }

                    $("#stocks").html(tickers);
                    if ($("#details").html() == "") {
                        updateSelected($("#stocks").val());
                    }
                }
            }).fail(function (error) {
                setTimeout(() => { loadTickers() }, "1000");
                swapKeys();
            });
        } catch (error) {
            setTimeout(() => { loadTickers() }, "1000");
            swapKeys();
        }
    } else {
        let tickerList = tickers.split(",");
        tickers = "";
        for (const ticker of tickerList) {
            tickers += "<option value ='" + ticker + "'>" + ticker + "</option>";
        }
        $("#stocks").html(tickers);
        if ($("#details").html() == "") {
            updateSelected($("#stocks").val());
        }
    }
    $(".stocks").show();
}

function loadSecondaryDetails(tickers, prevDate) {
    try {
        date = getLastTradeDay(prevDate, false);
        a = $.ajax({
            url: API_URL + '/v2/aggs/grouped/locale/us/market/stocks/' + date.toISOString().split('T')[0],
            method: "GET",
            data: {
                apiKey: API_KEY,
                adjusted: true
            }
        }).done(function (data) {
            // Handle JSON Response
            if (data.status == "ERROR") {
                setTimeout(() => { loadSecondaryDetails(tickers) }, "1000");
                swapKeys();
            } else {
                // Filter out items where name is in the list of names to filter for
                let filteredData = data.results.filter(item => tickers.split(",").includes(item.T));

                // Output the filtered data
                for (const favorite of filteredData) {
                    let existingData = JSON.parse(sessionStorage.getItem(favorite.T));
                    existingData.prevC = favorite.c;
                    sessionStorage.setItem(favorite.T, JSON.stringify(existingData));
                    displayFavoriteDetails(favorite.T);
                }
            }
        }).fail(function (error) {
            setTimeout(() => { loadSecondaryDetails(tickers) }, "1000");
            swapKeys();
        });
    } catch (error) {
        setTimeout(() => { loadSecondaryDetails(tickers) }, "1000");
        swapKeys();
    }
}

function loadDetails(tickers) {
    try {
        let date = getLastTradeDay(new Date(), true);
        a = $.ajax({
            url: API_URL + '/v2/aggs/grouped/locale/us/market/stocks/' + date.toISOString().split('T')[0],
            method: "GET",
            data: {
                apiKey: API_KEY,
                adjusted: true
            }
        }).done(function (data) {
            // Handle JSON Response
            if (data.status == "ERROR") {
                setTimeout(() => { loadDetails(tickers) }, "1000");
                swapKeys();
            } else {
                // Filter out items where name is in the list of names to filter for
                let filteredData = data.results.filter(item => tickers.split(",").includes(item.T));

                // Output the filtered data
                for (const favorite of filteredData) {
                    sessionStorage.setItem(favorite.T, JSON.stringify(favorite));
                }
                loadSecondaryDetails(tickers, date);
            }
        }).fail(function (error) {
            setTimeout(() => { loadDetails(tickers) }, "1000");
            swapKeys();
        });
    } catch (error) {
        setTimeout(() => { loadDetails(tickers) }, "1000");
        swapKeys();
    }
}

function getLastTradeDay(date, adjusted = true) {
    date.setDate(date.getDate() - 1);
    if (date.getDay() == 0) {
        date.setDate(date.getDate() - 2);
    } else if (date.getDay() == 6) {
        date.setDate(date.getDate() - 1);
    }
    if (adjusted) {
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    }
    return date;
}

/*All favorite stocks display on screen as list with summary about stock
a. ticker symbol
b. name
c. last open, high, low, and close prices
d. % difference compared to previous closing date (with up/down indicator)
e. Volume (amount of stock traded)*/

function displayFavoriteDetails(ticker) {
    $("#sort").show();
    let details = JSON.parse(sessionStorage.getItem(ticker));
    let diff = (((details.c - details.prevC) / details.prevC) * 100).toFixed(2);
    let time = isNaN(diff) ? 1000 : 0;
    setTimeout(() => {
        if (time != 0) {
            details = JSON.parse(sessionStorage.getItem(ticker));
            diff = (((details.c - details.prevC) / details.prevC) * 100).toFixed(2);
        }
        $("#" + ticker + " .details").html(`<i>${JSON.parse(sessionStorage.getItem("names"))[ticker]}</i> <br>
        Open: $${details.o} <br>
        High: $${details.h} <br>
        Low: $${details.l} <br>
        Close: $${details.c} <br>
        Difference: ${diff}% <img src="` + (diff >= 0 ? `resources/greentriangle.png` : `resources/redtriangle.png`) + `" height=15px width=15px> <br> 
        Volume: ${details.v}`);
    }, time);

}

function loadNews(ticker) {
    let id = "#news";

    let news = sessionStorage.getItem(ticker + "_news");
    // no news, call API for details
    if (news == null) {
        try {
            a = $.ajax({
                url: API_URL + '/v2/reference/news?apiKey=' + API_KEY,
                method: "GET",
                data: {
                    ticker: ticker
                }
            }).done(function (data) {
                // Handle JSON Response
                if (data.status == "ERROR") {
                    setTimeout(() => { loadNews(ticker) }, "1000");
                    swapKeys();
                } else {
                    $("#newsTitle").html("Latest News on " + ticker);
                    $(id).html("");
                    let articles = data.results.slice(0, NUM_ARTICLES);
                    for (let i = 0; i < articles.length; i++) {
                        let article = articles[i];
                        $(id).append(`<div class="outlined-container full-width" id='${ticker}_${i}'>
                    <b><u>${article.title}</b></u><br>
                    ${new Date(article.published_utc).toISOString().split('T')[0]} - ${article.publisher.homepage_url.split("/")[2]}
                    </div>`);
                    }
                    sessionStorage.setItem(ticker + "_news", JSON.stringify(articles));
                }
            }).fail(function (error) {
                setTimeout(() => { loadNews(ticker) }, "1000");
                swapKeys();
            });
        } catch (exception) {
            setTimeout(() => { loadNews(ticker) }, "1000");
            swapKeys();
        }
    } else {
        data = JSON.parse(news);
        $("#newsTitle").html("Latest News on " + ticker);
        $(id).html("");
        for (let i = 0; i < data.length; i++) {
            let article = data[i];
            $(id).append(`<div class="outlined-container full-width" id='${ticker}_${i}'>
                        <b><u>${article.title}</b></u><br>
                        ${new Date(article.published_utc).toISOString().split('T')[0]} - ${article.publisher.homepage_url.split("/")[2]}
                        </div>`);
        }
    }
}

function selectedDetails(ticker) {
    let details = JSON.parse(sessionStorage.getItem(ticker + "_selected"));
    if (details == null) {
        let to = getLastTradeDay(new Date());
        let from = new Date(to);
        for (let i = 0; i < 5; i++) {
            from = getLastTradeDay(from, false);
        }
        try {
            a = $.ajax({
                url: API_URL + '/v2/aggs/ticker/' + ticker + '/range/1/day/' + from.toISOString().split('T')[0] + '/' + to.toISOString().split('T')[0],
                method: "GET",
                data: {
                    apiKey: API_KEY,
                    limit: "120",
                    sort: "asc",
                    adjusted: "true"
                }
            }).done(function (data) {
                // Handle JSON Response
                if (data.status == "ERROR") {
                    setTimeout(() => { selectedDetails(ticker) }, "1000");
                    swapKeys();
                } else {
                    data.from = from;
                    data.to = to;
                    $('#selectedStock').removeClass('hiddenContainer').addClass('visibleContainer');
                    $("#selectedStock #title").html(`<u><b>${ticker}</b> - <i>${JSON.parse(sessionStorage.getItem("names"))[ticker]}</i></u> <br>`);

                    let date = new Date(from);
                    if (date.getDay() == 5) {
                        date.setDate(date.getDate() + 3);
                    } else if (date.getDay() == 6) {
                        date.setDate(date.getDate() + 2);
                    } else {
                        date.setDate(date.getDate() + 1);
                    }
                    $("#selectedStock #details").html("");
                    for (let i = 1; i < data.results.length; i++) {
                        let diff = (((data.results[i].c - data.results[i - 1].c) / data.results[i - 1].c) * 100).toFixed(2);

                        $("#selectedStock #details").append(`<div class="outlined-container">
                            <div class="date-div">${date.toISOString().split('T')[0]}</div>
                            Open: $${data.results[i].o} <br>
                            High: $${data.results[i].h} <br>
                            Low: $${data.results[i].l} <br>
                            Close: $${data.results[i].c} <br>
                            Difference: ${diff}% <img src="` + (diff >= 0 ? `resources/greentriangle.png` : `resources/redtriangle.png`) + `" height=15px width=15px> <br> 
                            Volume: ${data.results[i].v}</div>`);
                        if (date.getDay() == 5) {
                            date.setDate(date.getDate() + 3);
                        } else if (date.getDay() == 6) {
                            date.setDate(date.getDate() + 2);
                        } else {
                            date.setDate(date.getDate() + 1);
                        }
                    }
                    sessionStorage.setItem(ticker + "_selected", JSON.stringify(data));
                    createGraph(ticker, to);
                }
            }).fail(function (error) {
                setTimeout(() => { selectedDetails(ticker) }, "1000");
                swapKeys();
            });
        } catch (error) {
            setTimeout(() => { selectedDetails(ticker) }, "1000");
            swapKeys();
        }
    } else {
        $('#selectedStock').removeClass('hiddenContainer').addClass('visibleContainer');
        $("#selectedStock #title").html(`<u><b>${ticker}</b> - <i>${JSON.parse(sessionStorage.getItem("names"))[ticker]}</i></u> <br>`);

        let date = new Date(details.from);
        if (date.getDay() == 5) {
            date.setDate(date.getDate() + 3);
        } else if (date.getDay() == 6) {
            date.setDate(date.getDate() + 2);
        } else {
            date.setDate(date.getDate() + 1);
        }
        $("#selectedStock #details").html("");
        for (let i = 1; i < details.results.length; i++) {
            let diff = (((details.results[i].c - details.results[i - 1].c) / details.results[i - 1].c) * 100).toFixed(2);

            $("#selectedStock #details").append(`<div class="outlined-container">
                <div class="date-div">${date.toISOString().split('T')[0]}</div>
                Open: $${details.results[i].o} <br>
                High: $${details.results[i].h} <br>
                Low: $${details.results[i].l} <br>
                Close: $${details.results[i].c} <br>
                Difference: ${diff}% <img src="` + (diff >= 0 ? `resources/greentriangle.png` : `resources/redtriangle.png`) + `" height=15px width=15px> <br> 
                Volume: ${details.results[i].v}</div>`);
            if (date.getDay() == 5) {
                date.setDate(date.getDate() + 3);
            } else if (date.getDay() == 6) {
                date.setDate(date.getDate() + 2);
            } else {
                date.setDate(date.getDate() + 1);
            }
        }
        createGraph(ticker, new Date(details.to));
    }
}

function createGraph(ticker, to) {
    // class="d-none d-md-block"
    $("#chart-div").html('<canvas id="chart" ></canvas>');
    let dates = [];
    for (let date = to, numDays = 0; numDays < 5; date.setDate(date.getDate() - 1)) {
        if (date.getDay() != 6 && date.getDay() != 0) {
            dates.push(date.toDateString().split(" ")[0]/*toISOString().split('T')[0]*/);
            numDays++;
        }
    }
    dates.reverse();
    let data = JSON.parse(sessionStorage.getItem(ticker + "_selected")).results;
    let yValues = [data[1].c, data[2].c, data[3].c, data[4].c, data[5].c];

    let max = Math.max(...yValues);
    max += max * 0.005;

    let min = Math.min(...yValues);
    min *= 0.9;


    var chart = new Chart("chart", {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                backgroundColor: "rgba(72,61,139,0.5)",
                borderColor: "rgba(72,61,139,1.0)",
                data: yValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            scales: {
                yAxes: [{
                    ticks: {
                        max: Math.ceil(max),
                    },
                    gridLines: {
                        drawBorder: true // Show y-axis border
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: false, // Remove x-axis gridlines
                        drawBorder: true // Show x-axis border
                    }
                }]
            }
        }
    });


    loadNews(ticker);
}

/*
everything known about this stock
b. last 5 trading days (not calendar) of open, low, high and closing stock price + %
change from previous day
c. 5 day chart
d. news articles (max 5) including a clickable preview of each article
*/
function updateSelected(ticker) {
    selectedDetails(ticker);
}

function displayArticle(id) {
    let ticker = id.split("_")[0];
    let index = id.split("_")[1];

    let article = JSON.parse(sessionStorage.getItem(ticker + "_news"))[index];
    $("#newsModalLabel").html(article.title);
    $("#newsModal .modal-body").html(`
                                    <br><div style="text-align: center;"><img src="${article.image_url}" alt="Image From Article '${article.title}'" class="full-width rounded-image"></img><br><br>${article.description}</div>
                                    <br><i> By ${article.author} , on ${new Date(article.published_utc).toISOString().split('T')[0]}</i><br>
                                    <i> Published by ${article.publisher.name} - ${article.publisher.homepage_url.split("/")[2]}</i><br>
                                `);
    $("#newsModal a").attr("href", article.article_url);
    $('#newsModal').modal('show');
}

function getHistory() {
    let func = $('input[name=radio]:checked').val();

    if (func == "list") {
        getList();
    } else {
        let startDate = $("#startDate").val();
        startDate = startDate == "" ? "none" : startDate + " 00:00:00";
        let endDate = $("#endDate").val();
        endDate = endDate == "" ? "none" : endDate + " 23:59:59";

        let exclude = "none;"
        if (func == "added") {
            exclude = "delete";
        } else if (func == "removed") {
            exclude = "add";
        }
        // PHP API Call -- AJAX
        a = $.ajax({
            url: URL + '/listChanges',
            method: "GET",
            data: {
                username: getCookie("username"),
                session: getCookie("session"),
                start: startDate,
                end: endDate
            }
        }).done(function (data) {
            // Handle JSON Response
            $("#sort").show();
            $("#sort").removeClass("flipped-image");
            $("#results").html("");
            $("#historyLabel").html("Changes History");

            let count = 0;
            for (const result of data.results) {
                if (result.function != exclude) {
                    count++;
                    $("#results").append(`<div class="outlined-container full-width">
                    <u><b>${result.stock}</b> - <i>${result.name}</i></u> <br>
                    ${result.function == "add" ? "Added" : "Removed"} on ${result.time.split(" ")[0]} at ${result.time.split(" ")[1]}<br>
                    </div>`);
                }
            }
            if (count == 0) {
                switch (func) {
                    case 'added':
                        $("#results").append("No Favorites Added In Selected Time Period");
                        break;
                    case 'removed':
                        $("#results").append("No Favorites Removed In Selected Time Period");
                        break;
                    case 'all_changes':
                        $("#results").append("No Changes In Selected Time Period");
                        break;
                }
            }
            $("#results").removeClass('hiddenContainer').addClass('visibleContainer');
        }).fail(function (error) {
            console.log("error", error.statusText);
        });
    }
}

function getList() {

    let date = $("#date").val();
    date = date == "" ? "none" : date + " 23:59:59";

    // PHP API Call -- AJAX
    a = $.ajax({
        url: URL + '/getFavorites',
        method: "GET",
        data: {
            username: getCookie("username"),
            session: getCookie("session"),
            date: date
        }
    }).done(function (data) {
        // Handle JSON Response.
        $("#sort").show();
        $("#results").html("");
        $("#historyLabel").html("Favorites List");
        $("#sort").removeClass("flipped-image");
        if (data.results.length == 0) {
            $("#results").append("No Favorites Found For Selected Date");
        }
        for (const result of data.results) {
            $("#results").append(`<div class="outlined-container full-width">
            <u><b>${result.stock}</b> - <i>${result.name}</i></u> <br>
            Added on ${result.time.split(" ")[0]} at ${result.time.split(" ")[1]}<br>
            </div>`);
        }
        $("#results").removeClass('hiddenContainer').addClass('visibleContainer');
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function flipSort(id) {
    let childDivs = $(id).children();

    for (let i = childDivs.length; i >= 0; i--) {
        $(id).append(childDivs[i]);
    }
}

function refreshButtons() {
    // On page open, check if logged in
    if (!loggedIn()) {
        $("#logout").hide();
        $("#login").show();
        $("#signUp").show();
    } else {
        $("#logout").show();
        $("#login").hide();
        $("#signUp").hide();
    }
}

function refreshDates() {
    $('input[type=date]').val('');
    $('input[type=date]').attr('max', new Date().toISOString().split("T")[0]);
    $('input[type=date]').removeAttr('min');
}
