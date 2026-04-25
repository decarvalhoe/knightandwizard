"""Parse downloaded Knight and Wizard HTML pages into structured markdown.

Variable d'environnement :
    KW_BASE_URL : URL de base du site source (par défaut vide)
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).parent
RAW = ROOT / "raw-html"
DETAILS = RAW / "details"
OUT = ROOT

BASE_URL = os.environ.get("KW_BASE_URL", "").rstrip("/")

SECTIONS = {
    "weapons-list.php": ("documents/armes", "Armes"),
    "assets-list.php": ("documents/atouts", "Atouts"),
    "levels-assets-list.php": ("documents/atouts-niveaux", "Atouts de niveaux"),
    "races-list.php": ("documents/bestiaire", "Bestiaire"),
    "classes-list.php": ("documents/classes", "Classes"),
    "skills-list.php": ("documents/competences", "Competences"),
    "spells-list.php": ("documents/grimoire", "Grand Grimoire"),
    "potions-list.php": ("documents/potions", "Potions"),
    "rules.php": ("documents/regles", "Regles"),
    "download.php": ("documents/cartes", "Cartes"),
    "dice-roller.php": ("outils/lanceur-de-des", "Lanceur de des"),
    "fight-assistant.php": ("outils/assistant-combat", "Assistant de combat"),
    "characters.php": ("personnages/mes-personnages", "Mes personnages"),
    "all-characters.php": ("personnages/tous-les-personnages", "Tous les personnages"),
    "world-map.php": ("monde/carte-du-monde", "Carte du monde"),
    "map.php": ("monde/tous-les-lieux", "Tous les lieux"),
    "my-account.php": ("compte/mon-compte", "Mon compte"),
    "add-character.php": ("outils/ajouter-personnage", "Ajouter un personnage"),
    "index.php": ("accueil", "Accueil"),
}

# --- Helpers -----------------------------------------------------------------


def load_html(path: Path) -> BeautifulSoup:
    text = path.read_text(encoding="utf-8", errors="replace")
    return BeautifulSoup(text, "lxml")


def extract_main(soup: BeautifulSoup) -> BeautifulSoup | None:
    main = soup.find(id="main")
    return main


def clean_text(node) -> str:
    if node is None:
        return ""
    txt = node.get_text("\n", strip=True)
    # collapse multiple blank lines
    return re.sub(r"\n{3,}", "\n\n", txt).strip()


def table_to_md(table) -> str:
    """Convert an HTML table into markdown. Works with simple thead/tbody."""
    rows = []
    # Use first tr as header if it has th
    first_tr = table.find("tr")
    if not first_tr:
        return ""
    header_cells = first_tr.find_all(["th", "td"])
    headers = [c.get_text(" ", strip=True) for c in header_cells]
    rows.append("| " + " | ".join(headers) + " |")
    rows.append("|" + "|".join(["---"] * len(headers)) + "|")
    for tr in table.find_all("tr")[1:]:
        cells = tr.find_all(["td", "th"])
        # Skip footer rows that duplicate header
        texts = [c.get_text(" ", strip=True).replace("\n", " ").replace("|", "\\|") for c in cells]
        if len(texts) != len(headers):
            # pad or trim
            while len(texts) < len(headers):
                texts.append("")
            texts = texts[: len(headers)]
        # Skip empty rows
        if not any(texts):
            continue
        rows.append("| " + " | ".join(texts) + " |")
    return "\n".join(rows)


def extract_tables_md(main) -> list[str]:
    tables = main.find_all("table") if main else []
    out = []
    for t in tables:
        md = table_to_md(t)
        if md:
            out.append(md)
    return out


def extract_text_content(main) -> str:
    """Extract heading/paragraph/list structure as markdown."""
    if main is None:
        return ""
    # Remove tables (we'll add them separately)
    main_copy = BeautifulSoup(str(main), "lxml")
    for t in main_copy.find_all("table"):
        t.decompose()
    for script in main_copy.find_all("script"):
        script.decompose()
    for style in main_copy.find_all("style"):
        style.decompose()
    lines: list[str] = []
    for el in main_copy.find("div", id="main").descendants if main_copy.find("div", id="main") else []:
        pass  # we'll do a different walk
    # Simpler: walk top-level children
    container = main_copy.find("div", id="main") or main_copy
    for el in container.children:
        if getattr(el, "name", None) is None:
            # NavigableString
            t = str(el).strip()
            if t:
                lines.append(t)
            continue
        name = el.name
        if name in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            level = int(name[1])
            txt = el.get_text(" ", strip=True)
            if txt:
                lines.append("\n" + "#" * level + " " + txt + "\n")
        elif name == "p":
            txt = el.get_text(" ", strip=True)
            if txt:
                lines.append(txt + "\n")
        elif name in {"ul", "ol"}:
            for li in el.find_all("li", recursive=False):
                lines.append("- " + li.get_text(" ", strip=True))
            lines.append("")
        elif name == "br":
            lines.append("")
        elif name == "div":
            # Recurse into generic divs
            sub_html = BeautifulSoup(str(el), "lxml")
            sub_main = sub_html.find("div") or sub_html
            txt = sub_main.get_text("\n", strip=True)
            if txt:
                lines.append(txt + "\n")
        else:
            txt = el.get_text(" ", strip=True)
            if txt:
                lines.append(txt + "\n")
    return "\n".join(lines).strip()


def parse_page(html_path: Path) -> dict:
    soup = load_html(html_path)
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    main = extract_main(soup)
    tables = extract_tables_md(main)
    # Simpler text extraction
    if main:
        # Remove scripts, clone, then clean
        for s in main.find_all(["script", "style"]):
            s.decompose()
        # Get plain text
        plain = clean_text(main)
    else:
        plain = ""
    return {
        "title": title,
        "text": plain,
        "tables": tables,
    }


def write_page_md(out_path: Path, parsed: dict, source_url: str) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    parts = []
    if parsed["title"]:
        parts.append(f"# {parsed['title']}\n")
    parts.append(f"Source: {source_url}\n")
    if parsed["text"]:
        parts.append("## Contenu\n\n" + parsed["text"] + "\n")
    if parsed["tables"]:
        parts.append("## Tableaux\n")
        for i, t in enumerate(parsed["tables"], 1):
            parts.append(f"### Tableau {i}\n\n" + t + "\n")
    out_path.write_text("\n".join(parts), encoding="utf-8")


# --- Page handlers -----------------------------------------------------------


def handle_main_pages() -> None:
    """Parse pages in RAW (the main section pages)."""
    for filename, (rel_dir, label) in SECTIONS.items():
        stem = filename[:-4]  # remove .php
        html = RAW / f"{stem}.html"
        if not html.exists():
            continue
        parsed = parse_page(html)
        out = OUT / rel_dir / "index.md"
        url = f"{BASE_URL}/user/{filename}"
        write_page_md(out, parsed, url)
        print(f"[main] {label} -> {out.relative_to(OUT)}")


def iter_detail_files(prefix: str):
    for p in sorted(DETAILS.glob(f"{prefix}*.html")):
        yield p


def handle_detail_pages() -> None:
    # Character details
    for p in iter_detail_files("character-detail.php_id-"):
        m = re.search(r"id-(\d+)", p.name)
        if not m:
            continue
        char_id = m.group(1)
        parsed = parse_page(p)
        out = OUT / "personnages" / "fiches" / f"character-{char_id}.md"
        url = f"{BASE_URL}/user/character-detail.php?id={char_id}"
        write_page_md(out, parsed, url)
    # Play/places
    for p in iter_detail_files("play.php_place-id-"):
        m = re.search(r"place-id-(\d+)", p.name)
        if not m:
            continue
        place_id = m.group(1)
        parsed = parse_page(p)
        out = OUT / "monde" / "lieux" / f"place-{place_id}.md"
        url = f"{BASE_URL}/user/play.php?place-id={place_id}"
        write_page_md(out, parsed, url)
    # City maps
    for p in iter_detail_files("city-map.php_id-"):
        m = re.search(r"id-(\d+)", p.name)
        if not m:
            continue
        cid = m.group(1)
        parsed = parse_page(p)
        out = OUT / "monde" / "villes" / f"city-{cid}.md"
        url = f"{BASE_URL}/user/city-map.php?id={cid}"
        write_page_md(out, parsed, url)
    # Land maps
    for p in iter_detail_files("land-map.php_id-"):
        m = re.search(r"id-(\d+)", p.name)
        if not m:
            continue
        lid = m.group(1)
        parsed = parse_page(p)
        out = OUT / "monde" / "regions" / f"land-{lid}.md"
        url = f"{BASE_URL}/user/land-map.php?id={lid}"
        write_page_md(out, parsed, url)
    # Fight
    for p in iter_detail_files("fight.php"):
        parsed = parse_page(p)
        out = OUT / "outils" / "combat" / p.name.replace(".html", ".md")
        url = f"{BASE_URL}/user/" + p.name.replace(".html", "").replace("_", "?", 1).replace("-", "=", 1)
        write_page_md(out, parsed, url)


def build_index() -> None:
    # Collect all markdown files under OUT (excluding raw-html/ and this script)
    lines = ["# Knight and Wizard — Parse du site\n",
             f"Source : {BASE_URL}/\n",
             f"Nombre de pages parsées : voir ci-dessous\n\n",
             "## Sections principales\n"]
    for filename, (rel_dir, label) in SECTIONS.items():
        p = OUT / rel_dir / "index.md"
        if p.exists():
            rel = p.relative_to(OUT).as_posix()
            lines.append(f"- [{label}]({rel})")
    lines.append("\n## Personnages\n")
    fiches = sorted((OUT / "personnages" / "fiches").glob("character-*.md"))
    for f in fiches:
        rel = f.relative_to(OUT).as_posix()
        lines.append(f"- [{f.stem}]({rel})")
    lines.append("\n## Monde : Lieux\n")
    lieux = sorted((OUT / "monde" / "lieux").glob("place-*.md"))
    for f in lieux:
        rel = f.relative_to(OUT).as_posix()
        lines.append(f"- [{f.stem}]({rel})")
    lines.append("\n## Monde : Villes\n")
    for f in sorted((OUT / "monde" / "villes").glob("city-*.md")):
        rel = f.relative_to(OUT).as_posix()
        lines.append(f"- [{f.stem}]({rel})")
    lines.append("\n## Monde : Regions\n")
    for f in sorted((OUT / "monde" / "regions").glob("land-*.md")):
        rel = f.relative_to(OUT).as_posix()
        lines.append(f"- [{f.stem}]({rel})")
    (OUT / "INDEX.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    handle_main_pages()
    handle_detail_pages()
    build_index()
    print("Done.")


if __name__ == "__main__":
    main()
