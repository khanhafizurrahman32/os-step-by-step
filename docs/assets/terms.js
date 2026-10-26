// Glossary terms: on desktop, Material shows the definition when you hover a term.
// Phones have no hover, so tapping a term opens a small popup with its definition.
(function () {
  var touch = window.matchMedia("(hover: none)").matches;
  var pop = null;

  function close() {
    if (pop) { pop.remove(); pop = null; }
  }

  function open(el) {
    close();
    var text = el.getAttribute("title") || el.getAttribute("data-term");
    if (!text) return;
    pop = document.createElement("div");
    pop.className = "term-pop";
    pop.setAttribute("role", "tooltip");
    var head = document.createElement("strong");
    head.textContent = el.textContent;
    pop.appendChild(head);
    pop.appendChild(document.createElement("br"));
    pop.appendChild(document.createTextNode(text));
    document.body.appendChild(pop);
    var r = el.getBoundingClientRect();
    var w = pop.offsetWidth;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    var top = r.bottom + 8;
    if (top + pop.offsetHeight > window.innerHeight - 8) top = r.top - pop.offsetHeight - 8;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  document$.subscribe(function () {
    close();
    document.querySelectorAll("article abbr[title]").forEach(function (el) {
      el.setAttribute("tabindex", "0");
      if (touch) {
        // keep the text but stop the browser/Material from showing a second tooltip
        el.setAttribute("data-term", el.getAttribute("title"));
        el.removeAttribute("title");
      }
    });
  });

  if (touch) {
    document.addEventListener("click", function (e) {
      var el = e.target.closest && e.target.closest("article abbr[data-term]");
      if (el) { e.preventDefault(); open(el); } else { close(); }
    });
    window.addEventListener("scroll", close, { passive: true });
  }
})();
