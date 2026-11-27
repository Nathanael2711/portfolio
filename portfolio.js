const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const elements = document.querySelectorAll(
    ".hero > *, .section h2, .project-card, .about p, .contact > *"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
}

const imageViewer = document.querySelector("#image-viewer");
const viewerStage = imageViewer.querySelector(".viewer-stage");
const viewerImage = imageViewer.querySelector(".viewer-image");
const zoomInButton = imageViewer.querySelector(".zoom-in");
const zoomOutButton = imageViewer.querySelector(".zoom-out");
const zoomResetButton = imageViewer.querySelector(".zoom-reset");
let zoom = 1;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartScrollLeft = 0;
let panStartScrollTop = 0;

function updateViewerZoom() {
  if (!viewerImage.naturalWidth) {
    return;
  }

  const fitScale = Math.min(
    viewerStage.clientWidth / viewerImage.naturalWidth,
    viewerStage.clientHeight / viewerImage.naturalHeight
  );
  viewerImage.style.width = `${viewerImage.naturalWidth * fitScale * zoom}px`;
  viewerStage.classList.toggle("is-zoomed", zoom > 1);
  zoomInButton.disabled = zoom >= 3;
  zoomOutButton.disabled = zoom <= 1;
  zoomResetButton.textContent = `${Math.round(zoom * 100)}%`;
  zoomResetButton.disabled = zoom === 1;
}

function stopPanning() {
  isPanning = false;
  viewerStage.classList.remove("is-panning");
}

document.querySelectorAll(".image-open").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    zoom = 1;
    viewerImage.src = image.currentSrc || image.src;
    viewerImage.alt = image.alt;
    imageViewer.showModal();
    updateViewerZoom();
  });
});

viewerImage.addEventListener("load", updateViewerZoom);
window.addEventListener("resize", updateViewerZoom);

viewerStage.addEventListener("pointerdown", (event) => {
  if (zoom <= 1 || event.button !== 0) {
    return;
  }

  isPanning = true;
  panStartX = event.clientX;
  panStartY = event.clientY;
  panStartScrollLeft = viewerStage.scrollLeft;
  panStartScrollTop = viewerStage.scrollTop;
  viewerStage.classList.add("is-panning");
  viewerStage.setPointerCapture(event.pointerId);
});

viewerStage.addEventListener("pointermove", (event) => {
  if (!isPanning) {
    return;
  }

  viewerStage.scrollLeft = panStartScrollLeft - (event.clientX - panStartX);
  viewerStage.scrollTop = panStartScrollTop - (event.clientY - panStartY);
});

viewerStage.addEventListener("pointerup", stopPanning);
viewerStage.addEventListener("pointercancel", stopPanning);
viewerStage.addEventListener("lostpointercapture", stopPanning);

viewerStage.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoom = Math.max(1, Math.min(3, zoom + (event.deltaY < 0 ? 0.25 : -0.25)));
  updateViewerZoom();
});

zoomInButton.addEventListener("click", () => {
  zoom = Math.min(3, zoom + 0.25);
  updateViewerZoom();
});

zoomOutButton.addEventListener("click", () => {
  zoom = Math.max(1, zoom - 0.25);
  updateViewerZoom();
});

zoomResetButton.addEventListener("click", () => {
  zoom = 1;
  updateViewerZoom();
});

imageViewer.querySelector(".viewer-close").addEventListener("click", () => {
  imageViewer.close();
});
