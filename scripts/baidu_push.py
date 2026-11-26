#!/usr/bin/env python3
"""Push URLs to Baidu Search Resource Platform.

The token is read from BAIDU_PUSH_TOKEN and is never written to disk.
Baidu's quota is small (often 6 URLs/day for a new site), so URLs are pushed
one at a time and the script stops as soon as the API reports no quota left.

Usage:
  BAIDU_PUSH_TOKEN=xxxx python3 scripts/baidu_push.py \
      --file scripts/baidu_priority_urls.txt --max 6

  # dry run: print what would be pushed
  python3 scripts/baidu_push.py --file scripts/baidu_priority_urls.txt --dry-run
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


def read_urls(path):
    urls = []
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            urls.append(line)
    # de-duplicate while preserving order
    seen = set()
    out = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out


def push(site, token, urls):
    endpoint = "http://data.zz.baidu.com/urls?" + urllib.parse.urlencode(
        {"site": site, "token": token}
    )
    body = "\n".join(urls).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=body,
        headers={"Content-Type": "text/plain"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description="Push URLs to Baidu")
    parser.add_argument(
        "--file",
        default="scripts/baidu_priority_urls.txt",
        help="text file with one URL per line",
    )
    parser.add_argument("--max", type=int, default=6, help="maximum URLs per run")
    parser.add_argument("--start", type=int, default=0, help="start offset in the list")
    parser.add_argument(
        "--site",
        default=os.environ.get("BAIDU_SITE", "https://www.qixuan.vip"),
        help="verified site, e.g. https://www.qixuan.vip",
    )
    parser.add_argument(
        "--token",
        default=os.environ.get("BAIDU_PUSH_TOKEN", ""),
        help="Baidu push token (prefer BAIDU_PUSH_TOKEN env var)",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not os.path.exists(args.file):
        print("URL list not found: %s" % args.file)
        return 1

    urls = read_urls(args.file)
    if not urls:
        print("No URLs in %s" % args.file)
        return 1

    start = args.start % len(urls)
    urls = urls[start:] + urls[:start]
    selected = urls[: args.max]

    print("Site: %s" % args.site)
    print("URLs selected: %d" % len(selected))
    for url in selected:
        print("  - %s" % url)

    if args.dry_run:
        print("Dry run only; nothing pushed.")
        return 0

    if not args.token:
        print("BAIDU_PUSH_TOKEN is not set; skipping push (this is not an error).")
        return 0

    pushed = 0
    failed = 0
    remain = None

    for url in selected:
        try:
            result = push(args.site, args.token, [url])
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", "replace")
            print("HTTP %s for %s: %s" % (exc.code, url, body))
            try:
                data = json.loads(body)
            except Exception:
                data = {}
            if data.get("message") == "over quota":
                print("Baidu quota exhausted; stopping this run.")
                break
            if data.get("message") == "site init fail":
                print("Baidu site is not ready or quota is unavailable; stopping this run.")
                break
            if data.get("message") == "token is not valid":
                print("Baidu token is invalid; stopping this run.")
                return 1
            failed += 1
            continue
        except Exception as exc:
            print("Request failed for %s: %s" % (url, exc))
            failed += 1
            continue

        if "remain" in result:
            remain = result["remain"]
        success = result.get("success", 0)
        if success:
            pushed += success
            print("OK  %s (remain=%s)" % (url, remain))
        else:
            failed += 1
            print("ERR %s -> %s" % (url, json.dumps(result, ensure_ascii=False)))

        if remain == 0:
            print("Baidu quota is now 0; stopping this run.")
            break

    print("Done. pushed=%d failed=%d remain=%s" % (pushed, failed, remain))
    return 0


if __name__ == "__main__":
    sys.exit(main())
