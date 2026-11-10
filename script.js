// ---------- Cookie helpers ----------
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const index = cookie.indexOf("=");
        if (cookie.substring(0, index) === name) {
            return decodeURIComponent(cookie.substring(index + 1));
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
}

// ---------- Initial state ----------
const INITIAL_LIKES = 100;
const INITIAL_DISLIKES = 20;
const COOKIE_DAYS = 30;

let likes = INITIAL_LIKES;
let dislikes = INITIAL_DISLIKES;
let comments = [];

// ---------- DOM elements ----------
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeCount = document.getElementById("likeCount");
const dislikeCount = document.getElementById("dislikeCount");
const commentInput = document.getElementById("commentInput");
const submitBtn = document.getElementById("submitBtn");
const commentsList = document.getElementById("commentsList");
const noComments = document.getElementById("noComments");
const resetBtn = document.getElementById("resetBtn");
const message = document.getElementById("message");

// ---------- UI ----------
function showMessage(text) {
    message.textContent = text;
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(function () {
        message.textContent = "";
    }, 3000);
}

function updateUI() {
    const vote = getCookie("vote");
    const hasCommented = getCookie("comments") !== null;

    // counters
    likeCount.textContent = likes;
    dislikeCount.textContent = dislikes;

    // voting is disabled once the user has voted
    likeBtn.disabled = vote !== null;
    dislikeBtn.disabled = vote !== null;
    likeBtn.classList.toggle("selected", vote === "like");
    dislikeBtn.classList.toggle("selected", vote === "dislike");

    // commenting is disabled once the user has commented
    commentInput.disabled = hasCommented;
    submitBtn.disabled = hasCommented;
    commentInput.placeholder = hasCommented ? "You have already commented." : "Write your comment...";

    // comments section
    commentsList.innerHTML = "";
    for (const comment of comments) {
        const li = document.createElement("li");
        li.textContent = comment; // textContent keeps user input from being parsed as HTML
        commentsList.appendChild(li);
    }
    noComments.hidden = comments.length > 0;
}

// ---------- Load stored state from cookies ----------
function loadState() {
    const vote = getCookie("vote");
    if (vote === "like") {
        likes = INITIAL_LIKES + 1;
    } else if (vote === "dislike") {
        dislikes = INITIAL_DISLIKES + 1;
    }

    const storedComments = getCookie("comments");
    if (storedComments !== null) {
        try {
            comments = JSON.parse(storedComments);
        } catch (e) {
            comments = [];
            deleteCookie("comments");
        }
    }
    updateUI();
}

// ---------- Like / Dislike ----------
function handleVote(choice) {
    if (getCookie("vote") !== null) {
        showMessage("You have already voted.");
        return;
    }
    if (choice === "like") {
        likes++;
    } else {
        dislikes++;
    }
    setCookie("vote", choice, COOKIE_DAYS);

    // restart the pop animation on the clicked button
    const btn = choice === "like" ? likeBtn : dislikeBtn;
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");

    updateUI();
}

likeBtn.addEventListener("click", function () {
    handleVote("like");
});

dislikeBtn.addEventListener("click", function () {
    handleVote("dislike");
});

// ---------- Comments ----------
function handleComment() {
    if (getCookie("comments") !== null) {
        showMessage("You have already commented.");
        return;
    }
    const text = commentInput.value.trim();
    if (text === "") {
        showMessage("Please write a comment first.");
        return;
    }
    comments.push(text);
    setCookie("comments", JSON.stringify(comments), COOKIE_DAYS);
    commentInput.value = "";
    updateUI();
}

submitBtn.addEventListener("click", handleComment);

commentInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        handleComment();
    }
});

// ---------- Reset ----------
resetBtn.addEventListener("click", function () {
    deleteCookie("vote");
    deleteCookie("comments");
    likes = INITIAL_LIKES;
    dislikes = INITIAL_DISLIKES;
    comments = [];
    commentInput.value = "";
    updateUI();
    showMessage("Your vote and comments have been reset. You can vote again.");
});

loadState();
