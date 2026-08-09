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

    if (!carousel || !track) return;

    const width = carousel.clientWidth;

    const position =
        -(currentSlide * width) + pixelOffset;

    track.style.transition = animate
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

function showSlide(index, animate = true) {

    if (!slides.length) return;

    currentSlide =
        (index + slides.length) % slides.length;

    setTrackPosition(0, animate);

    updateDots();
}


// =========================================================
// NAVIGATION
// =========================================================

function previousSlide() {

    showSlide(currentSlide - 1);

}

function nextSlide() {

    showSlide(currentSlide + 1);

}


// =========================================================
// AUTOPLAY
// =========================================================

function stopAutoPlay() {

    if (autoPlay !== null) {

        clearInterval(autoPlay);

        autoPlay = null;

    }

}

function startAutoPlay() {

    stopAutoPlay();

    if (slides.length <= 1) return;

    autoPlay = setInterval(() => {

        nextSlide();

    }, 8000);

}

function restartAutoPlay() {

    stopAutoPlay();

    startAutoPlay();

}


// =========================================================
// MUSIC NAVIGATION LINKS
// =========================================================

musicLinks.forEach((link) => {

    link.addEventListener("click", () => {

        showSlide(0);

        restartAutoPlay();

    });

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

        if (isDragging) return;

        if (event.target.closest("a, button")) {
            return;
        }

        const bounds =
            carousel.getBoundingClientRect();

        const clickX =
            event.clientX - bounds.left;

        if (clickX < bounds.width / 2) {

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

        if (event.touches.length !== 1) {
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

        currentX = startX;

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

        if (!isDragging) return;

        const touch =
            event.touches[0];

        const deltaX =
            touch.clientX - startX;

        const deltaY =
            touch.clientY - startY;


        // Work out whether the user is swiping
        // horizontally or scrolling vertically.

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


        // Allow normal vertical page scrolling.

        if (!horizontalDrag) {
            return;
        }

        event.preventDefault();

        currentX = touch.clientX;

        const dragOffset =
            currentX - startX;


        // Move the entire track with the finger.

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

    if (!isDragging) return;

    const distance =
        currentX - startX;

    const width =
        carousel?.clientWidth ||
        window.innerWidth;

    const threshold =
        width * swipeThreshold;


    if (horizontalDrag) {

        if (distance < -threshold) {

            currentSlide =
                (currentSlide + 1) %
                slides.length;

        } else if (distance > threshold) {

            currentSlide =
                (
                    currentSlide -
                    1 +
                    slides.length
                ) % slides.length;

        }

    }


    // Snap onto the exact slide position.

    setTrackPosition(0, true);

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

        setTimeout(() => {

            setTrackPosition(
                0,
                false
            );

        }, 100);

    }
);


// =========================================================
// INITIALISE CAROUSEL
// =========================================================

showSlide(0, false);

startAutoPlay();


// =========================================================
// THUMBNAIL VIDEO LIGHTBOX
// =========================================================

const videoThumbnails =
    document.querySelectorAll(".video-thumbnail");

const lightbox =
    document.getElementById("video-lightbox");

const lightboxPlayer =
    document.getElementById("video-lightbox-player");

const closeButton =
    document.querySelector(".video-lightbox-close");


function openVideoLightbox(videoId) {

    if (
        !lightbox ||
        !lightboxPlayer ||
        !videoId
    ) {
        return;
    }

    lightboxPlayer.src =
        `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    lightbox.classList.add("active");

    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function closeVideoLightbox() {

    if (
        !lightbox ||
        !lightboxPlayer
    ) {
        return;
    }

    lightbox.classList.remove("active");

    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    lightboxPlayer.src = "";

    document.body.style.overflow = "";

}


videoThumbnails.forEach((thumbnail) => {

    thumbnail.addEventListener(
        "click",
        () => {

            openVideoLightbox(
                thumbnail.dataset.videoId
            );

        }
    );

});


closeButton?.addEventListener(
    "click",
    closeVideoLightbox
);


lightbox?.addEventListener(
    "click",
    (event) => {

        if (event.target === lightbox) {
            closeVideoLightbox();
        }

    }
);


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            lightbox?.classList.contains("active")
        ) {
            closeVideoLightbox();
        }

    }
);


// =========================================================
// FEATURED VIDEO
// =========================================================

const featuredVideo =
    document.querySelector(".featured-video-cover");


featuredVideo?.addEventListener(
    "click",
    () => {

        const videoId =
            featuredVideo.dataset.videoId;

        if (!videoId) return;

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
// HEADER
// =========================================================

const header =
    document.querySelector(".site-header");

const heroWordmark =
    document.querySelector(".hero-logo");


function updateHeader() {

    if (
        !header ||
        !heroWordmark
    ) {
        return;
    }

    const wordmarkBottom =
        heroWordmark
            .getBoundingClientRect()
            .bottom;

    header.classList.toggle(
        "scrolled",
        wordmarkBottom <= 0
    );

}


window.addEventListener(
    "scroll",
    updateHeader,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    updateHeader
);


updateHeader();


// =========================================================
// MOBILE MENU
// =========================================================

const mobileMenuButton =
    document.querySelector(
        ".mobile-menu-button"
    );

const mobileMenu =
    document.querySelector(
        ".mobile-menu"
    );

const mobileMenuLinks =
    document.querySelectorAll(
        ".mobile-menu a"
    );


function openMobileMenu() {

    if (
        !mobileMenuButton ||
        !mobileMenu
    ) {
        return;
    }

    mobileMenuButton.classList.add(
        "active"
    );

    mobileMenu.classList.add(
        "active"
    );

    mobileMenuButton.setAttribute(
        "aria-expanded",
        "true"
    );

    mobileMenu.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "mobile-menu-open"
    );

}


function closeMobileMenu() {

    if (
        !mobileMenuButton ||
        !mobileMenu
    ) {
        return;
    }

    mobileMenuButton.classList.remove(
        "active"
    );

    mobileMenu.classList.remove(
        "active"
    );

    mobileMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    mobileMenu.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "mobile-menu-open"
    );

}


// =========================================================
// HAMBURGER BUTTON
// =========================================================

mobileMenuButton?.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        if (
            mobileMenu.classList.contains(
                "active"
            )
        ) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }

    }
);


// =========================================================
// TAP MENU BACKGROUND TO CLOSE
// =========================================================

mobileMenu?.addEventListener(
    "click",
    (event) => {

        if (
            event.target.closest(
                "a, button"
            )
        ) {
            return;
        }

        closeMobileMenu();

    }
);


// =========================================================
// CLOSE MENU AFTER LINK
// =========================================================

mobileMenuLinks.forEach((link) => {

    link.addEventListener(
        "click",
        closeMobileMenu
    );

});


// =========================================================
// ESC KEY — MOBILE MENU
// =========================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            mobileMenu?.classList.contains(
                "active"
            )
        ) {

            closeMobileMenu();

        }

    }
);