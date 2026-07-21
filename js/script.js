// =========================
// MUSIC CAROUSEL
// =========================

const slides = document.querySelectorAll(".release-slide");
const dots = document.querySelectorAll(".carousel-dot");
const previousButton = document.querySelector(".carousel-arrow-left");
const nextButton = document.querySelector(".carousel-arrow-right");
const carousel = document.querySelector(".release-carousel");
const musicLinks = document.querySelectorAll('a[href="#music"]');

let currentSlide = 0;
let autoPlay = null;

// -------------------------
// Show slide
// -------------------------

function showSlide(index) {

    if (!slides.length) return;

    currentSlide = Math.max(
        0,
        Math.min(index, slides.length - 1)
    );

    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle(
            "active",
            slideIndex === currentSlide
        );
    });

    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle(
            "active",
            dotIndex === currentSlide
        );
    });

}

// -------------------------
// Navigation
// -------------------------

function previousSlide() {

    if (currentSlide > 0) {
        showSlide(currentSlide - 1);
    }

}

function nextSlide() {

    if (currentSlide < slides.length - 1) {
        showSlide(currentSlide + 1);
    }

}

// -------------------------
// Autoplay
// -------------------------

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

        if (currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1);
        } else {
            stopAutoPlay();
        }

    }, 8000);

}

function restartAutoPlay() {

    stopAutoPlay();
    startAutoPlay();

}

// -------------------------
// Music navigation links
// -------------------------

musicLinks.forEach((link) => {

    link.addEventListener("click", () => {

        stopAutoPlay();
        showSlide(0);
        startAutoPlay();

    });

});

// -------------------------
// Arrow buttons
// -------------------------

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

// -------------------------
// Dots
// -------------------------

dots.forEach((dot, index) => {

    dot.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        showSlide(index);
        restartAutoPlay();

    });

});

// -------------------------
// Click anywhere on slide
// -------------------------

carousel?.addEventListener("click", (event) => {

    if (event.target.closest("a, button")) return;

    const carouselBounds = carousel.getBoundingClientRect();
    const clickPosition = event.clientX - carouselBounds.left;

    if (clickPosition < carouselBounds.width / 2) {
        previousSlide();
    } else {
        nextSlide();
    }

    restartAutoPlay();

});

// -------------------------
// Pause autoplay on hover
// -------------------------

carousel?.addEventListener("mouseenter", stopAutoPlay);
carousel?.addEventListener("mouseleave", startAutoPlay);

// -------------------------
// Initialise
// -------------------------

showSlide(0);
startAutoPlay();

// =========================
// THUMBNAIL VIDEO LIGHTBOX
// =========================

const videoThumbnails = document.querySelectorAll(".video-thumbnail");
const lightbox = document.getElementById("video-lightbox");
const lightboxPlayer = document.getElementById("video-lightbox-player");
const closeButton = document.querySelector(".video-lightbox-close");

function openVideoLightbox(videoId) {

    if (!lightbox || !lightboxPlayer || !videoId) return;

    lightboxPlayer.src =
        `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}

function closeVideoLightbox() {

    if (!lightbox || !lightboxPlayer) return;

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");

    lightboxPlayer.src = "";
    document.body.style.overflow = "";

}

videoThumbnails.forEach((thumbnail) => {

    thumbnail.addEventListener("click", () => {

        openVideoLightbox(thumbnail.dataset.videoId);

    });

});

closeButton?.addEventListener("click", closeVideoLightbox);

lightbox?.addEventListener("click", (event) => {

    if (event.target === lightbox) {
        closeVideoLightbox();
    }

});

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        lightbox?.classList.contains("active")
    ) {
        closeVideoLightbox();
    }

});

// =========================
// FEATURED VIDEO
// =========================

const featuredVideo = document.querySelector(".featured-video-cover");

featuredVideo?.addEventListener("click", () => {

    const videoId = featuredVideo.dataset.videoId;

    if (!videoId) return;

    featuredVideo.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1"
            title="Trembling by Red Camellia"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
        ></iframe>
    `;

});

// =========================
// HEADER
// =========================

const header = document.querySelector(".site-header");
const heroWordmark = document.querySelector(".hero-logo");

function updateHeader() {

    if (!header || !heroWordmark) return;

    const wordmarkBottom =
        heroWordmark.getBoundingClientRect().bottom;

    header.classList.toggle(
        "scrolled",
        wordmarkBottom <= 0
    );

}

window.addEventListener("scroll", updateHeader, {
    passive: true
});

window.addEventListener("resize", updateHeader);

updateHeader();

// =========================
// MOBILE MENU
// =========================

const mobileMenuButton =
    document.querySelector(".mobile-menu-button");

const mobileMenu =
    document.querySelector(".mobile-menu");

const mobileMenuLinks =
    document.querySelectorAll(".mobile-menu a");

let touchStartX = 0;
let touchStartY = 0;

function openMobileMenu() {

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.classList.add("active");
    mobileMenu.classList.add("active");

    mobileMenuButton.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");

    document.body.classList.add("mobile-menu-open");

}

function closeMobileMenu() {

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.classList.remove("active");
    mobileMenu.classList.remove("active");

    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");

    document.body.classList.remove("mobile-menu-open");

}

// -------------------------
// Hamburger button
// -------------------------

mobileMenuButton?.addEventListener("click", (event) => {

    event.stopPropagation();

    if (mobileMenu.classList.contains("active")) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }

});

// -------------------------
// Tap background to close
// -------------------------

mobileMenu?.addEventListener("click", (event) => {

    // Ignore taps on links, buttons or icons

    if (event.target.closest("a, button")) return;

    closeMobileMenu();

});

// -------------------------
// Close after clicking links
// -------------------------

mobileMenuLinks.forEach((link) => {

    link.addEventListener("click", () => {

        closeMobileMenu();

    });

});

// -------------------------
// ESC key
// -------------------------

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        mobileMenu.classList.contains("active")
    ) {
        closeMobileMenu();
    }

});

// =========================
// SWIPE RIGHT TO OPEN MENU
// =========================

let startX = 0;
let startY = 0;

document.addEventListener("touchstart", (event) => {

    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;

}, { passive: true });

document.addEventListener("touchend", (event) => {

    // Menu already open
    if (mobileMenu.classList.contains("active")) return;

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Ignore mostly vertical swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // Ignore browser back gesture area
    if (startX < 35) return;

    if (startX > window.innerWidth * 0.5) return;

    // Require a deliberate swipe
    if (deltaX > 90) {
        openMobileMenu();
    }

}, { passive: true });