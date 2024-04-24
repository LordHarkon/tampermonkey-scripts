// ==UserScript==
// @name             Worm v6 Backpack Exporter
// @description      Export script for interactive CYOAs.
// @match            https://ltouroumov.github.io/worm-cyoa-v6-fork/viewer/
// @match            https://*.neocities.org/*
// @match            https://*.ltouroumov.ch/*
// @updateURL        https://raw.githubusercontent.com/LordHarkon/tampermonkey-scripts/main/cyoa-backpack-exporter.user.js
// @downloadURL      https://raw.githubusercontent.com/LordHarkon/tampermonkey-scripts/main/cyoa-backpack-exporter.user.js
// @version          1.5
// @grant            GM_addStyle
// ==/UserScript==

GM_addStyle(`
.export-btn {
  border: 1px white solid;
}
.export-text {
  background: white;
  color: black;
  width: 100%;
  display: none;
}`);

function exportBackpack() {
  console.log("Exporting...");
  const exportLines = Array.from(document.querySelectorAll('.v-dialog__content--active[role=document] > .v-dialog--active .col-12 img[src=""] + h2')).map(heading => {
    const sectionExport = Array.from(heading.parentElement.parentElement.parentElement.querySelectorAll("div + .objectRow span.fullHeight")).map(entry => {
      const entryHeading = entry.querySelector("h3");
      const entryHeadingText = entryHeading.innerHTML.replace("&amp;", "&").trim();

      const entryNum = entry.querySelector("h3 + .row > .spacer + button + .spacer + div");
      const entryNumText = entryNum ? ` (x${entryNum.innerHTML})` : '';

      const subHeadings = Array.from(entry.querySelectorAll("h4")).map(sub => sub.innerHTML.trim()).join(', ');
      const subHeadingText = subHeadings ? ` (*${subHeadings}*)` : '';

      return `\`${entryHeadingText}${entryNumText}${subHeadingText}\``;
    });

    if (sectionExport.length > 0) {
      return `# ${heading.innerHTML.replace("&amp;", "&")}\n${sectionExport.join(", ")}`;
    }
  }).filter(Boolean);

  document.querySelector('.export-text').value = exportLines.join("\n");
  document.querySelector('.export-text').classList.add('d-inline-block');
}

function setupExport() {
  const backpackTop = document.querySelector(".v-card__text > .container > .row");
  const iconCSS = document.createElement("link");
  iconCSS.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
  iconCSS.rel = "stylesheet";

  const exportRow = document.createElement("div");
  exportRow.className = "row";

  const exportTextarea = document.createElement("textarea");
  exportTextarea.className = "export-text";
  exportTextarea.rows = "15";

  const icon = document.createElement("span");
  icon.id = "exportBtn";
  icon.className = "v-icon material-symbols-outlined theme--dark export-btn btn";
  icon.innerHTML = "export_notes";
  icon.addEventListener('click', exportBackpack);

  exportRow.append(exportTextarea, icon);
  backpackTop.prepend(exportRow);
  backpackTop.prepend(iconCSS);
}

function check(changes, observer) {
  const backpackButton = document.querySelector(".v-bottom-navigation .col:last-of-type .v-btn");
  if (backpackButton) {
    observer.disconnect();
    console.log("found it");
    backpackButton.addEventListener('click', setupExport);
  }
}

(new MutationObserver(check)).observe(document, {
  childList: true,
  subtree: true
});
