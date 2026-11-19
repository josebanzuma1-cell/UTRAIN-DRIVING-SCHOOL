"""Copy index.html's header, nav, drawer, footer and call bar onto every other page.

The site is plain static HTML with no build step, which means the navigation and
footer are physically repeated in each file. Rather than editing seven copies by
hand, edit index.html and run:

    python tools/sync-chrome.py

Each page keeps its own <main>, its own <title>, description, canonical and any
robots meta tag. Only the markup OUTSIDE <main> is replaced.

Run it from the project root. It prints what it changed and touches nothing else.
"""
import io
import os
import re
import sys

PAGES = ["about.html", "courses.html", "permits.html", "enroll.html", "contact.html", "404.html"]
OPEN, CLOSE = '<main id="main">', "</main>"

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(name):
    return io.open(os.path.join(root, name), encoding="utf-8").read()


def write(name, text):
    io.open(os.path.join(root, name), "w", encoding="utf-8", newline="\n").write(text)


def grab(pattern, text, default=""):
    m = re.search(pattern, text, re.S)
    return m.group(1) if m else default


index = read("index.html")
if OPEN not in index or CLOSE not in index:
    sys.exit("index.html no longer contains <main id=\"main\"> ... </main>")

head = index.split(OPEN)[0]
tail = index.split(CLOSE, 1)[1]

changed = 0
for page in PAGES:
    path = os.path.join(root, page)
    if not os.path.exists(path):
        print("skip (missing):", page)
        continue

    old = read(page)
    if OPEN not in old or CLOSE not in old:
        print("skip (no <main>):", page)
        continue

    body = old.split(OPEN, 1)[1].rsplit(CLOSE, 1)[0]

    title = grab(r"<title>(.*?)</title>", old)
    desc = grab(r'<meta name="description" content="(.*?)">', old)
    canon = grab(r'(<link rel="canonical" href="[^"]*">)', old)
    robots = grab(r'(<meta name="robots" content="[^"]*">)', old)
    og_t = grab(r'<meta property="og:title" content="(.*?)">', old)
    og_d = grab(r'<meta property="og:description" content="(.*?)">', old)

    h = head
    h = re.sub(r"<title>.*?</title>", lambda m: "<title>%s</title>" % title, h, count=1, flags=re.S)
    h = re.sub(r'(<meta name="description" content=")(.*?)(">)',
               lambda m: m.group(1) + desc + m.group(3), h, count=1, flags=re.S)
    h = re.sub(r'<link rel="canonical" href="[^"]*">', lambda m: (canon or robots), h, count=1)
    if og_t:
        h = re.sub(r'(<meta property="og:title" content=")(.*?)(">)',
                   lambda m: m.group(1) + og_t + m.group(3), h, count=1, flags=re.S)
    if og_d:
        h = re.sub(r'(<meta property="og:description" content=")(.*?)(">)',
                   lambda m: m.group(1) + og_d + m.group(3), h, count=1, flags=re.S)

    # mark the active item in the nav and the drawer, nowhere else
    h = h.replace(' aria-current="page"', "")
    if page != "404.html":
        h = h.replace('href="%s"' % page, 'href="%s" aria-current="page"' % page)
    h = h.replace('<a class="brand" href="index.html" aria-current="page"',
                  '<a class="brand" href="index.html"')

    new = h + OPEN + body + CLOSE + tail
    if new != old:
        write(page, new)
        changed += 1
        print("updated", page)
    else:
        print("unchanged", page)

print("\n%d page(s) updated." % changed)
