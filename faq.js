function toggleFaq(element) {
  const faqItem = element.parentElement;
  const isActive = faqItem.classList.contains("active");

  // Close all FAQ items
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Open clicked item if it wasn't active
  if (!isActive) {
    faqItem.classList.add("active");
  }
}

// Add smooth scrolling for footer links
document.querySelectorAll("footer a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    // Add your navigation logic here
  });
});
