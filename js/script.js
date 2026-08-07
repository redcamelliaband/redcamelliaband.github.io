// =========================================================
// MUSIC CAROUSEL
// =========================================================

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

const carousel =
    document.querySelector(".release-carousel");

const musicLinks =
    document.querySelectorAll('a[href="#music"]');


let currentSlide = 0;
let autoPlay = null;

let isDragging = false;
let dragDirectionLocked = false;
let isHorizontalDrag = false;

let dragStartX = 0;
let dragStartY = 0;
let dragCurrentX = 0;

const swipeThreshold = 0.18;


// =========================================================
// POSITION SLIDES
// =========================================================

function positionSlides(offset = 0, animate = true) {

    if (!carousel || !slides.length) return;

    const carouselWidth = carousel.clientWidth;

    slides.forEach((slide, index) => {

        const slideOffset =
            (index - currentSlide) * carouselWidth + offset;

        slide.style.transition = animate
            ? "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)"
            : "none";

        slide.style.transform =
            `translate3d(${slideOffset}px, 0, 0)`;

    });

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

    currentSlide = Math.max(
        0,
        Math.min(index, slides.length - 1)
    );

    positionSlides(0, animate);
    updateDots();

}


// =========================================================
// NAVIGATION
// =========================================================

function previousSlide() {

    if (currentSlide > 0) {
        showSlide(currentSlide - 1);
    } else {
        showSlide(currentSlide);
    }

}


function nextSlide() {

    if (currentSlide < slides.length - 1) {
        showSlide(currentSlide + 1);
    } else {
        showSlide(currentSlide);
    }

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

        const nextIndex =
            (currentSlide + 1) % slides.length;

        showSlide(nextIndex);

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

        stopAutoPlay();

        showSlide(0);

        startAutoPlay();

    });

});


// =========================================================
// ARROWS
// =========================================================

previousButton?.addEventListener("click", (event) => {

    event.preventDefault();
    event.stopPropagation();

    previousSlide();
    restartAutoPlay();

});


nextButton?.addEventListener("click", (event) => {

    event.preventDefault();
    event.stopPropagation();

    nextSlide();
    restartAutoPlay();

});


// =========================================================
// DOTS
// =========================================================

dots.forEach((dot, index) => {

    dot.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        showSlide(index);

        restartAutoPlay();

    });

});


// =========================================================
// DESKTOP CLICK NAVIGATION
// =========================================================

carousel?.addEventListener("click", (event) => {

    /*
       Don't treat a touch-generated click as carousel
       navigation immediately after dragging.
    */

    if (isDragging) return;

    if (event.target.closest("a, button")) return;

    /*
       Only use click-half navigation on devices with a
       mouse/trackpad rather than touch-first devices.
    */

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

});


// =========================================================
// TOUCH DRAG
// =========================================================

carousel?.addEventListener(
    "touchstart",
    (event) => {

        if (event.touches.length !== 1) return;

        stopAutoPlay();

        isDragging = true;
        dragDirectionLocked = false;
        isHorizontalDrag = false;

        dragStartX =
            event.touches[0].clientX;

        dragStartY =
            event.touches[0].clientY;

        dragCurrentX = dragStartX;

    },
    { passive: true }
);


// =========================================================
// TOUCH MOVE — FOLLOW FINGER
// =========================================================

carousel?.addEventListener(
    "touchmove",
    (event) => {

        if (!isDragging) return;

        const touch = event.touches[0];

        const deltaX =
            touch.clientX - dragStartX;

        const deltaY =
            touch.clientY - dragStartY;


        /*
           Wait for enough movement before deciding whether
           the user means horizontal carousel navigation or
           normal vertical page scrolling.
        */

        if (!dragDirectionLocked) {

            if (
                Math.abs(deltaX) < 8 &&
                Math.abs(deltaY) < 8
            ) {
                return;
            }

            dragDirectionLocked = true;

            isHorizontalDrag =
                Math.abs(deltaX) > Math.abs(deltaY);

        }


        /*
           Vertical gesture:
           leave everything to the browser.
        */

        if (!isHorizontalDrag) return;


        /*
           Horizontal gesture:
           stop Safari/page movement and physically move
           the carousel with the finger.
        */

        event.preventDefault();

        dragCurrentX = touch.clientX;

        let dragOffset =
            dragCurrentX - dragStartX;


        /*
           Resistance at the beginning/end.

           This gives the carousel a small elastic feel
           instead of allowing an empty screen to appear.
        */

        const draggingPastFirst =
            currentSlide === 0 &&
            dragOffset > 0;

        const draggingPastLast =
            currentSlide === slides.length - 1 &&
            dragOffset < 0;

        if (
            draggingPastFirst ||
            draggingPastLast
        ) {

            dragOffset *= 0.22;

        }


        /*
           No animation while the finger is down.
           The slides directly follow the finger.
        */

        positionSlides(dragOffset, false);

    },
    { passive: false }
);


// =========================================================
// FINISH TOUCH
// =========================================================

function finishCarouselDrag() {

    if (!isDragging) return;

    const dragDistance =
        dragCurrentX - dragStartX;

    const carouselWidth =
        carousel?.clientWidth || window.innerWidth;

    const requiredDistance =
        carouselWidth * swipeThreshold;


    /*
       Only change slide if this was actually a
       horizontal gesture.
    */

    if (isHorizontalDrag) {

        if (
            dragDistance < -requiredDistance &&
            currentSlide < slides.length - 1
        ) {

            currentSlide += 1;

        } else if (
            dragDistance > requiredDistance &&
            currentSlide > 0
        ) {

            currentSlide -= 1;

        }

    }


    /*
       Snap everything into its final position.
    */

    positionSlides(0, true);
    updateDots();


    isDragging = false;
    dragDirectionLocked = false;
    isHorizontalDrag = false;

    dragStartX = 0;
    dragStartY = 0;
    dragCurrentX = 0;

    restartAutoPlay();

}


carousel?.addEventListener(
    "touchend",
    finishCarouselDrag,
    { passive: true }
);


carousel?.addEventListener(
    "touchcancel",
    finishCarouselDrag,
    { passive: true }
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

window.addEventListener("resize", () => {

    positionSlides(0, false);

});


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
    { passive: true }
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
// ESC KEY
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