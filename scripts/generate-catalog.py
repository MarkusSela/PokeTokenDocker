#!/usr/bin/env python3
"""Generate the shipped National Dex catalog from the public PokéAPI."""
from __future__ import annotations

import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

API = "https://pokeapi.co/api/v2"
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "pokemon-catalog-national-dex.json"
MAX_SPECIES = 1025
WORKERS = 16


def get_json(url: str, attempts: int = 5):
    last = None
    for attempt in range(attempts):
        try:
            request = Request(url, headers={"User-Agent": "PokeTokenDocker catalog generator"})
            with urlopen(request, timeout=30) as response:
                return json.load(response)
        except (HTTPError, URLError, TimeoutError, OSError) as error:
            last = error
            if attempt + 1 < attempts:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"request failed: {url}: {last}")


def fetch_all(urls: list[str], label: str) -> list[dict]:
    values: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(get_json, url): url for url in urls}
        for index, future in enumerate(as_completed(futures), start=1):
            url = futures[future]
            values[url] = future.result()
            if index % 100 == 0 or index == len(urls):
                print(f"{label}: {index}/{len(urls)}", file=sys.stderr)
    return [values[url] for url in urls]


def species_id(url: str) -> int:
    return int(url.rstrip("/").split("/")[-1])


def tree_node(link: dict) -> dict:
    return {
        "id": species_id(link["species"]["url"]),
        "children": [tree_node(child) for child in link.get("evolves_to", [])],
    }


def paths(node: dict) -> list[list[int]]:
    if not node["children"]:
        return [[node["id"]]]
    result: list[list[int]] = []
    for child in node["children"]:
        result.extend([[node["id"], *path] for path in paths(child)])
    return result


def rarity(capture_rate: int, legendary: bool, mythical: bool) -> str:
    if legendary or mythical:
        return "legendary"
    if capture_rate <= 45:
        return "rare"
    if capture_rate <= 120:
        return "uncommon"
    return "common"


def main() -> None:
    listing = get_json(f"{API}/pokemon-species?limit=2000")
    species_urls = sorted(
        (item["url"] for item in listing["results"] if 1 <= species_id(item["url"]) <= MAX_SPECIES),
        key=species_id,
    )
    if len(species_urls) != MAX_SPECIES:
        raise RuntimeError(f"expected {MAX_SPECIES} species URLs, got {len(species_urls)}")

    species_rows = fetch_all(species_urls, "species")
    by_id = {int(row["id"]): row for row in species_rows}
    chain_urls = sorted({row["evolution_chain"]["url"] for row in species_rows})
    chain_rows = fetch_all(chain_urls, "chains")

    lines_by_species: dict[int, dict] = {}
    for chain in chain_rows:
        root = tree_node(chain["chain"])
        chain_paths = paths(root)
        root_id = root["id"]
        root_meta = by_id[root_id]
        capture_rate = int(root_meta.get("capture_rate") or 0)
        line_rarity = rarity(
            capture_rate,
            bool(root_meta.get("is_legendary")),
            bool(root_meta.get("is_mythical")),
        )
        names: dict[str, dict[str, str]] = {}
        for path in chain_paths:
            for current_id in path:
                meta = by_id[current_id]
                translated = {
                    item["language"]["name"]: item["name"]
                    for item in meta.get("names", [])
                    if item["language"]["name"] in {"en", "it"}
                }
                english = translated.get("en") or meta["name"].replace("-", " ").title()
                names[str(current_id)] = {"en": english, "it": translated.get("it", english)}
        line = {
            "baseId": root_id,
            "pathOptions": chain_paths,
            "pathIds": chain_paths[0],
            "rarity": line_rarity,
            "names": names,
            "captureRate": capture_rate,
        }
        for path in chain_paths:
            for current_id in path:
                lines_by_species[current_id] = line

    catalog = []
    for current_id in range(1, MAX_SPECIES + 1):
        meta = by_id[current_id]
        line = lines_by_species.get(current_id)
        if line is None:
            raise RuntimeError(f"missing evolution line for {current_id}")
        catalog.append({
            "id": current_id,
            "captureRate": line["captureRate"],
            "rarity": line["rarity"],
            "line": line,
        })

    OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT}", file=sys.stderr)
    print(f"species={len(catalog)} chains={len(chain_urls)}", file=sys.stderr)


if __name__ == "__main__":
    main()
