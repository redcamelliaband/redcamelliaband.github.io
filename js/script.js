// =========================================================
// MUSIC CAROUSEL
// =========================================================

const carousel =
    document.querySelector(".release-carousel");

const track =
    document.querySelector(".release-track");

const slides = Array.from(
    document.querySelectorAll(".release-slide")
);

const dots = Array.from(
    document.querySelectorAll(".carousel-dot")
);

const previousButton =
    document.querySelector(".carousel-arrow-left");

const nextButton =
    document.querySelector(".carousel-arrow-right");

const musicLinks =
    document.querySelectorAll('a[href="#music"]');


let currentSlide = 0;
let autoPlay = null;

let isDragging = false;
let directionLocked = false;
let horizontalDrag = false;

let startX = 0;
let startY = 0;
let currentX = 0;

const swipeThreshold = 0.18;


// =========================================================
// TRACK POSITION
// =========================================================

function setTrackPosition(
    pixelOffset = 0,
    animate = true
) {

    if (!carousel || !track) {
        return;
    }

    const width =
        carousel.clientWidth;

    const position =
        -(currentSlide * width) + pixelOffset;


    track.style.transition =
        animate
            ? "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)"
            : "none";


    track.style.transform =
        `translate3d(${position}px, 0, 0)`;

}


// =========================================================
// UPDATE DOTS
// =========================================================

function updateDots() {

    dots.forEach((dot, index) => {

        dot.classList.toggle(
            "active",
            index === currentSlide
        );

    });

}


// =========================================================
// SHOW SLIDE
// =========================================================

function showSlide(
    index,
    animate = true
) {

    if (!slides.length) {
        return;
    }


    currentSlide =
        (index + slides.length) %
        slides.length;


    setTrackPosition(
        0,
        animate
    );


    updateDots();

}


// =========================================================
// PREVIOUS / NEXT
// =========================================================

function previousSlide() {

    showSlide(
        currentSlide - 1
    );

}


function nextSlide() {

    showSlide(
        currentSlide + 1
    );

}


// =========================================================
// AUTOPLAY
// =========================================================

function stopAutoPlay() {

    if (autoPlay === null) {
        return;
    }


    clearInterval(autoPlay);

    autoPlay = null;

}


function startAutoPlay() {

    stopAutoPlay();


    if (slides.length <= 1) {
        return;
    }


    autoPlay = setInterval(
        () => {

            nextSlide();

        },
        8000
    );

}


function restartAutoPlay() {

    stopAutoPlay();

    startAutoPlay();

}


// =========================================================
// MUSIC NAVIGATION LINK
// =========================================================

musicLinks.forEach((link) => {

    link.addEventListener(
        "click",
        () => {

            /*
               MUSIC always returns to
               the first slide: Overburning.
            */

            showSlide(0);

            restartAutoPlay();

        }
    );

});


// =========================================================
// CAROUSEL ARROWS
// =========================================================

previousButton?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();
        event.stopPropagation();


        previousSlide();

        restartAutoPlay();

    }
);


nextButton?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();
        event.stopPropagation();


        nextSlide();

        restartAutoPlay();

    }
);


// =========================================================
// CAROUSEL DOTS
// =========================================================

dots.forEach((dot, index) => {

    dot.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();


            showSlide(index);

            restartAutoPlay();

        }
    );

});


// =========================================================
// DESKTOP / TAP-SIDE NAVIGATION
// =========================================================

carousel?.addEventListener(
    "click",
    (event) => {

        if (isDragging) {
            return;
        }


        /*
           Don't change slides when the user
           clicks a button or link.
        */

        if (
            event.target.closest(
                "a, button"
            )
        ) {
            return;
        }


        const bounds =
            carousel.getBoundingClientRect();


        const clickX =
            event.clientX -
            bounds.left;


        if (
            clickX <
            bounds.width / 2
        ) {

            previousSlide();

        } else {

            nextSlide();

        }


        restartAutoPlay();

    }
);


// =========================================================
// TOUCH START
// =========================================================

carousel?.addEventListener(
    "touchstart",
    (event) => {

        if (
            event.touches.length !== 1
        ) {
            return;
        }


        stopAutoPlay();


        isDragging = true;

        directionLocked = false;

        horizontalDrag = false;


        startX =
            event.touches[0].clientX;

        startY =
            event.touches[0].clientY;

        currentX =
            startX;

    },
    {
        passive: true
    }
);


// =========================================================
// TOUCH MOVE
// =========================================================

