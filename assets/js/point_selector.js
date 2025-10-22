
const points = document.querySelectorAll(".pin1");

points.forEach(point => {
  point.addEventListener("mouseenter", () => {
    point.setAttribute("r", 10);
  });

  point.addEventListener("mouseleave", () => {
    point.setAttribute("r", 5);
  });
});
const points2 = document.querySelectorAll(".pin2");

points2.forEach(point => {
  point.addEventListener("mouseenter", () => {
    point.setAttribute("r", 10);
  });

  point.addEventListener("mouseleave", () => {
    point.setAttribute("r", 5);
  });
});
