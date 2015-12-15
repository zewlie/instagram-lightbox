/*
Instagram Lightbox
==================

This code generates a script element to grab JSONP from Instagram's API,
which it then uses to display images (hosted on Instagram's servers) and
captions.

There are a number of events that can be triggered by users. I've tried to
provide alternate means of manipulating the DOM; for example, a user can scroll
through images either by clicking the arrows displayed in the lightbox or by
tapping the left and right keys.
*/

var modal = document.getElementById('modal-container');
var launchBtn = document.getElementById('launch-btn');
var arrows = [document.getElementById('left-arrow'), document.getElementById('right-arrow')];
var img = document.getElementById('lightbox-img');
var bScreen = document.getElementById('blackout-screen');
var closeBtn = document.getElementById('kill-modal');
var imgTitle = document.getElementById('title-text');

var url = window.location.href;
var mediaURL = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=';
var accessToken = '218568808.dfa54cc.4c4d9a0d91ff4e5ea9531e5e20f480fa';
var callback = 'grabImages';
var images = [];
var iActiveImg = 0;

// On pageload, check if the current URL is long enough to contain a user's access token.
// Otherwise, generate the API call script with the default token.
window.onload = function() {
    if (url.length > 60) {
        grabUserToken();
    } else {
    writeScript(accessToken);
    }
};

// Split the user's access token from the URL.
function grabUserToken() {
    url = url.split('=');
    var newAccessToken = url[1];

    writeScript(newAccessToken);
}

// Write a new script to call the API and insert it into the DOM.
// If a script has been previously generated, remove it first.
function writeScript(token) {
    var oldScript = document.getElementById('instagram-script');
        if (!!oldScript) {
            oldScript.parentElement.removeChild(oldScript);
        }
    var requestURL = mediaURL + token + '&callback=' + callback;

    var script = document.createElement("script");
    script.src = requestURL;
    script.id = 'instagram-script';
    document.body.appendChild(script);
}

// Callback function: grab the data-object containing useable images and captions.
var grabImages = function(data) {
    images = data.data;
};

// Set each image to the modal's background-image property; 
// this makes it easy to overlay other UI elements, e.g. nav arrows and captions.
function displayImage() {
    img.style.backgroundImage = "url('" + images[iActiveImg].images.standard_resolution.url + "')";
    // Truncate captions that are too long to fit in their allotted space.
    if (images[iActiveImg].caption.text.length > 40) {
        images[iActiveImg].caption.text = images[iActiveImg].caption.text.slice(0, 40) + '...';
    }
    imgTitle.innerHTML = '<p>' + images[iActiveImg].caption.text + '</p>';
}

// The blackout-screen and modal start out with a 'hidden' to prevent them from displaying;
// Here I empty their classes so the CSS associated with their IDs is displayed.
function launchModal(evt) {
    bScreen.className = '';
    modal.className = '';

    displayImage();
}

// When the modal is closed, both high-level elements associated with it are hidden.
function closeModal(evt) {
    bScreen.className = 'hidden';
    modal.className = 'hidden';
}

// Fixes Javascript's issues around negative numbers & modulus.
// This is just a workaround in order to get a % b.
function fixedModulus(a, b) {
    return ((a % b) + b) % b;
}

// Displays the next image when arrows are clicked or arrow keys are pressed.
// Images will loop in both directions.
function viewNextImg(evt) {
    if (evt.keyCode == '37' || this.id == 'left-arrow') {
        iActiveImg = fixedModulus(iActiveImg - 1, images.length);
    } else if (evt.keyCode == '39' || this.id == 'right-arrow') {
        iActiveImg = fixedModulus(iActiveImg + 1, images.length);
    }
    displayImage();
}

// Reduces the opacity of the nav arrows when the user isn't mousing over
// the modal window; this makes the images a little nicer to look at!
function modArrowOpacity(evt) {
    if (evt.type == 'mouseout') {
        arrows[0].className = 'subtle-arrow';
        arrows[1].className = 'subtle-arrow';

    } else if (evt.type == 'mouseover') {
        arrows[0].className = 'arrow';
        arrows[1].className = 'arrow';
    }
}

// Handles all keydown events, sending arrow keys to one function and
// 'esc' to another.
function handleKeydown(evt) {
    if (evt.keyCode == 37 || evt.keyCode == 39) {
        viewNextImg(evt);

    } else if (evt.keyCode == 27) {
        closeModal(evt);
    }
}


// Event Handlers

launchBtn.addEventListener('click', launchModal);
bScreen.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);

img.addEventListener('mouseover', modArrowOpacity);
img.addEventListener('mouseout', modArrowOpacity);

arrows[0].addEventListener('click', viewNextImg);
arrows[1].addEventListener('click', viewNextImg);
window.addEventListener("keydown", handleKeydown);