carousel?.addEventListener(
    "touchmove",
    (event) => {

        if (!isDragging) {
            return;
        }


        const touch =
            event.touches[0];


        const deltaX =
            touch.clientX -
            startX;

        const deltaY =
            touch.clientY -
            startY;


        /*
           First determine whether the user
           intends to swipe sideways or
           scroll vertically.
        */

        if (!directionLocked) {

            if (
                Math.abs(deltaX) < 8 &&
                Math.abs(deltaY) < 8
            ) {
                return;
            }


            directionLocked = true;


            horizontalDrag =
                Math.abs(deltaX) >
                Math.abs(deltaY);

        }


        /*
           If the movement is vertical,
           leave normal page scrolling alone.
        */

        if (!horizontalDrag) {
            return;
        }


        event.preventDefault();


        currentX =
            touch.clientX;


        const dragOffset =
            currentX -
            startX;


        setTrackPosition(
            dragOffset,
            false
        );

    },
    {
        passive: false
    }
);


// =========================================================
// FINISH TOUCH DRAG
// =========================================================

function finishCarouselDrag() {

    if (!isDragging) {
        return;
    }


    const distance =
        currentX -
        startX;


    const width =
        carousel?.clientWidth ||
        window.innerWidth;


    const threshold =
        width *
        swipeThreshold;


    if (horizontalDrag) {

        if (
            distance <
            -threshold
        ) {

            currentSlide =
                (
                    currentSlide + 1
                ) %
                slides.length;

        } else if (
            distance >
            threshold
        ) {

            currentSlide =
                (
                    currentSlide -
                    1 +
                    slides.length
                ) %
                slides.length;

        }

    }


    /*
       Snap back onto the exact
       carousel position.
    */

    setTrackPosition(
        0,
        true
    );


    updateDots();


    isDragging = false;

    directionLocked = false;

    horizontalDrag = false;


    startX = 0;
    startY = 0;
    currentX = 0;


    restartAutoPlay();

}


carousel?.addEventListener(
    "touchend",
    finishCarouselDrag,
    {
        passive: true
    }
);


carousel?.addEventListener(
    "touchcancel",
    finishCarouselDrag,
    {
        passive: true
    }
);


// =========================================================
// DESKTOP HOVER
// =========================================================

carousel?.addEventListener(
    "mouseenter",
    stopAutoPlay
);


carousel?.addEventListener(
    "mouseleave",
    startAutoPlay
);


// =========================================================
// WINDOW RESIZE
// =========================================================

window.addEventListener(
    "resize",
    () => {

        setTrackPosition(
            0,
            false
        );

    }
);


// =========================================================
// ORIENTATION CHANGE
// =========================================================

window.addEventListener(
    "orientationchange",
    () => {

        setTimeout(
            () => {

                setTrackPosition(
                    0,
                    false
                );

            },
            100
        );

    }
);


// =========================================================
// INITIALISE MUSIC CAROUSEL
// =========================================================

showSlide(
    0,
    false
);


startAutoPlay();


// =========================================================
// FEATURED VIDEO
// =========================================================

const featuredVideo =
    document.querySelector(
        ".featured-video-cover"
    );


featuredVideo?.addEventListener(
    "click",
    () => {

        const videoId =
            featuredVideo.dataset.videoId;


        if (!videoId) {
            return;
        }


        /*
           Replace the Trembling cover image
           with the YouTube player.
        */

        featuredVideo.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                title="Trembling by Red Camellia"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
        `;

    }
);


// =========================================================
// ACTIVE NAVIGATION SECTION
// =========================================================

const navigationLinks =
    document.querySelectorAll(
        ".site-nav a"
    );


const navigationSections =
    document.querySelectorAll(
        "#music, #live, #video"
    );


function updateActiveNavigation() {

    /*
       Use a point roughly one-third
       down the viewport to determine
       the current section.
    */

    const viewportMarker =
        window.innerHeight *
        0.35;


    let activeSection = null;


    navigationSections.forEach(
        (section) => {

            const bounds =
                section.getBoundingClientRect();


            if (
                bounds.top <=
                    viewportMarker &&
                bounds.bottom >
                    viewportMarker
            ) {

                activeSection =
                    section.id;

            }

        }
    );


    navigationLinks.forEach(
        (link) => {

            const target =
                link.getAttribute(
                    "href"
                );


            link.classList.toggle(
                "active",
                target ===
                    `#${activeSection}`
            );

        }
    );

}


// =========================================================
// ACTIVE NAVIGATION EVENTS
// =========================================================

window.addEventListener(
    "scroll",
    updateActiveNavigation,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    updateActiveNavigation
);


updateActiveNavigation();